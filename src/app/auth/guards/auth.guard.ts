import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Functional guards use inject() instead of constructor injection —
// no class required, which keeps the file concise.

// Protects any route that requires the user to be logged in.
// If not logged in, redirects to /login and preserves the attempted URL
// as a "redirectTo" query param so the user is sent back after login.
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
  return false;
};

// Protects admin-only routes.
// Requires the user to be logged in AND have the "admin" role.
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Not logged in at all → send to login
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }

  // Logged in but not admin → send back to home
  router.navigate(['/']);
  return false;
};

// Blocks admin users from accessing customer-only routes (e.g. /cart).
// If the logged-in user is an admin, redirects them to /admin-dashboard.
export const noAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};
