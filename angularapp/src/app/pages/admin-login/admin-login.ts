
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginComponent {
  username = '';
  password = '';
  email = '';

  otp = '';
  pendingToken = '';

  showPassword = false;
  currentView: 'login' | 'forgot' | 'otp' = 'login';

  loginMessage = '';
  forgotMessage = '';
  otpMessage = '';
  credentialsInvalid = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.loginMessage = '';
    this.credentialsInvalid = false;

    const loginEmail = this.username.trim();

    if (!loginEmail || !this.password) {
      this.loginMessage = 'Please enter your email address and password.';
      this.credentialsInvalid = true;
      return;
    }

    this.isLoading = true;

    this.authService.login(loginEmail, this.password).subscribe({
      next: (response) => {
        this.password = '';
        this.isLoading = false;
        console.log('Login response:', response);
        console.log('Role received:', JSON.stringify(response.role));
        switch (response.role.toUpperCase().replace(/^ROLE_/, '')){
          
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;

          case 'TEAM':
            this.router.navigate(['/team/dashboard']);
            break;

          case 'CLIENT':
            this.router.navigate(['/client/dashboard']);
            break;

          default:
            this.loginMessage =
              'Your account role is not recognized. Please contact your administrator.';
            this.credentialsInvalid = true;
            this.authService.logout().subscribe();
            break;
        }
      },
      error: (error) => {
        this.loginMessage =
          error.status === 0
            ? 'Cannot connect to the server. Please check that the backend is running.'
            : error.error?.detail ||
              error.error?.message ||
              'Login failed. Please check your credentials.';

        this.credentialsInvalid = true;
        this.isLoading = false;
      }
    });
  }

  verifyOtp(): void {
    // The admin login no longer uses OTP.
  }

  backToLogin(): void {
    this.currentView = 'login';
    this.password = '';
    this.otp = '';
    this.pendingToken = '';
    this.loginMessage = '';
    this.otpMessage = '';
    this.forgotMessage = '';
    this.credentialsInvalid = false;
  }

  clearLoginError(): void {
    this.loginMessage = '';
    this.credentialsInvalid = false;
  }

  showForgotPassword(): void {
    this.currentView = 'forgot';
    this.email = '';
    this.forgotMessage = '';
    this.clearLoginError();
  }

  continueForgotPassword(): void {
    this.forgotMessage = '';

    if (!this.email.trim()) {
      this.forgotMessage = 'Please enter your email address.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.forgotMessage = 'Please enter a valid email address.';
      return;
    }

    this.forgotMessage =
      'Password recovery is not configured yet. Please contact your administrator.';
  }

  clearForgotMessage(): void {
    this.forgotMessage = '';
  }
}
