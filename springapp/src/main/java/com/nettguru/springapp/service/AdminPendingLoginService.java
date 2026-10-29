
package com.nettguru.springapp.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminPendingLoginService {

    private static final long EXPIRY_SECONDS = 300;

    private final ConcurrentHashMap<String, PendingLogin> pendingLogins =
            new ConcurrentHashMap<>();

    public String create(Authentication authentication) {
        removeExpired();

        String token = UUID.randomUUID().toString();

        pendingLogins.put(
                token,
                new PendingLogin(
                        authentication,
                        Instant.now().plusSeconds(EXPIRY_SECONDS)));

        return token;
    }

    public Authentication consume(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        PendingLogin pending = pendingLogins.remove(token);

        if (pending == null || !pending.expiresAt().isAfter(Instant.now())) {
            return null;
        }

        return pending.authentication();
    }

    private void removeExpired() {
        Instant now = Instant.now();

        pendingLogins.entrySet().removeIf(
                entry -> !entry.getValue().expiresAt().isAfter(now));
    }

    private record PendingLogin(
            Authentication authentication,
            Instant expiresAt) {
    }
}
