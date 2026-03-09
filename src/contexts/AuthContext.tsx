import { createContext, useCallback, useContext, useState } from 'react';
import type { AuthContextType, AuthSession } from '../shared/models/types';
import { loginWithDummyJson } from '../shared/api/auth';
import axios from 'axios';

// ── Session persistence ───────────────────────────────────────────────────────
// Reads the saved session from localStorage so the user stays logged in
// across page refreshes.
const STORAGE_KEY = 'auth_session';

const loadSession = (): AuthSession | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    // Discard corrupted data and treat the user as logged out
    return null;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Custom hook ───────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────
// Holds all authentication state and exposes login / logout helpers via context.

type Props = { children: React.ReactNode };

const AuthProvider = ({ children }: Props) => {
  // Lazy initialiser — loadSession() runs only once on first render
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(loadSession);

  // POSTs credentials to https://dummyjson.com/auth/login.
  // On success the JWT tokens are stored in localStorage alongside the session.
  // Returns false when the API responds with a 4xx (bad credentials).
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await loginWithDummyJson(username, password);

      const session: AuthSession = {
        username: data.username,
        displayName: `${data.firstName} ${data.lastName}`,
        role: 'admin',
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setCurrentUser(session);
      return true;
    } catch (err) {
      // AxiosError with a 4xx status means wrong credentials — anything else re-throws
      if (axios.isAxiosError(err) && err.response && err.response.status < 500) {
        return false;
      }
      throw err;
    }
  }, []);

  // Clears localStorage and resets state — user is immediately logged out
  const logout = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  // Returns true when a user session is active
  const isLoggedIn = useCallback((): boolean => currentUser !== null, [currentUser]);

  // Returns true only for the admin role
  const isAdmin = useCallback((): boolean => currentUser?.role === 'admin', [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
