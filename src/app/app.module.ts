import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {CommonModule, registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {HospitaliseService} from './services/hospitalise.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AdresseService} from './services/adresse.service';
import {HomeModule} from './home/home.module';
import {TabMenuModule} from 'primeng/tabmenu';
import {HospAgeModule} from './hosp-age/hosp-age.module';
import {CourbeHospCourantModule} from './courbe-hosp-courant/courbe-hosp-courant.module';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {MenuModule} from 'primeng/menu';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HomeModule,
    HospAgeModule,
    CourbeHospCourantModule,
    MenuModule,
    TabMenuModule,
    AppRoutingModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr'},
    HospitaliseService,
    AdresseService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
