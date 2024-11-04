import { BuildConfig } from '../config/build-config.interface';

export const environment: Partial<BuildConfig> = {
  baseUrl: 'http://localhost:8080/',
  production: true,

  // Angular Universal settings
  universal: {
    preboot: true,
    async: true,
    time: false,
    inlineCriticalCss: false,
  }
};
