
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { TeamMember } from '../../models/portal.models';

@Component({
  selector: 'app-edit-team',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PortalSidebarComponent
  ],
  templateUrl: './edit-team.component.html',
  styleUrl: './edit-team.component.css'
})
export class EditTeamComponent implements OnInit {
  memberId!: number;

  firstName = '';
  lastName = '';
  email = '';
  role = '';

  roles = ['Administrator', 'Associate', 'Reviewer'];

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PortalApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid team member ID.';
      return;
    }

    this.memberId = id;
    this.loadMember();
  }

  loadMember(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getTeamMemberById(this.memberId).subscribe({
      next: member => {
        this.firstName = member.firstName || '';
        this.lastName = member.lastName || '';
        this.email = member.email || '';
        this.role = member.role || '';

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.errorMessage =
          error?.error?.detail ||
          error?.error?.message ||
          'Could not load this team member. Please try again.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveChanges(): void {
    if (this.isSaving || this.isLoading) {
      return;
    }

    const firstName = this.firstName.trim();
    const lastName = this.lastName.trim();
    const role = this.role.trim();

    if (!firstName || !lastName || !role) {
      this.errorMessage = 'First name, last name, and role are required.';
      this.successMessage = '';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: TeamMember = {
      id: this.memberId,
      firstName,
      lastName,
      email: this.email,
      role
    };

    this.api.updateTeamMember(this.memberId, request).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Team member updated successfully.';
        this.cdr.markForCheck();

        this.router.navigate(['/admin/team']);
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage =
          error?.error?.detail ||
          error?.error?.message ||
          'Could not update the team member. Please try again.';

        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/team']);
  }
}
