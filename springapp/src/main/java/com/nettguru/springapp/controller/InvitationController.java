
package com.nettguru.springapp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nettguru.springapp.dto.InvitationRegistrationRequest;
import com.nettguru.springapp.dto.InvitationRegistrationResponse;
import com.nettguru.springapp.dto.InvitationRequest;
import com.nettguru.springapp.dto.InvitationResponse;
import com.nettguru.springapp.service.InvitationOtpService;
import com.nettguru.springapp.service.InvitationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;
    private final InvitationOtpService invitationOtpService;

    public InvitationController(
            InvitationService invitationService,
            InvitationOtpService invitationOtpService) {
        this.invitationService = invitationService;
        this.invitationOtpService = invitationOtpService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse sendInvitation(
            @Valid @RequestBody InvitationRequest request) {

        return invitationService.sendInvitation(request);
    }

    @GetMapping
    public List<InvitationResponse> getInvitations() {
        return invitationService.getInvitations();
    }

    @GetMapping("/validate")
    public InvitationResponse validateInvitation(
            @RequestParam("token") String token) {

        return invitationService.validateInvitation(token);
    }

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(
            @RequestBody Map<String, String> request) {

        invitationOtpService.sendOtp(request.get("token"));

        return Map.of(
                "message",
                "OTP sent successfully. You can request another after 90 seconds.");
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(
            @RequestBody Map<String, String> request) {

        invitationOtpService.verifyOtp(
                request.get("token"),
                request.get("otp"));

        return Map.of(
                "message",
                "Email verified successfully.");
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationRegistrationResponse registerFromInvitation(
            @Valid @RequestBody InvitationRegistrationRequest request) {

        return invitationService.registerFromInvitation(request);
    }

    /*
     * Keep the old endpoint temporarily for compatibility.
     * It no longer accepts invitations without registration.
     */
    @PostMapping("/accept")
    public InvitationResponse acceptInvitation(
            @RequestBody Map<String, String> request) {

        return invitationService.acceptInvitation(request.get("token"));
    }
}
