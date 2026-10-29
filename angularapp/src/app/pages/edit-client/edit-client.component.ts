
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { Client } from '../../models/portal.models';

@Component({
  selector: 'app-edit-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PortalSidebarComponent
  ],
  templateUrl: './edit-client.component.html',
  styleUrl: './edit-client.component.css'
})
export class EditClientComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  clientId!: number;
  loading = true;
  clientLoaded = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  timeZones = [
    'Asia/Kolkata',
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Singapore',
    'Australia/Sydney'
  ];

  businessTypes = [
    'Consulting',
    'Restaurant',
    'Retail',
    'Healthcare',
    'Other'
  ];

  form = this.fb.group({
    legalName: ['', Validators.required],
    displayName: ['', Validators.required],
    businessType: ['', Validators.required],
    timeZone: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]],
    primaryAssociate: [''],
    backupAssociate: ['']
  });

  constructor(
    private api: PortalApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid client ID.';
      this.loading = false;
      return;
    }

    this.clientId = id;
    this.api.getClientById(id).subscribe({
      next: (client) => {
        this.form.patchValue({
          legalName: client.legalName,
          displayName: client.displayName,
          businessType: client.businessType,
          timeZone: client.timeZone,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          mobileNumber: client.mobileNumber,
          primaryAssociate: client.primaryAssociate || '',
          backupAssociate: client.backupAssociate || ''
        });

        this.loading = false;
        this.clientLoaded = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Could not load this client.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.saving) {
      return;
    }

    const value = this.form.getRawValue();

    const client: Client = {
      legalName: value.legalName!.trim(),
      displayName: value.displayName!.trim(),
      businessType: value.businessType!,
      timeZone: value.timeZone!,
      firstName: value.firstName!.trim(),
      lastName: value.lastName!.trim(),
      email: value.email!.trim(),
      mobileNumber: value.mobileNumber!.trim(),
      primaryAssociate: value.primaryAssociate?.trim() || '',
      backupAssociate: value.backupAssociate?.trim() || ''
    };

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.api.updateClient(this.clientId, client).subscribe({
      next: () => {
        this.successMessage = 'Client updated successfully.';
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage =
          error.status === 409
            ? 'A client with this email already exists.'
            : 'Could not update the client. Please try again.';

        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
