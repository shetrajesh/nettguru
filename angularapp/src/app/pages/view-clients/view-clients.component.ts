import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { Client } from '../../models/portal.models';

@Component({
  selector: 'app-view-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PortalSidebarComponent],
  templateUrl: './view-clients.component.html',
  styleUrl: './view-clients.component.css'
})
export class ViewClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchText = ''; stage = ''; status = ''; associate = ''; notAssignedOnly = false;
  selectedIds = new Set<number>();
  stages = ['Onboarding', 'Active', 'Completed', 'On hold'];
  statuses = ['Pending', 'Active', 'Inactive', 'Invited'];
  associateOptions: string[] = [];
  errorMessage = '';

  constructor(private api: PortalApiService) {}
  ngOnInit(): void {
    this.api.getClients().subscribe({
      next: data => { this.clients = data || []; this.applyFilters(); },
      error: () => { this.errorMessage = 'Could not load clients. Check your API URL and backend.'; }
    });
  }
  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filteredClients = this.clients.filter(c => {
      const name = `${c.displayName || ''} ${c.legalName || ''} ${c.firstName || ''} ${c.lastName || ''} ${c.email || ''}`.toLowerCase();
      const assigned = !!(c.primaryAssociate && c.primaryAssociate.trim());
      return (!q || name.includes(q))
        && (!this.stage || c.stage === this.stage)
        && (!this.status || (c.status || c.invitationStatus) === this.status)
        && (!this.associate || c.primaryAssociate === this.associate)
        && (!this.notAssignedOnly || !assigned);
    });
  }
  toggleAll(checked: boolean): void {
    this.selectedIds.clear();
    if (checked) this.filteredClients.forEach(c => { if (c.id != null) this.selectedIds.add(c.id); });
  }
  toggleOne(id: number | undefined, checked: boolean): void {
    if (id == null) return;
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }
  isSelected(id?: number): boolean { return id != null && this.selectedIds.has(id); }
  isAllSelected(): boolean {
    return this.filteredClients.length > 0 && this.filteredClients.every(c => c.id != null && this.selectedIds.has(c.id));
  }
}
