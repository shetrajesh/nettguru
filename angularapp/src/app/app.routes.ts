import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ViewClientsComponent } from './pages/view-clients/view-clients.component';
import { AddClientComponent } from './pages/add-client/add-client.component';
import { ViewTeamComponent } from './pages/view-team/view-team.component';
import { AddTeamComponent } from './pages/add-team/add-team.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EditClientComponent } from './pages/edit-client/edit-client.component';
import { EditTeamComponent } from './pages/edit-team/edit-team.component';
import { authGuard } from './guards/auth-guard';
import { AcceptInvitationComponent } from './pages/accept-invitation/accept-invitation.component';
import { TeamDashboardComponent } from './pages/team-dashboard/team-dashboard.component';
import { ClientDashboardComponent} from './pages/client-dashboard/client-dashboard.component';
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

  // Public admin login
  {
    path: 'admin-login',
    component: AdminLoginComponent
  },

  // Protected admin pages
  {
    path: 'admin/clients/invite',
    component: AddClientComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/clients',
    component: ViewClientsComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'admin/team/invite',
    component: AddTeamComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/team',
    component: ViewTeamComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
    data : { role:'ADMIN'}
  },
  
  {
    path: 'admin/clients/edit/:id',
    component: EditClientComponent,
    canActivate: [authGuard]
  },

  {
  path: 'accept-invitation',
  component: AcceptInvitationComponent
  },

  {
  path: 'admin/team/edit/:id',
  component: EditTeamComponent,
  canActivate: [authGuard]
},

{
  path: 'team/dashboard',
  component: TeamDashboardComponent,
  canActivate: [authGuard],
  pathMatch: 'full',
  data : { role:'TEAM'}
},
{
  path: 'client/dashboard',
  component: ClientDashboardComponent,
  canActivate: [authGuard],
  pathMatch: 'full',
  data : { role:'CLIENT'}
},

  // Unknown URLs
  {
    path: '**',
    redirectTo: 'home'
  }
];
