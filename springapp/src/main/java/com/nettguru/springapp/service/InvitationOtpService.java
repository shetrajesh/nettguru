
package com.nettguru.springapp.service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nettguru.springapp.entity.Invitation;
import com.nettguru.springapp.repository.InvitationRepository;

@Service
public class InvitationOtpService {

    private static final long RESEND_COOLDOWN_SECONDS = 90;
    private static final long OTP_VALIDITY_SECONDS = 600;

    private final SecureRandom secureRandom = new SecureRandom();

    private final ConcurrentMap<String, OtpEntry> otpEntries =
            new ConcurrentHashMap<>();

    private final InvitationRepository invitationRepository;
    private final EmailService emailService;

    public InvitationOtpService(
            InvitationRepository invitationRepository,
            EmailService emailService) {
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
    }

    public void sendOtp(String token) {
        Invitation invitation = getUsableInvitation(token);
        String key = invitation.getToken();

        Instant now = Instant.now();
        OtpEntry existing = otpEntries.get(key);

        if (existing != null
                && now.isBefore(existing.sentAt.plusSeconds(
                        RESEND_COOLDOWN_SECONDS))) {

            long remaining = RESEND_COOLDOWN_SECONDS
                    - (now.getEpochSecond()
                    - existing.sentAt.getEpochSecond());

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait " + Math.max(1, remaining)
                            + " seconds before requesting another OTP.");
        }

        String otp = String.format(
                "%06d", secureRandom.nextInt(1_000_000));

        OtpEntry entry = new OtpEntry(
                otp,
                now,
                now.plusSeconds(OTP_VALIDITY_SECONDS));

        OtpEntry previous = otpEntries.putIfAbsent(key, entry);

        if (previous != null) {
            if (now.isBefore(previous.sentAt.plusSeconds(
                    RESEND_COOLDOWN_SECONDS))) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Please wait before requesting another OTP.");
            }

            if (!otpEntries.replace(key, previous, entry)) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "An OTP request is already being processed. Please try again.");
            }
        }

        try {
            emailService.sendInvitationOtp(
                    invitation.getEmail(),
                    invitation.getName(),
                    otp);
        } catch (RuntimeException ex) {
            otpEntries.remove(key, entry);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to send the OTP email. Please try again.");
        }
    }

    public void verifyOtp(String token, String submittedOtp) {
        if (submittedOtp == null
                || !submittedOtp.matches("\\d{6}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid 6-digit OTP.");
        }

        Invitation invitation = getUsableInvitation(token);
        String key = invitation.getToken();
        OtpEntry entry = otpEntries.get(key);

        if (entry == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request an OTP before verifying.");
        }

        if (!Instant.now().isBefore(entry.expiresAt)) {
            otpEntries.remove(key, entry);

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "The OTP has expired. Please request a new one.");
        }

        if (entry.verifiedAt != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This OTP has already been verified.");
        }

        boolean matches = MessageDigest.isEqual(
                entry.code.getBytes(
                        java.nio.charset.StandardCharsets.UTF_8),
                submittedOtp.getBytes(
                        java.nio.charset.StandardCharsets.UTF_8));

        if (!matches) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Incorrect OTP. Please try again.");
        }

        entry.verifiedAt = Instant.now();
    }

    public boolean isVerified(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        OtpEntry entry = otpEntries.get(token.trim());

        return entry != null
                && entry.verifiedAt != null
                && Instant.now().isBefore(entry.expiresAt);
    }

    public void consumeVerification(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Verify your email OTP before creating an account.");
        }

        String key = token.trim();
        OtpEntry entry = otpEntries.get(key);

        if (entry == null
                || entry.verifiedAt == null
                || !Instant.now().isBefore(entry.expiresAt)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Verify your email OTP before creating an account.");
        }

        if (!otpEntries.remove(key, entry)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Email verification could not be confirmed. Please verify again.");
        }
    }

    private Invitation getUsableInvitation(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required.");
        }

        Invitation invitation = invitationRepository
                .findByToken(token.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found."));

        if (!"Pending".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation is not available for registration.");
        }

        if (invitation.getExpiresAt() == null
                || !Instant.now().isBefore(invitation.getExpiresAt())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired.");
        }

        return invitation;
    }

    private static final class OtpEntry {
        private final String code;
        private final Instant sentAt;
        private final Instant expiresAt;
        private volatile Instant verifiedAt;

        private OtpEntry(
                String code,
                Instant sentAt,
                Instant expiresAt) {
            this.code = code;
            this.sentAt = sentAt;
            this.expiresAt = expiresAt;
        }
    }
}
