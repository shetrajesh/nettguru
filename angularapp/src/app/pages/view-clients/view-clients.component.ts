
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';
import { Client } from '../../models/portal.models';

@Component({
  selector: 'app-view-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PortalSidebarComponent
  ],
  templateUrl: './view-clients.component.html',
  styleUrl: './view-clients.component.css'
})
export class ViewClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];

  searchText = '';
  stage = '';
  status = '';
  associate = '';
  notAssignedOnly = false;

  selectedIds = new Set<number>();
  deletingIds = new Set<number>();

  stages = ['Onboarding', 'Active', 'Completed', 'On hold'];
  statuses = ['Pending', 'Active', 'Inactive', 'Invited', 'Accepted', 'Expired'];
  associateOptions: string[] = [];

  errorMessage = '';
  successMessage = '';

  constructor(
    private api: PortalApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.api.getClients().subscribe({
      next: data => {
        this.clients = data || [];
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load clients:', error);
        this.errorMessage =
          'Could not load clients. Check your API URL and backend.';
        this.cdr.markForCheck();
      }
    });
  }

  getClientStatus(client: Client): string {
    const invitationStatus = client.invitationStatus?.trim();
    const clientStatus = client.status?.trim();

    return invitationStatus || clientStatus || 'Unknown';
  }

  deleteClient(client: Client): void {
    if (client.id == null) {
      this.errorMessage =
        'Cannot delete this client because its ID is missing.';
      return;
    }

    const clientName =
      client.displayName ||
      client.legalName ||
      `${client.firstName || ''} ${client.lastName || ''}`.trim() ||
      client.email ||
      'this client';

    const confirmed = window.confirm(
      `Are you sure you want to delete ${clientName}?`
    );

    if (!confirmed) {
      return;
    }

    const id = client.id;

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingIds.add(id);

    this.api.deleteClient(id).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.id !== id);
        this.selectedIds.delete(id);
        this.applyFilters();
        this.successMessage =
          `${clientName} was deleted successfully.`;
        this.deletingIds.delete(id);
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to delete client:', error);
        this.errorMessage =
          error?.error?.message ||
          'Could not delete the client. Please try again.';
        this.deletingIds.delete(id);
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();

    this.filteredClients = this.clients.filter(c => {
      const name =
        `${c.displayName || ''} ${c.legalName || ''} ` +
        `${c.firstName || ''} ${c.lastName || ''} ${c.email || ''}`
          .toLowerCase();

      const assigned = !!(
        c.primaryAssociate && c.primaryAssociate.trim()
      );

      const clientStatus = this.getClientStatus(c);

      return (!q || name.includes(q))
        && (!this.stage || c.stage === this.stage)
        && (!this.status ||
          clientStatus.toLowerCase() === this.status.toLowerCase())
        && (!this.associate ||
          c.primaryAssociate === this.associate)
        && (!this.notAssignedOnly || !assigned);
    });
  }

  toggleAll(checked: boolean): void {
    this.selectedIds.clear();

    if (checked) {
      this.filteredClients.forEach(c => {
        if (c.id != null) {
          this.selectedIds.add(c.id);
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
    return this.filteredClients.length > 0 &&
      this.filteredClients.every(
        c => c.id != null && this.selectedIds.has(c.id)
      );
  }

  isDeleting(id?: number): boolean {
    return id != null && this.deletingIds.has(id);
  }
}
