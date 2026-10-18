
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  showPassword = false;
  currentView: 'login' | 'forgot' = 'login';

  loginMessage = '';
  forgotMessage = '';
  credentialsInvalid = false;

  private readonly demoUsername = 'admin';
  private readonly demoPassword = 'Admin@123';

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.loginMessage = '';
    this.credentialsInvalid = false;

    if (!this.username.trim() || !this.password) {
      this.loginMessage = 'Please enter your user ID and password.';
      this.credentialsInvalid = true;
      return;
    }

    if (
      this.username.trim() === this.demoUsername &&
      this.password === this.demoPassword
    ) {
      this.router.navigate(['/admin/clients']);
    } else {
      this.password = '';
      this.loginMessage =
        'The user ID or password is incorrect. Please try again.';
      this.credentialsInvalid = true;
    }
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

  backToLogin(): void {
    this.currentView = 'login';
    this.forgotMessage = '';
  }

  continueForgotPassword(): void {
    this.forgotMessage = '';

    if (!this.email.trim()) {
      this.forgotMessage = 'Please enter your email ID.';
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
