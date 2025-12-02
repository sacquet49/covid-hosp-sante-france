import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {CommonModule, registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {HospitaliseService} from './services/hospitalise.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AdresseService} from './services/adresse.service';
import {HomeModule} from './home/home.module';
import {TabsModule} from 'primeng/tabs';
import {HospAgeModule} from './hosp-age/hosp-age.module';
import {CourbeHospCourantModule} from './courbe-hosp-courant/courbe-hosp-courant.module';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {MenuModule} from 'primeng/menu';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Material from '@primeng/themes/material';
import { definePreset } from '@primeng/themes';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

// @ts-ignore
const MyPreset = definePreset(Material, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  }
});

@NgModule({
  declarations: [
    AppComponent
  ],
  bootstrap: [
    AppComponent
  ], imports: [CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HomeModule,
    HospAgeModule,
    CourbeHospCourantModule,
    MenuModule,
    TabsModule,
    AppRoutingModule],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr'},
    HospitaliseService,
    AdresseService,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      inputStyle: 'filled',
      theme: { preset: MyPreset }
    })
  ]
})
export class AppModule {
}
