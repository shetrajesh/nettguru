
package com.nettguru.springapp.dto;

import java.time.Instant;

public class InvitationResponse {

    private Long id;
    private String name;
    private String inviteType;
    private String email;
    private String status;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant acceptedAt;

    public InvitationResponse() {
    }

    public InvitationResponse(
            Long id,
            String name,
            String inviteType,
            String email,
            String status,
            Instant createdAt,
            Instant expiresAt,
            Instant acceptedAt) {
        this.id = id;
        this.name = name;
        this.inviteType = inviteType;
        this.email = email;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.acceptedAt = acceptedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInviteType() {
        return inviteType;
    }

    public void setInviteType(String inviteType) {
        this.inviteType = inviteType;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}
