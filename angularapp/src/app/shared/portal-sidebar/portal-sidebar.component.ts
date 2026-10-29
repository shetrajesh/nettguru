
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-portal-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './portal-sidebar.component.html',
  styleUrl: './portal-sidebar.component.css'
})
export class PortalSidebarComponent {
  constructor(private router: Router, private authService: AuthService) {}
  
  navigation = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'All clients', route: '/admin/clients' },
    { label: 'Invite a client', route: '/admin/clients/invite' },
    { label: 'Team', route: '/admin/team' }
  ];

  logNavigation(route: string): void {
    console.log('Sidebar clicked:', route);
  }

  
signOut(): void {
  this.authService.logout().subscribe({
    next: () => {
      this.router.navigate(['/admin-login']);
    },
    error: (err) => {
      console.error('Logout failed:', err);
      this.router.navigate(['/admin-login']);
    }
  });
}

}
