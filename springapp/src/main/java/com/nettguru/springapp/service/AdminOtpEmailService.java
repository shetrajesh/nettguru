
package com.nettguru.springapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
public class AdminOtpEmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(AdminOtpEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public AdminOtpEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendOtp(OtpEmailRequested event) {
        SimpleMailMessage message = new SimpleMailMessage();
        logger.info("OTP sender email configured: {}",
        senderEmail != null && !senderEmail.isBlank());
        message.setFrom(senderEmail);
        message.setTo(event.recipientEmail());
        message.setSubject("NettGuru Admin Login Verification");
        message.setText(
            "Your NettGuru admin login verification code is: " + event.otp()
            + "\n\nThis code expires in 5 minutes."
            + "\nDo not share this code with anyone."
            + "\n\nIf you did not attempt to log in, you can ignore this email."
        );

        try {
            mailSender.send(message);
        } catch (RuntimeException exception) {
            logger.error("Failed to send admin login OTP email.", exception);
            throw exception;
        }
    }

    public record OtpEmailRequested(String recipientEmail, String otp) {
    }
}
