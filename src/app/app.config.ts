import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// Application-level configuration — registers providers available to the entire app.
// This replaces the old NgModule approach (AppModule + imports array).
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // catches unhandled JS errors globally
    provideRouter(routes),               // registers the router with our route definitions
    provideHttpClient()                  // makes HttpClient injectable everywhere (required for API calls)
  ]
};
