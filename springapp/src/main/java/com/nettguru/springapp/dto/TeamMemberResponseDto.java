
package com.nettguru.springapp.dto;

import java.time.Instant;

public class TeamMemberResponseDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String status;
    private String invitationStatus;
    private Instant lastSignIn;
    private Instant createdAt;

    public TeamMemberResponseDto() {
    }

    public TeamMemberResponseDto(
            Long id,
            String firstName,
            String lastName,
            String email,
            String role,
            String status,
            String invitationStatus,
            Instant lastSignIn,
            Instant createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.invitationStatus = invitationStatus;
        this.lastSignIn = lastSignIn;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInvitationStatus() {
        return invitationStatus;
    }

    public void setInvitationStatus(String invitationStatus) {
        this.invitationStatus = invitationStatus;
    }

    public Instant getLastSignIn() {
        return lastSignIn;
    }

    public void setLastSignIn(Instant lastSignIn) {
        this.lastSignIn = lastSignIn;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
