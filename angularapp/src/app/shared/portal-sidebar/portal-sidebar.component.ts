import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-portal-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './portal-sidebar.component.html',
  styleUrl: './portal-sidebar.component.css'
})
export class PortalSidebarComponent {
  constructor(private router: Router) {}

  navigation = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'All clients', route: '/admin/clients' },
    { label: 'Invite a client', route: '/admin/clients/invite' },
    { label: 'Team', route: '/admin/team' },
    
  ];
  signOut(): void {
  this.router.navigate(['/admin-login']);
}
}
