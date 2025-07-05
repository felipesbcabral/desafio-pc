import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';



import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { DebtMapperService } from './core/services/debt-mapper.service';
import { ConnectivityService } from './core/services/connectivity.service';

// Register Portuguese locale
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular providers
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection(),
    

    
    // Router configuration
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    
    // HTTP Client
    provideHttpClient(withInterceptorsFromDi()),
    
    // Animations
    provideAnimations(),
    
    // NgRx Store
    provideStore(),
    provideEffects(),
    
    // NgRx DevTools (only in development)
    ...(environment.production ? [] : [provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75
    })]),
    
    // Locale configuration
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    
    // Custom Services
    DebtMapperService,
    ConnectivityService
  ]
};
