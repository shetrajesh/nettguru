
package com.nettguru.springapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ClientRequestDto {

    @NotBlank(message = "Legal name is required")
    @Size(max = 200)
    private String legalName;

    @NotBlank(message = "Display name is required")
    @Size(max = 200)
    private String displayName;

    @NotBlank(message = "Business type is required")
    @Size(max = 100)
    private String businessType;

    @NotBlank(message = "Time zone is required")
    @Size(max = 100)
    private String timeZone;

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 254)
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "Mobile number must contain exactly 10 digits"
    )
    private String mobileNumber;

    @Size(max = 150)
    private String primaryAssociate;

    @Size(max = 150)
    private String backupAssociate;

    public ClientRequestDto() {
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

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}
