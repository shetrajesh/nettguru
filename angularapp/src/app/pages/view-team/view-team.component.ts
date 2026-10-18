import { Component, OnInit } from '@angular/core';
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
  members: TeamMember[] = []; filteredMembers: TeamMember[] = [];
  searchText = ''; role = ''; status = ''; selectedIds = new Set<number>();
  roles = ['Administrator', 'Associate', 'Reviewer', 'Team member'];
  statuses = ['Active', 'Invited', 'Inactive', 'Pending'];
  errorMessage = '';
  constructor(private api: PortalApiService) {}
  ngOnInit(): void {
    this.api.getTeamMembers().subscribe({
      next: data => { this.members = data || []; this.applyFilters(); },
      error: () => { this.errorMessage = 'Could not load team members. Check your API URL and backend.'; }
    });
  }
  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filteredMembers = this.members.filter(m =>
      (!q || `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(q)) &&
      (!this.role || m.role === this.role) && (!this.status || (m.status || m.invitationStatus) === this.status)
    );
  }
  toggleAll(checked: boolean): void {
    this.selectedIds.clear();
    if (checked) this.filteredMembers.forEach(m => { if (m.id != null) this.selectedIds.add(m.id); });
  }
  toggleOne(id: number | undefined, checked: boolean): void {
    if (id == null) return;
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }
  isSelected(id?: number): boolean { return id != null && this.selectedIds.has(id); }
  isAllSelected(): boolean { return this.filteredMembers.length > 0 && this.filteredMembers.every(m => m.id != null && this.selectedIds.has(m.id)); }
}
