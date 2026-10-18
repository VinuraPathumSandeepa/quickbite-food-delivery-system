#requires -Version 7.0
param(
    [string]$ResourceGroup = 'quickbite-rg',
    [string]$AppName = 'quickbite-api-vinura',
    [string]$SubscriptionId,
    [switch]$Remove
)

$ErrorActionPreference = 'Stop'
$emailKey = 'QUICKBITE_BOOTSTRAP_ADMIN_EMAIL'
$hashKey = 'QUICKBITE_BOOTSTRAP_ADMIN_PASSWORD_HASH'
$settingsChanged = $false
$plainPassword = $null
$passwordHash = $null
$accessToken = $null

function Get-Settings {
    $response = Invoke-RestMethod -Method Post -Uri "$script:settingsUri/list?api-version=2025-03-01" -Headers $script:headers
    return $response.properties
}

function Set-Settings($settings) {
    $body = @{ properties = $settings } | ConvertTo-Json -Depth 10 -Compress
    $null = Invoke-RestMethod -Method Put -Uri "$script:settingsUri`?api-version=2025-03-01" -Headers $script:headers -ContentType 'application/json' -Body $body
}

function Remove-BootstrapSettings {
    $settings = Get-Settings
    $null = $settings.PSObject.Properties.Remove($emailKey)
    $null = $settings.PSObject.Properties.Remove($hashKey)
    Set-Settings $settings
    $remaining = Get-Settings
    if ($remaining.PSObject.Properties.Name -contains $emailKey -or $remaining.PSObject.Properties.Name -contains $hashKey) {
        throw 'Bootstrap settings removal could not be verified.'
    }
    Write-Host 'Temporary bootstrap settings removed.'
}

function Test-AdminLogin {
    $body = @{ email = $script:adminEmail; password = $script:plainPassword } | ConvertTo-Json -Compress
    try {
        $response = Invoke-RestMethod -Method Post -Uri "https://$script:hostName/api/auth/login" -ContentType 'application/json' -Body $body -TimeoutSec 20
        return $response.role -eq 'ADMIN' -and $response.email -eq $script:adminEmail
    } catch {
        return $false
    }
}

function Wait-ForAdminLogin {
    for ($attempt = 1; $attempt -le 24; $attempt++) {
        if (Test-AdminLogin) { return $true }
        Start-Sleep -Seconds 10
    }
    return $false
}

