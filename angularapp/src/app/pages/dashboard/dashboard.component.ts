
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PortalSidebarComponent } from '../../shared/portal-sidebar/portal-sidebar.component';
import { PortalApiService } from '../../services/portal-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PortalSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = [
    { title: 'Total clients', value: '—', description: 'Registered clients' },
    { title: 'Team members', value: '—', description: 'Team overview' },
    { title: 'Pending invitations', value: '—', description: 'Awaiting registration' },
    { title: 'Active Team Members', value: '—', description: 'Account overview' }
  ];

  activities = [
    'Recent client invitations will appear here.',
    'Team updates will appear here.',
    'Account activity will appear here.'
  ];

  constructor(
    private api: PortalApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      clients: this.api.getClients(),
      teamMembers: this.api.getTeamMembers()
    }).subscribe({
      next: ({ clients, teamMembers }) => {
        this.stats[0].value = String(clients.length);
        this.stats[1].value = String(teamMembers.length);

        const accounts = [...clients, ...teamMembers];
        this.stats[2].value = String(
          accounts.filter(
            account => account.invitationStatus?.toLowerCase() === 'pending'
          ).length
        );
        this.stats[3].value = String(
          accounts.filter(account => account.status?.toLowerCase() === 'active')
            .length
        );
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load dashboard statistics:', error);
        this.cdr.markForCheck();
      }
    });
  }
}
