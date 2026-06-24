import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { ApiModule, Configuration } from './core/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      ApiModule.forRoot(() => {
        return new Configuration({
          basePath: 'https://petclinic.explosionlab.com',
          credentials: {
            bearerAuth: () => localStorage.getItem('token') ?? undefined,
          },
        });
      })
    )
  ]
};