try {
    $azCommand = (Get-Command az -ErrorAction SilentlyContinue | Select-Object -First 1).Source
    if (-not $azCommand) {
        foreach ($candidate in @(
            "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin\az.cmd",
            "${env:ProgramFiles(x86)}\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
        )) {
            if (Test-Path -LiteralPath $candidate) { $azCommand = $candidate; break }
        }
    }
    if (-not $azCommand) {
        throw 'Azure CLI is required. Install it and sign in with az login.'
    }
    $accountJson = & $azCommand account show --output json 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Azure CLI is not authenticated. Run az login.' }
    $account = $accountJson | ConvertFrom-Json
    if ($SubscriptionId -and $account.id -ne $SubscriptionId) {
        throw 'The selected Azure subscription does not match -SubscriptionId.'
    }
    Write-Host "Selected subscription: $($account.name) ($($account.id))"

    $appJson = & $azCommand webapp show --resource-group $ResourceGroup --name $AppName --subscription $account.id --output json 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'The selected App Service could not be found.' }
    $app = $appJson | ConvertFrom-Json
    if ($app.id -notlike "/subscriptions/$($account.id)/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$AppName") {
        throw 'App Service identity did not match the requested target.'
    }
    $script:hostName = $app.defaultHostName
    if (-not $hostName) { throw 'The App Service has no default hostname.' }
    $accessToken = & $azCommand account get-access-token --subscription $account.id --resource-type arm --query accessToken --output tsv 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $accessToken) { throw 'Could not acquire an Azure access token.' }
    $script:headers = @{ Authorization = "Bearer $accessToken" }
    $script:settingsUri = "https://management.azure.com$($app.id)/config/appsettings"
    if ($Remove) {
        Remove-BootstrapSettings
        return
    }
    $runtime = & $azCommand webapp config show --resource-group $ResourceGroup --name $AppName --subscription $account.id --query linuxFxVersion --output tsv 2>$null
    if ($LASTEXITCODE -ne 0 -or $runtime -notmatch 'JAVA.*25') {
        throw 'The App Service is not configured for a Java 25 Linux runtime.'
    }
    Write-Host "Verified App Service: $AppName ($runtime)"
    $settings = Get-Settings
    foreach ($key in @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD')) {
        if (-not ($settings.PSObject.Properties.Name -contains $key) -or -not $settings.$key) {
            throw "Required App Service setting $key is missing."
        }
    }
    Write-Host 'Verified database settings are present; values were not displayed.'

    if ($settings.PSObject.Properties.Name -contains $emailKey -or $settings.PSObject.Properties.Name -contains $hashKey) {
        throw 'Bootstrap settings already exist. Remove them first after verifying the account.'
    }

    $script:adminEmail = (Read-Host 'New Admin email').Trim().ToLowerInvariant()
    if ($adminEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$' -or $adminEmail.Length -gt 255) {
        throw 'Invalid email address.'
    }
    $securePassword = Read-Host 'New Admin password (hidden, at least 12 characters)' -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $script:plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    $securePassword.Dispose()
    if ($plainPassword.Length -lt 12) { throw 'Admin password must have at least 12 characters.' }

    $backend = Join-Path $PSScriptRoot '..\backend'
    $mavenRepository = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.m2\repository'
    Push-Location $backend
    try {
        & .\mvnw.cmd -q "-Dmaven.repo.local=$mavenRepository" -DskipTests package
        if ($LASTEXITCODE -ne 0) { throw 'The backend could not be built for local password hashing.' }
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = 'java'
        $processInfo.ArgumentList.Add('-Dloader.main=com.fooddelivery.backend.service.AdminPasswordHashTool')
        $processInfo.ArgumentList.Add('-cp')
        $processInfo.ArgumentList.Add('target/backend-0.0.1-SNAPSHOT.jar')
        $processInfo.ArgumentList.Add('org.springframework.boot.loader.launch.PropertiesLauncher')
        $processInfo.WorkingDirectory = (Get-Location).Path
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        $processInfo.RedirectStandardInput = $true
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.StandardInputEncoding = New-Object System.Text.UTF8Encoding($false)
        $process = [System.Diagnostics.Process]::Start($processInfo)
        try {
            $process.StandardInput.WriteLine($plainPassword)
            $process.StandardInput.Close()
            $passwordHash = $process.StandardOutput.ReadToEnd()
            $null = $process.StandardError.ReadToEnd()
            $process.WaitForExit()
            if ($process.ExitCode -ne 0 -or $passwordHash -notmatch '^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$') {
                throw 'Local BCrypt hashing failed.'
            }
        } finally {
            $process.Dispose()
        }
    } finally {
        Pop-Location
    }

    $settings | Add-Member -NotePropertyName $emailKey -NotePropertyValue $adminEmail
    $settings | Add-Member -NotePropertyName $hashKey -NotePropertyValue $passwordHash
    $settingsChanged = $true
    Set-Settings $settings
    Write-Host 'Temporary bootstrap settings applied. Waiting for the App Service restart and HTTPS login.'
    if (-not (Wait-ForAdminLogin)) { throw 'Admin login was not verified before the timeout.' }
    Write-Host 'Admin login verified over HTTPS.'
} catch {
    Write-Error 'Bootstrap failed. No secret values were displayed. Check prerequisites and application health.' -ErrorAction Continue
    exit 1
} finally {
    if ($settingsChanged) {
        try {
            Remove-BootstrapSettings
            if (Wait-ForAdminLogin) {
                Write-Host 'Admin login still works after removing settings and restarting.'
            } else {
                Write-Warning 'Login after cleanup was not verified. Check application health.'
            }
        } catch {
            Write-Warning 'Automatic cleanup failed. Run this script with -Remove immediately.'
        }
    }
    $plainPassword = $null
    $passwordHash = $null
    $accessToken = $null
}
