
package com.nettguru.springapp.config;

import com.nettguru.springapp.entity.AdminUser;
import com.nettguru.springapp.repository.AdminUserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminAccountInitializer {

    @Bean
    public CommandLineRunner initializeAdminAccount(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.password:}") String adminPassword) {

        return args -> {
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                System.out.println(
                    "Admin bootstrap skipped: app.admin.email or app.admin.password is not configured."
                );
                return;
            }

            String normalizedEmail =
                adminEmail.trim().toLowerCase(Locale.ROOT);

            if (adminUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                System.out.println(
                    "Admin bootstrap skipped: the configured admin account already exists."
                );
                return;
            }

            if (adminPassword.length() < 12) {
                throw new IllegalStateException(
                    "The initial admin password must be at least 12 characters long."
                );
            }

            AdminUser admin = new AdminUser();
            admin.setEmail(normalizedEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            admin.setEnabled(true);

            adminUserRepository.save(admin);

            System.out.println("Initial admin account created successfully.");
        };
    }
}
