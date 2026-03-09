import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Entry point — starts the Angular app using the standalone bootstrap API.
// App is the root component; appConfig supplies all app-wide providers.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
