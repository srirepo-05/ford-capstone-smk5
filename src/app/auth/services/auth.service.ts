import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

// Shape returned by https://dummyjson.com/auth/login on success
interface DummyLoginResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

// Shape stored in localStorage after a successful login.
// Exported so other services/components can type-check the session object.
export interface AuthSession {
  username: string;
  displayName: string; // firstName + lastName from the API
  role: 'admin';
  accessToken: string;  // JWT — stored so it can be attached to future authenticated requests
  refreshToken: string; // JWT — used to obtain a new accessToken when it expires
}

@Injectable({
  providedIn: 'root', // singleton — one shared instance across the whole app
})
export class AuthService {

  private readonly AUTH_URL = 'https://dummyjson.com/auth/login';

  // The localStorage keys used by this service — kept as constants to avoid typo bugs
  private readonly SESSION_KEY = 'auth_session';
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  // Reactive signal — components read this to know who is logged in.
  // Initialised from localStorage so the session survives a page refresh.
  currentUser = signal<AuthSession | null>(this.loadSession());

  constructor(private http: HttpClient) {}

  // POSTs credentials to DummyJSON, stores the JWT tokens, and updates the signal.
  // Returns an Observable<boolean>: true = login OK, false = wrong credentials.
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<DummyLoginResponse>(this.AUTH_URL, {
      username,
      password,
      expiresInMins: 60, // token lifetime — 60 minutes
    }).pipe(
      map(res => {
        const session: AuthSession = {
          username: res.username,
          displayName: `${res.firstName} ${res.lastName}`,
          role: 'admin',
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        };

        // Persist session object and tokens separately in localStorage
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);

        this.currentUser.set(session); // update signal → all dependent components re-render
        return true;
      }),
      // catchError intercepts 4xx/5xx HTTP errors (e.g. 400 Bad credentials)
      // and converts them into a false value instead of throwing to the subscriber
      catchError(() => of(false))
    );
  }

  logout(): void {
    // Clear all auth-related keys from localStorage
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
  }

  // Returns the stored JWT access token — use this when making authenticated API requests
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  // Restores the session from localStorage on service initialisation.
  // try/catch guards against malformed JSON that would otherwise crash the app.
  private loadSession(): AuthSession | null {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthSession;
    } catch {
      return null;
    }
  }
}
