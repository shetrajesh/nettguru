
package com.nettguru.springapp.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nettguru.springapp.dto.InvitationRequest;
import com.nettguru.springapp.dto.TeamMemberRequestDto;
import com.nettguru.springapp.dto.TeamMemberResponseDto;
import com.nettguru.springapp.entity.AdminUser;
import com.nettguru.springapp.entity.TeamMember;
import com.nettguru.springapp.repository.AdminUserRepository;
import com.nettguru.springapp.repository.TeamMemberRepository;

@Service
@Transactional
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final AdminUserRepository adminUserRepository;
    private final InvitationService invitationService;

    public TeamMemberService(
            TeamMemberRepository teamMemberRepository,
            AdminUserRepository adminUserRepository,
            InvitationService invitationService) {
        this.teamMemberRepository = teamMemberRepository;
        this.adminUserRepository = adminUserRepository;
        this.invitationService = invitationService;
    }

    // Invite a new team member
    public TeamMemberResponseDto inviteTeamMember(
            TeamMemberRequestDto request) {

        String email = normalizeEmail(request.getEmail());

        if (teamMemberRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A team member with this email already exists."
            );
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You must be logged in to invite a team member."
            );
        }

        TeamMember member = new TeamMember();
        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setEmail(email);
        member.setRole(request.getRole().trim());
        member.setStatus("Invited");
        member.setInvitationStatus("Pending");

        TeamMember saved = teamMemberRepository.save(member);

        InvitationRequest invitationRequest = new InvitationRequest();
        invitationRequest.setName(
                saved.getFirstName() + " " + saved.getLastName()
        );
        invitationRequest.setEmail(saved.getEmail());
        invitationRequest.setInviteType("TEAM");
        invitationRequest.setInvitedBy(authentication.getName());

        invitationService.sendInvitation(invitationRequest);

        return mapToResponse(saved);
    }

    // Retrieve all team members
    @Transactional(readOnly = true)
    public List<TeamMemberResponseDto> getAllTeamMembers() {
        return teamMemberRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Retrieve one team member
    @Transactional(readOnly = true)
    public TeamMemberResponseDto getTeamMemberById(Long id) {
        TeamMember member = findTeamMember(id);
        return mapToResponse(member);
    }

    // Update team member details without sending another invitation
    public TeamMemberResponseDto updateTeamMember(
            Long id, TeamMemberRequestDto request) {

        TeamMember member = findTeamMember(id);
        String email = normalizeEmail(request.getEmail());

        teamMemberRepository.findByEmailIgnoreCase(email)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Another team member already uses this email."
                        );
                    }
                });

        String oldEmail = normalizeEmail(member.getEmail());

        // Changing an email could break the link to an existing account
        // or invitation, so require a separate account-email workflow.
        if (!oldEmail.equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Changing a team member's email is not supported here. "
                    + "Edit the name or role instead."
            );
        }

        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setRole(request.getRole().trim());

        // Preserve status, invitation status, last sign-in and created date.
        return mapToResponse(teamMemberRepository.save(member));
    }

    // Delete the team-member row and its matching TEAM login account.
    // Both operations run in the same transaction.
    public void deleteTeamMember(Long id) {
        TeamMember member = findTeamMember(id);
        String email = normalizeEmail(member.getEmail());

        AdminUser teamAccount = adminUserRepository
                .findByEmailIgnoreCaseAndRoleIgnoreCase(email, "TEAM")
                .orElse(null);

        // Delete the portal account only if it is explicitly a TEAM account.
        // A CLIENT or ADMIN account with the same email is left untouched.
        if (teamAccount != null) {
            adminUserRepository.delete(teamAccount);
            adminUserRepository.flush();
        }

        teamMemberRepository.delete(member);
        teamMemberRepository.flush();
    }

    private TeamMember findTeamMember(Long id) {
        return teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team member not found."
                ));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required."
            );
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private TeamMemberResponseDto mapToResponse(TeamMember member) {
        return new TeamMemberResponseDto(
                member.getId(),
                member.getFirstName(),
                member.getLastName(),
                member.getEmail(),
                member.getRole(),
                member.getStatus(),
                member.getInvitationStatus(),
                member.getLastSignIn(),
                member.getCreatedAt()
        );
    }
}
