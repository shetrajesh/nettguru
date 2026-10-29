
package com.nettguru.springapp.dto;

import java.time.Instant;

public class ClientResponseDto {

    private Long id;
    private String legalName;
    private String displayName;
    private String businessType;
    private String timeZone;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String primaryAssociate;
    private String backupAssociate;
    private String stage;
    private String status;
    private Instant dueDate;
    private Integer openItems;
    private Instant lastActivity;
    private String invitationStatus;
    private Instant createdAt;

    public ClientResponseDto() {
    }

    public ClientResponseDto(
            Long id,
            String legalName,
            String displayName,
            String businessType,
            String timeZone,
            String firstName,
            String lastName,
            String email,
            String mobileNumber,
            String primaryAssociate,
            String backupAssociate,
            String stage,
            String status,
            Instant dueDate,
            Integer openItems,
            Instant lastActivity,
            String invitationStatus,
            Instant createdAt) {
        this.id = id;
        this.legalName = legalName;
        this.displayName = displayName;
        this.businessType = businessType;
        this.timeZone = timeZone;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.primaryAssociate = primaryAssociate;
        this.backupAssociate = backupAssociate;
        this.stage = stage;
        this.status = status;
        this.dueDate = dueDate;
        this.openItems = openItems;
        this.lastActivity = lastActivity;
        this.invitationStatus = invitationStatus;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
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

    public String getPrimaryAssociate() {
        return primaryAssociate;
    }

    public void setPrimaryAssociate(String primaryAssociate) {
        this.primaryAssociate = primaryAssociate;
    }

    public String getBackupAssociate() {
        return backupAssociate;
    }

    public void setBackupAssociate(String backupAssociate) {
        this.backupAssociate = backupAssociate;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getOpenItems() {
        return openItems;
    }

    public void setOpenItems(Integer openItems) {
        this.openItems = openItems;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
    }

    public String getInvitationStatus() {
        return invitationStatus;
    }

    public void setInvitationStatus(String invitationStatus) {
        this.invitationStatus = invitationStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}
