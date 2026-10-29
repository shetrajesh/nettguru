
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { TeamMember } from '../../models/portal.models';

@Component({
  selector: 'app-view-team',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PortalSidebarComponent],
  templateUrl: './view-team.component.html',
  styleUrl: './view-team.component.css'
})
export class ViewTeamComponent implements OnInit {
  members: TeamMember[] = [];
  filteredMembers: TeamMember[] = [];

  searchText = '';
  role = '';
  status = '';

  selectedIds = new Set<number>();

  roles = ['Administrator', 'Associate', 'Reviewer'];
  statuses = ['Active', 'Invited', 'Inactive', 'Pending'];

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isSaving = false;
  deletingId: number | null = null;

  editingId: number | null = null;
  editFirstName = '';
  editLastName = '';
  editRole = '';

  constructor(
    private api: PortalApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getTeamMembers().subscribe({
      next: data => {
        this.members = data || [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage =
          'Could not load team members. Check your session and backend.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();

    this.filteredMembers = this.members.filter(m =>
      (!q || `${m.firstName} ${m.lastName} ${m.email}`
        .toLowerCase()
        .includes(q)) &&
      (!this.role || m.role === this.role) &&
      (!this.status ||
        (m.status || m.invitationStatus) === this.status)
    );
  }

  startEdit(member: TeamMember): void {
    if (member.id == null) {
      this.errorMessage = 'Cannot edit a team member without an ID.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.editingId = member.id;
    this.editFirstName = member.firstName || '';
    this.editLastName = member.lastName || '';
    this.editRole = member.role || '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editFirstName = '';
    this.editLastName = '';
    this.editRole = '';
    this.errorMessage = '';
  }

  saveEdit(member: TeamMember): void {
    if (this.editingId == null || this.isSaving) {
      return;
    }

    const firstName = this.editFirstName.trim();
    const lastName = this.editLastName.trim();
    const role = this.editRole.trim();

    if (!firstName || !lastName || !role) {
      this.errorMessage =
        'First name, last name, and role are required.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: TeamMember = {
      ...member,
      firstName,
      lastName,
      role
    };

    const id = this.editingId;

    this.api.updateTeamMember(id, request).subscribe({
      next: updated => {
        this.members = this.members.map(m =>
          m.id === updated.id ? updated : m
        );

        this.applyFilters();
        this.cancelEdit();
        this.isSaving = false;
        this.successMessage = 'Team member updated successfully.';
        this.cdr.markForCheck();
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

  deleteMember(member: TeamMember): void {
    if (member.id == null || this.deletingId != null) {
      return;
    }

    const name =
      `${member.firstName} ${member.lastName}`.trim();

    const confirmed = window.confirm(
      `Permanently delete ${name || member.email}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const id = member.id;

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = id;

    this.api.deleteTeamMember(id).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.id !== id);
        this.selectedIds.delete(id);
        this.applyFilters();
        this.deletingId = null;

        if (this.editingId === id) {
          this.cancelEdit();
        }

        this.successMessage = 'Team member permanently deleted.';
        this.cdr.markForCheck();
      },
      error: error => {
        this.deletingId = null;
        this.errorMessage =
          error?.error?.detail ||
          error?.error?.message ||
          'Could not delete the team member. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleAll(checked: boolean): void {
    this.selectedIds.clear();

    if (checked) {
      this.filteredMembers.forEach(m => {
        if (m.id != null) {
          this.selectedIds.add(m.id);
        }
      });
    }
  }

  toggleOne(id: number | undefined, checked: boolean): void {
    if (id == null) {
      return;
    }

    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  isSelected(id?: number): boolean {
    return id != null && this.selectedIds.has(id);
  }

  isAllSelected(): boolean {
    return this.filteredMembers.length > 0 &&
      this.filteredMembers.every(
        m => m.id != null && this.selectedIds.has(m.id)
      );
  }
}
