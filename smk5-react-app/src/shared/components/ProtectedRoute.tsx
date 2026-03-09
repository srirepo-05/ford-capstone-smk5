import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ── ProtectedRoute ────────────────────────────────────────────────────────────
// Guards a route so only admin users can access it.
// Redirects to /login if the current user is not authenticated as admin.
// <Navigate replace> swaps the history entry so the user cannot press Back
// to get back to the admin dashboard after being redirected.
// Usage: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>

// ── GuestOnlyRoute ────────────────────────────────────────────────────────────
// Guards a route so admin users cannot access guest-only pages (e.g. /cart).
// Redirects admins straight to the admin dashboard.
// Usage: <GuestOnlyRoute><CartPage /></GuestOnlyRoute>

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    // Not an admin — redirect to login, replacing the current history entry
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const GuestOnlyRoute = ({ children }: ProtectedRouteProps) => {
  const { isAdmin } = useAuth();

  if (isAdmin()) {
    // Admins are not allowed on guest-only pages — send them to their dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
