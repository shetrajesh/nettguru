import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ViewClientsComponent } from './pages/view-clients/view-clients.component';
import { AddClientComponent } from './pages/add-client/add-client.component';
import { ViewTeamComponent } from './pages/view-team/view-team.component';
import { AddTeamComponent } from './pages/add-team/add-team.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login';

export const routes: Routes = [
  // Public website
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    redirectTo: 'admin-login',
    pathMatch: 'full'
  },

  // Admin login
  {
    path: 'admin-login',
    component: AdminLoginComponent
  },

  // Admin - Clients
  {
    path: 'admin/clients',
    component: ViewClientsComponent
  },
  {
    path: 'admin/clients/invite',
    component: AddClientComponent
  },

  // Admin - Team
  {
    path: 'admin/team',
    component: ViewTeamComponent
  },
  {
    path: 'admin/team/invite',
    component: AddTeamComponent
  },

  // Unknown URLs
  {
    path: '**',
    redirectTo: 'home'
  }
];