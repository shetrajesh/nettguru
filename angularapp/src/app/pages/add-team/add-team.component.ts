import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { TeamMember } from '../../models/portal.models';

@Component({
  selector: 'app-add-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PortalSidebarComponent],
  templateUrl: './add-team.component.html',
  styleUrl: './add-team.component.css'
})
export class AddTeamComponent {
  private fb = inject(FormBuilder);
  roles = ['Administrator', 'Associate', 'Reviewer']; // Replace with approved roles.
  invitedMembers: TeamMember[] = [];
  successMessage = ''; errorMessage = ''; saving = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required]
  });
  constructor(private api: PortalApiService) {}
  get f() { return this.form.controls; }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    const v = this.form.getRawValue();
    const member: TeamMember = {
      firstName: v.firstName!.trim(), lastName: v.lastName!.trim(),
      email: v.email!.trim(), role: v.role!, invitationStatus: 'Pending',
      status: 'Invited', createdAt: new Date().toISOString()
    };
    this.saving = true; this.successMessage = ''; this.errorMessage = '';
    this.api.inviteTeamMember(member).subscribe({
      next: created => {
        this.invitedMembers = [created, ...this.invitedMembers];
        this.successMessage = 'Team invitation created successfully.';
        this.form.reset(); this.saving = false;
      },
      error: () => {
        this.errorMessage = 'Could not create invitation. Check that the Spring Boot API is running and the endpoint matches.';
        this.saving = false;
      }
    });
  }
}
