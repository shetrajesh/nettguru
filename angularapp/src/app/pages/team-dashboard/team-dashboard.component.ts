
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PortalApiService } from '../../services/portal-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-dashboard.component.html',
  styleUrl: './team-dashboard.component.css'
})
export class TeamDashboardComponent implements OnInit {
  totalClients = '—';
  pendingInvitations = '—';

  constructor(
    private api: PortalApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      clients: this.api.getClients(),
      teamMembers: this.api.getTeamMembers()
    }).subscribe({
      next: ({ clients, teamMembers }) => {
        this.totalClients = String(clients.length);

        const accounts = [...clients, ...teamMembers];

        this.pendingInvitations = String(
          accounts.filter(
            account =>
              account.invitationStatus?.toLowerCase() === 'pending'
          ).length
        );

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load team dashboard statistics:', error);
        this.cdr.markForCheck();
      }
    });
  }

  signOut(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/admin-login']);
      },
      error: (error) => {
        console.error('Sign out failed:', error);
      }
    });
  }
}
