import { ApplicationConfig, ErrorHandler, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_CONFIG } from './config';
import { initSession } from './core/auth/session-init';
import { GlobalErrorHandler } from './core/error/global-error-handler';
import { authInterceptor } from './core/http/auth-interceptor';
import { errorInterceptor } from './core/http/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initSession),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: APP_CONFIG, useValue: { apiBaseUrl: '/api', pageSize: 20 } },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
