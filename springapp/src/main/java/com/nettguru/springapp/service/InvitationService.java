
package com.nettguru.springapp.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nettguru.springapp.dto.InvitationRegistrationRequest;
import com.nettguru.springapp.dto.InvitationRegistrationResponse;
import com.nettguru.springapp.dto.InvitationRequest;
import com.nettguru.springapp.dto.InvitationResponse;
import com.nettguru.springapp.entity.AdminUser;
import com.nettguru.springapp.entity.Invitation;
import com.nettguru.springapp.entity.TeamMember;
import com.nettguru.springapp.repository.AdminUserRepository;
import com.nettguru.springapp.repository.ClientRepository;
import com.nettguru.springapp.repository.InvitationRepository;
import com.nettguru.springapp.repository.TeamMemberRepository;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final AdminUserRepository adminUserRepository;
    private final ClientRepository clientRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final InvitationOtpService invitationOtpService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.invitation.expiry-hours:72}")
    private long expiryHours;

    public InvitationService(
            InvitationRepository invitationRepository,
            AdminUserRepository adminUserRepository,
            ClientRepository clientRepository,
            TeamMemberRepository teamMemberRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            InvitationOtpService invitationOtpService) {

        this.invitationRepository = invitationRepository;
        this.adminUserRepository = adminUserRepository;
        this.clientRepository = clientRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.invitationOtpService = invitationOtpService;
    }

    @Transactional
    public InvitationResponse sendInvitation(InvitationRequest request) {

        String name = request.getName().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String inviteType = request.getInviteType().trim()
                .toUpperCase(Locale.ROOT);

        if (!inviteType.equals("CLIENT") && !inviteType.equals("TEAM")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation type must be CLIENT or TEAM.");
        }

        String token = generateToken();

        Invitation invitation = new Invitation();
        invitation.setName(name);
        invitation.setEmail(email);
        invitation.setInviteType(inviteType);
        invitation.setInvitedBy(request.getInvitedBy().trim());
        invitation.setToken(token);
        invitation.setStatus("Pending");
        invitation.setCreatedAt(Instant.now());
        invitation.setExpiresAt(
                Instant.now().plus(expiryHours, ChronoUnit.HOURS));

        Invitation saved = invitationRepository.save(invitation);

        try {
            emailService.sendInvitationEmail(
                    saved.getEmail(),
                    saved.getName(),
                    saved.getToken(),
                    saved.getInviteType());
        } catch (RuntimeException ex) {
            System.err.println("Failed to send invitation email:");
            ex.printStackTrace();

            invitationRepository.delete(saved);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "The invitation could not be emailed. Please check the backend console.");
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> getInvitations() {
        return invitationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvitationResponse validateInvitation(String token) {

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required.");
        }

        Invitation invitation = invitationRepository.findByToken(token.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found."));

        validateInvitationIsUsable(invitation);

        return toResponse(invitation);
    }

    @Transactional
    public InvitationRegistrationResponse registerFromInvitation(
            InvitationRegistrationRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration details are required.");
        }

        String token = request.getToken();

        String email = request.getEmail() == null
                ? ""
                : request.getEmail().trim().toLowerCase(Locale.ROOT);

        String fullName = request.getFullName() == null
                ? ""
                : request.getFullName().trim();

        String password = request.getPassword();

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required.");
        }

        token = token.trim();

        if (email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required.");
        }

        if (fullName.length() < 2 || fullName.length() > 200) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Full name must be between 2 and 200 characters.");
        }

        if (password == null || password.length() < 8
                || password.length() > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be between 8 and 72 characters.");
        }

        Invitation invitation = invitationRepository
                .findByTokenForUpdate(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found."));

        validateInvitationIsUsable(invitation);

        if (!invitation.getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "The email address does not match this invitation.");
        }

        String inviteType = invitation.getInviteType()
                .toUpperCase(Locale.ROOT);

        if (!inviteType.equals("CLIENT") && !inviteType.equals("TEAM")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This invitation type is not supported for registration.");
        }

        /*
         * SECURITY CHECK:
         * Email OTP verification is required before account creation.
         * This backend check cannot be bypassed by skipping the frontend.
         */
        if (!invitationOtpService.isVerified(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Verify your email OTP before creating an account.");
        }

        /*
         * Keep CLIENT, TEAM, and ADMIN accounts separate.
         * An existing account cannot be reused or converted through an
         * invitation. Do not create a duplicate account for the same email.
         */
        if (adminUserRepository.existsByEmailIgnoreCase(email)) {

            if ("TEAM".equals(inviteType)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This email is already registered to a portal account. "
                                + "TEAM invitations require an email address "
                                + "that is not already registered. "
                                + "Existing CLIENT, TEAM, and ADMIN accounts "
                                + "cannot be reused or converted.");
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email is already registered to a portal account. "
                            + "CLIENT invitations require an email address "
                            + "that is not already registered. "
                            + "Existing accounts cannot be duplicated.");
        }

        AdminUser account = new AdminUser();
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(password));

        // Invitations must never create administrator accounts.
        account.setRole(inviteType);
        account.setEnabled(true);

        adminUserRepository.saveAndFlush(account);

        invitation.setStatus("Accepted");
        invitation.setAcceptedAt(Instant.now());
        invitationRepository.saveAndFlush(invitation);

        /*
         * Consume the verified OTP after account creation and invitation
         * acceptance have been persisted successfully.
         */
        invitationOtpService.consumeVerification(token);

        // Synchronize the existing client record, if present.
        if ("CLIENT".equals(inviteType)) {
            clientRepository.findByEmailIgnoreCase(email)
                    .ifPresent(client -> {
                        client.setInvitationStatus("Accepted");
                        clientRepository.saveAndFlush(client);
                    });
        }

        // Synchronize the existing team member record, if present.
        if ("TEAM".equals(inviteType)) {
            Optional<TeamMember> teamMemberResult =
                    teamMemberRepository.findByEmailIgnoreCase(email);

            if (teamMemberResult.isPresent()) {
                TeamMember member = teamMemberResult.get();

                member.setInvitationStatus("Accepted");
                member.setStatus("Active");

                teamMemberRepository.saveAndFlush(member);
            }
        }

        return new InvitationRegistrationResponse(
                "Registration successful.",
                email,
                inviteType);
    }

    /*
     * Kept for compatibility with the existing controller.
     * Registration must use registerFromInvitation().
     */
    @Transactional
    public InvitationResponse acceptInvitation(String token) {

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required.");
        }

        Invitation invitation = invitationRepository
                .findByTokenForUpdate(token.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found."));

        validateInvitationIsUsable(invitation);

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please complete registration to accept this invitation.");
    }

    private void validateInvitationIsUsable(Invitation invitation) {

        if ("Accepted".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation has already been accepted.");
        }

        if (invitation.getExpiresAt() == null
                || !invitation.getExpiresAt().isAfter(Instant.now())) {

            invitation.setStatus("Expired");

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired.");
        }

        if (!"Pending".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation is not available for registration.");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private InvitationResponse toResponse(Invitation invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getName(),
                invitation.getInviteType(),
                invitation.getEmail(),
                invitation.getStatus(),
                invitation.getCreatedAt(),
                invitation.getExpiresAt(),
                invitation.getAcceptedAt());
    }
}
