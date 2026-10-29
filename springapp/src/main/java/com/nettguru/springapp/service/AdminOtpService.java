
package com.nettguru.springapp.service;

import com.nettguru.springapp.entity.AdminLoginOtp;
import com.nettguru.springapp.entity.AdminUser;
import com.nettguru.springapp.repository.AdminLoginOtpRepository;
import com.nettguru.springapp.repository.AdminUserRepository;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminOtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final AdminLoginOtpRepository otpRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final SecureRandom secureRandom = new SecureRandom();

    public AdminOtpService(
            AdminLoginOtpRepository otpRepository,
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher) {
        this.otpRepository = otpRepository;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void generateAndSendOtp(String email) {
        AdminUser admin = adminUserRepository
                .findByEmailIgnoreCase(email.trim())
                .filter(admin1 -> admin1.isEnabled())
                .orElseThrow(() ->
                        new IllegalArgumentException("Unable to initiate login."));

        // Invalidate previous unused OTPs.
        List<AdminLoginOtp> previousOtps =
                otpRepository.findByAdminUserIdAndUsedFalse(admin.getId());

        for (AdminLoginOtp previous : previousOtps) {
            previous.setUsed(true);
        }
        otpRepository.saveAll(previousOtps);

        // Generate a cryptographically secure six-digit code.
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

        AdminLoginOtp record = new AdminLoginOtp();
        record.setAdminUser(admin);
        record.setOtpHash(passwordEncoder.encode(otp));
        record.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        record.setAttempts(0);
        record.setUsed(false);

        otpRepository.save(record);

        eventPublisher.publishEvent(
                new AdminOtpEmailService.OtpEmailRequested(admin.getEmail(), otp));
    }

    @Transactional
    public boolean verifyOtp(String email, String submittedOtp) {
        if (email == null || submittedOtp == null
                || !submittedOtp.matches("\\d{6}")) {
            return false;
        }

        AdminUser admin = adminUserRepository
                .findByEmailIgnoreCase(email.trim())
                .filter(eligibleAdmin -> eligibleAdmin.isEnabled())
                .orElse(null);

        if (admin == null) {
            return false;
        }

        AdminLoginOtp record = otpRepository
                .findTopByAdminUserIdAndUsedFalseOrderByCreatedAtDesc(admin.getId())
                .orElse(null);

        if (record == null || record.isUsed()) {
            return false;
        }

        if (!record.getExpiresAt().isAfter(LocalDateTime.now())) {
            record.setUsed(true);
            otpRepository.save(record);
            return false;
        }

        if (record.getAttempts() >= MAX_ATTEMPTS) {
            record.setUsed(true);
            otpRepository.save(record);
            return false;
        }

        record.setAttempts(record.getAttempts() + 1);

        if (!passwordEncoder.matches(submittedOtp, record.getOtpHash())) {
            if (record.getAttempts() >= MAX_ATTEMPTS) {
                record.setUsed(true);
            }
            otpRepository.save(record);
            return false;
        }

        record.setUsed(true);
        otpRepository.save(record);
        return true;
    }
}
