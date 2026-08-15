import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './demo/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowser().bootstrapModule(AppModule, { applicationProviders: [provideZonelessChangeDetection()] });
