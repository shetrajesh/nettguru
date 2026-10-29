
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, timer } from 'rxjs';

import { PortalApiService } from '../../services/portal-api.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accept-invitation.component.html',
  styleUrl: './accept-invitation.component.css'
})
export class AcceptInvitationComponent implements OnInit, OnDestroy {
  token: string | null = null;

  message = 'Checking invitation link...';
  invitation: any = null;

  loading = true;
  registering = false;

  fullName = '';
  password = '';
  confirmPassword = '';
  formError = '';

  otp = '';
  otpSent = false;
  otpVerified = false;
  sendingOtp = false;
  verifyingOtp = false;
  otpMessage = '';
  otpError = '';
  resendCountdown = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly countdownStop$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private portalApi: PortalApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.token = params.get('token');

        if (!this.token) {
          this.invitation = null;
          this.message =
            'Invalid invitation link. The invitation token is missing.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.validateToken(this.token);
      });
  }

  private getBackendMessage(error: any): string | null {
    return (
      error?.error?.message ||
      error?.error?.error ||
      error?.error?.detail ||
      null
    );
  }

  private validateToken(token: string): void {
    this.loading = true;
    this.invitation = null;
    this.message = 'Checking invitation link...';

    this.portalApi.validateInvitation(token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.invitation = response;
          this.fullName = response.name ?? '';
          this.message = 'Your invitation is valid!';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: error => {
          this.invitation = null;
          this.loading = false;

          const backendMessage = this.getBackendMessage(error);

          if (error.status === 404) {
            this.message =
              backendMessage ||
              'This invitation link is invalid or could not be found.';
          } else if (error.status === 410) {
            this.message =
              backendMessage ||
              'This invitation has expired. Please request a new invitation.';
          } else if (error.status === 409) {
            this.message =
              backendMessage ||
              'This invitation is no longer available.';
          } else {
            this.message =
              backendMessage ||
              'Unable to validate your invitation. Please try again later.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  sendOtp(): void {
    if (
      !this.token ||
      !this.invitation ||
      this.sendingOtp ||
      this.resendCountdown > 0 ||
      this.otpVerified ||
      this.registering
    ) {
      return;
    }

    this.sendingOtp = true;
    this.otpError = '';
    this.otpMessage = '';
    this.formError = '';

    this.portalApi.sendInvitationOtp(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.sendingOtp = false;
          this.otpSent = true;
          this.otpVerified = false;
          this.otp = '';
          this.otpMessage =
            response.message ||
            'OTP sent to your invitation email address.';

          this.startResendCountdown();
          this.cdr.detectChanges();
        },
        error: error => {
          this.sendingOtp = false;
          this.otpError =
            this.getBackendMessage(error) ||
            'Unable to send the OTP. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  private startResendCountdown(): void {
    this.countdownStop$.next();
    this.resendCountdown = 90;

    timer(0, 1000)
      .pipe(
        takeUntil(this.countdownStop$),
        takeUntil(this.destroy$)
      )
      .subscribe(tick => {
        this.resendCountdown = Math.max(90 - tick, 0);

        if (this.resendCountdown === 0) {
          this.countdownStop$.next();
        }

        this.cdr.detectChanges();
      });
  }

  onOtpInput(value: string): void {
    this.otp = value.replace(/\D/g, '').slice(0, 6);
    this.otpError = '';
  }

  verifyOtp(): void {
    if (
      !this.token ||
      !this.otpSent ||
      this.verifyingOtp ||
      this.otpVerified ||
      this.registering
    ) {
      return;
    }

    const enteredOtp = this.otp.trim();

    if (!/^\d{6}$/.test(enteredOtp)) {
      this.otpError = 'Enter the complete 6-digit OTP.';
      this.otpMessage = '';
      return;
    }

    this.verifyingOtp = true;
    this.otpError = '';
    this.otpMessage = '';

    this.portalApi.verifyInvitationOtp(this.token, enteredOtp)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.verifyingOtp = false;
          this.otpVerified = true;
          this.otpError = '';
          this.otpMessage =
            response.message || 'Email verified successfully.';

          this.cdr.detectChanges();
        },
        error: error => {
          this.verifyingOtp = false;
          this.otpVerified = false;
          this.otpError =
            this.getBackendMessage(error) ||
            'OTP verification failed. Check the code and try again.';

          this.cdr.detectChanges();
        }
      });
  }

  validateRegistrationForm(): boolean {
    this.formError = '';

    if (!this.otpVerified) {
      this.formError =
        'Please verify your email using the OTP first.';
      return false;
    }

    if (!this.fullName.trim()) {
      this.formError = 'Please enter your full name.';
      return false;
    }

    if (this.fullName.trim().length < 2) {
      this.formError =
        'Your name must contain at least 2 characters.';
      return false;
    }

    if (this.password.length < 8) {
      this.formError =
        'Your password must contain at least 8 characters.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.formError = 'The passwords do not match.';
      return false;
    }

    return true;
  }

  register(): void {
    if (this.registering) {
      return;
    }

    if (!this.token || !this.invitation) {
      this.formError =
        'Your invitation is invalid. Please check the invitation link.';
      return;
    }

    if (!this.validateRegistrationForm()) {
      return;
    }

    this.registering = true;
    this.formError = '';

    const request = {
      token: this.token,
      fullName: this.fullName.trim(),
      email: this.invitation.email,
      password: this.password
    };

    this.portalApi.registerFromInvitation(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.message =
            response.message || 'Registration successful!';

          this.registering = false;
          this.password = '';
          this.confirmPassword = '';
          this.otp = '';
          this.invitation = null;

          this.cdr.detectChanges();
        },
        error: error => {
          this.registering = false;

          const backendMessage = this.getBackendMessage(error);

          if (error.status === 404) {
            this.formError =
              backendMessage ||
              'This invitation is invalid or could not be found.';
          } else if (error.status === 409) {
            this.formError =
              backendMessage ||
              'This email is already registered. Please use a different email address.';
          } else if (error.status === 400) {
            this.formError =
              backendMessage ||
              'Please check your registration details.';
          } else if (error.status === 403) {
            this.otpVerified = false;
            this.formError =
              backendMessage ||
              'Email verification is required. Please verify your OTP again.';
          } else {
            this.formError =
              backendMessage ||
              'Registration failed. Please try again.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.countdownStop$.next();
    this.countdownStop$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
