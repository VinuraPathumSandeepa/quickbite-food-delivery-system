# Initial Admin account

The backend creates an Admin account at startup only when both
`QUICKBITE_BOOTSTRAP_ADMIN_EMAIL` and `QUICKBITE_BOOTSTRAP_ADMIN_PASSWORD_HASH`
are set. The password hash must be BCrypt. The process checks for an existing
Admin and for an email already owned by another user. A TiDB cluster-wide named
lock serializes competing startup attempts. Normal startup makes no bootstrap
database calls when the variables are absent.

No Admin creation endpoint exists. Public registration accepts only Customer and
Delivery roles; an `ADMIN` role in a registration request is rejected.

## Owner workflow

1. Deploy the updated executable JAR to the existing Azure App Service. Confirm
   that the application is healthy before setting bootstrap variables.
2. Install Azure CLI if needed, run `az login`, and select the intended
   subscription with `az account set --subscription <subscription-id>`.
3. In PowerShell 7, from the repository root, run:

   ```powershell
   pwsh -File .\scripts\Bootstrap-Admin.ps1 -SubscriptionId <subscription-id>
   ```

   The script verifies the App Service, Java 25 runtime, and presence of the
   existing database settings without printing their values. It prompts for an
   email and a hidden password of at least 12 characters, generates BCrypt
   locally using the backend dependency, and sends the email and hash to Azure
   through the management HTTPS API. It then checks Admin login over HTTPS,
   removes both temporary settings, waits for the App Service restart, and
   checks login again. Azure retains the temporary hash in its app configuration
   until removal succeeds; use a fresh password that is not used elsewhere.
4. If cleanup is interrupted or fails, run:

   ```powershell
   pwsh -File .\scripts\Bootstrap-Admin.ps1 -SubscriptionId <subscription-id> -Remove
   ```

   This removes the two bootstrap settings without asking for the password.

The script never writes the plaintext password to disk or passes the password
or hash as a command-line argument. Do not turn on PowerShell tracing or
transcripts for this one-time run, and do not share its in-memory Azure access
token or settings through debugging tools.

## Deployment command, after approval

Build from `backend` with `./mvnw.cmd -B clean package` using Java 25. Deploy the
resulting `backend/target/backend-0.0.1-SNAPSHOT.jar` from the repository root:

```powershell
az webapp deploy --resource-group quickbite-rg --name quickbite-api-vinura --src-path .\backend\target\backend-0.0.1-SNAPSHOT.jar --type jar
```

Check the existing App Service runtime and database setting **names** before
deploying. A Git push alone does not update the running Azure JAR.

## Existing authorization limitation

The current backend permits all HTTP requests in `SecurityConfig`; its login
response and frontend route guard do not authorize backend API calls. This
bootstrap change does not alter that behavior. Treat server-side authorization
as a separate production security task before relying on the Admin dashboard
to protect data or mutations.
