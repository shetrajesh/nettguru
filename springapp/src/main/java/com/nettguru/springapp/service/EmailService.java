
package com.nettguru.springapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvitationEmail(
            String recipientEmail,
            String recipientName,
            String invitationToken,
            String invitationType) {

        String invitationLink = frontendUrl
                + "/accept-invitation?token="
                + invitationToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject("You're invited to NettGuru");

        message.setText(
                "Hello " + recipientName + ",\n\n"
                + "You have been invited to join NettGuru as a "
                + invitationType + ".\n\n"
                + "To accept your invitation and complete registration, "
                + "open this link:\n"
                + invitationLink + "\n\n"
                + "This invitation expires in 72 hours.\n\n"
                + "If you weren't expecting this invitation, you can "
                + "ignore this email.\n\n"
                + "Regards,\n"
                + "NettGuru Team"
        );

        mailSender.send(message);
    }

    public void sendInvitationOtp(
            String recipientEmail,
            String recipientName,
            String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject("Your NettGuru registration verification code");

        message.setText(
                "Hello " + recipientName + ",\n\n"
                + "Your NettGuru registration verification code is: "
                + otp + "\n\n"
                + "This code is valid for 10 minutes and can only be used once.\n\n"
                + "If you did not request this code, you can ignore this email.\n\n"
                + "Regards,\n"
                + "NettGuru Team"
        );

        mailSender.send(message);
    }
}
