
package com.nettguru.springapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class InvitationRegistrationRequest {

    @NotBlank(message = "Invitation token is required.")
    private String token;

    @NotBlank(message = "Full name is required.")
    @Size(min = 2, max = 200,
        message = "Full name must be between 2 and 200 characters.")
    private String fullName;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 72,
        message = "Password must be between 8 and 72 characters.")
    private String password;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email address.")
    private String email;

    public InvitationRegistrationRequest() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
