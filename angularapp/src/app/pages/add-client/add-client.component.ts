import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { Client } from '../../models/portal.models';

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PortalSidebarComponent],
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.css'
})
export class AddClientComponent {
  private fb = inject(FormBuilder);
  businessTypes = ['Consulting', 'Restaurant', 'Retail', 'Healthcare', 'Other'];
  timeZones = [
    'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Chicago',
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
    'Asia/Dubai', 'Asia/Singapore', 'Australia/Sydney'
  ];
  associateOptions: string[] = []; // Populate with actual associates from your system.
  invitedClients: Client[] = [];
  successMessage = '';
  errorMessage = '';
  saving = false;

  form = this.fb.group({
    legalName: ['', Validators.required],
    displayName: ['', Validators.required],
    businessType: ['', Validators.required],
    timeZone: ['Asia/Kolkata', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    primaryAssociate: [''],
    backupAssociate: ['']
  });

  constructor(private api: PortalApiService) {}

  get f() { return this.form.controls; }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    const value = this.form.getRawValue();
    const client: Client = {
      legalName: value.legalName!.trim(),
      displayName: value.displayName!.trim(),
      businessType: value.businessType!,
      timeZone: value.timeZone!,
      firstName: value.firstName!.trim(),
      lastName: value.lastName!.trim(),
      email: value.email!.trim(),
      primaryAssociate: value.primaryAssociate || '',
      backupAssociate: value.backupAssociate || '',
      invitationStatus: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.saving = true; this.successMessage = ''; this.errorMessage = '';
    this.api.createClient(client).subscribe({
      next: created => {
        this.invitedClients = [created, ...this.invitedClients];
        this.successMessage = 'Client invitation created successfully.';
        this.form.reset({ timeZone: 'Asia/Kolkata', primaryAssociate: '', backupAssociate: '' });
        this.saving = false;
      },
      error: () => {
        this.errorMessage = 'Could not create invitation. Check that the Spring Boot API is running and the endpoint matches.';
        this.saving = false;
      }
    });
  }
}
