
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { PortalApiService } from '../../services/portal-api.service';
import { Client } from '../../models/portal.models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css',
})
export class ClientDashboardComponent implements OnInit {
  clientName = '';
  clientEmail = '';
  accountStatus = '';
  loading = true;

  constructor(
    private authService: AuthService,
    private portalApi: PortalApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentAdmin().subscribe({
      next: (user) => {
        this.clientEmail = user.email;

        this.portalApi.getClients().subscribe({
          next: (clients: Client[]) => {
            const client = clients.find(
              item =>
                item.email?.trim().toLowerCase() ===
                user.email.trim().toLowerCase()
            );

            if (client) {
              this.clientName =
                `${client.firstName || ''} ${client.lastName || ''}`.trim();

              this.accountStatus = client.status || 'Not specified';
            } else {
              console.warn(
                'No client record found for the logged-in email.'
              );
            }

            this.loading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Failed to load client details:', error);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (error) => {
        console.error('Failed to retrieve logged-in user:', error);
        this.loading = false;
        this.router.navigate(['/admin-login']);
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
