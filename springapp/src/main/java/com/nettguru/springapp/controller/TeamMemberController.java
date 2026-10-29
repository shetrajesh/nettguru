
package com.nettguru.springapp.controller;

import com.nettguru.springapp.dto.TeamMemberRequestDto;
import com.nettguru.springapp.dto.TeamMemberResponseDto;
import com.nettguru.springapp.service.TeamMemberService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    public TeamMemberController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMemberResponseDto inviteTeamMember(
            @Valid @RequestBody TeamMemberRequestDto request) {
        return teamMemberService.inviteTeamMember(request);
    }

    @GetMapping
    public List<TeamMemberResponseDto> getAllTeamMembers() {
        return teamMemberService.getAllTeamMembers();
    }

    @GetMapping("/{id}")
    public TeamMemberResponseDto getTeamMemberById(
            @PathVariable Long id) {
        return teamMemberService.getTeamMemberById(id);
    }

    @PutMapping("/{id}")
    public TeamMemberResponseDto updateTeamMember(
            @PathVariable Long id,
            @Valid @RequestBody TeamMemberRequestDto request) {
        return teamMemberService.updateTeamMember(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTeamMember(@PathVariable Long id) {
        teamMemberService.deleteTeamMember(id);
    }
}
