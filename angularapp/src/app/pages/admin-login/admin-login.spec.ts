
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

  // Temporary demo credentials only
  private readonly demoUsername = 'admin';
  private readonly demoPassword = 'Admin@123';

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.loginMessage = '';

    if (!this.username.trim() || !this.password) {
      this.loginMessage = 'Please enter your user ID and password.';
      return;
    }

    if (
      this.username.trim() === this.demoUsername &&
      this.password === this.demoPassword
    ) {
      this.router.navigate(['/admin/clients']);
      return;
    }

    this.password = '';
    this.loginMessage =
      'The user ID or password is incorrect. Please try again.';
  }

  showForgotPassword(): void {
    this.currentView = 'forgot';
    this.forgotMessage = '';
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

    this.forgotMessage = 'This email ID does not exist.';
  }
}
