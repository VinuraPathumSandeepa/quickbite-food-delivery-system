package com.fooddelivery.backend.service;

import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.regex.Pattern;

@Component
public class InitialAdminBootstrap implements ApplicationRunner {

    private static final String LOCK_NAME = "quickbite_initial_admin";
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern BCRYPT = Pattern.compile("^\\$2[aby]\\$(?:1[0-9]|2[0-9]|3[01])\\$[./A-Za-z0-9]{53}$");

    private final String email;
    private final String passwordHash;
    private final DataSource dataSource;
    private final UserRepository users;
    private final TransactionTemplate transactions;

    public InitialAdminBootstrap(
            @Value("${QUICKBITE_BOOTSTRAP_ADMIN_EMAIL:}") String email,
            @Value("${QUICKBITE_BOOTSTRAP_ADMIN_PASSWORD_HASH:}") String passwordHash,
            DataSource dataSource,
            UserRepository users,
            PlatformTransactionManager transactionManager) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.dataSource = dataSource;
        this.users = users;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (email.isEmpty() && passwordHash.isEmpty()) {
            return;
        }
        if (!EMAIL.matcher(email).matches() || email.length() > 255
                || !BCRYPT.matcher(passwordHash).matches()) {
            throw new IllegalStateException("Invalid initial admin bootstrap configuration");
        }

        // TiDB's named locks are cluster-wide. Keep this separate connection open
        // until the JPA transaction has committed, including across app instances.
        try (Connection lockConnection = dataSource.getConnection()) {
            if (!acquireLock(lockConnection)) {
                throw new IllegalStateException("Initial admin bootstrap lock timed out");
            }
            try {
                transactions.executeWithoutResult(status -> {
                    if (users.existsByRole(Role.ADMIN)) {
                        return;
                    }
                    if (users.existsByEmailIgnoreCase(email)) {
                        throw new IllegalStateException("Initial admin email already belongs to an account");
                    }
                    User admin = new User();
                    admin.setFullName("QuickBite Administrator");
                    admin.setEmail(email);
                    admin.setPassword(passwordHash);
                    admin.setRole(Role.ADMIN);
                    admin.setAvailable(true);
                    users.saveAndFlush(admin);
                });
            } finally {
                releaseLock(lockConnection);
            }
        }
    }

    private boolean acquireLock(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("SELECT GET_LOCK(?, 30)")) {
            statement.setString(1, LOCK_NAME);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() && result.getInt(1) == 1 && !result.wasNull();
            }
        }
    }

    private void releaseLock(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("SELECT RELEASE_LOCK(?)")) {
            statement.setString(1, LOCK_NAME);
            statement.executeQuery().close();
        }
    }
}
