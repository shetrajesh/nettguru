
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data?.['role'] as string | undefined;

  return authService.getCurrentAdmin().pipe(
    map((user) => {
      // Normalize ROLE_ADMIN to ADMIN, ROLE_TEAM to TEAM, etc.
      const actualRole = user.role.toUpperCase().replace(/^ROLE_/, '');

      // Redirect authenticated users to their own dashboard
      // if they attempt to open a page for another role.
      if (requiredRole && actualRole !== requiredRole) {
        switch (actualRole) {
          case 'ADMIN':
            return router.createUrlTree(['/admin/dashboard']);
          case 'TEAM':
            return router.createUrlTree(['/team/dashboard']);
          case 'CLIENT':
            return router.createUrlTree(['/client/dashboard']);
          default:
            return router.createUrlTree(['/admin-login']);
        }
      }

      return true;
    }),
    catchError(() => of(router.createUrlTree(['/admin-login'])))
  );
};
