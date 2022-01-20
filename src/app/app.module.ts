import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {HospAgeComponent} from './hosp-age/hosp-age.component';
import {HospitaliseService} from './services/hospitalise.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CourbeHospCourantComponent} from './courbe-hosp-courant/courbe-hosp-courant.component';
import {AdresseService} from './services/adresse.service';
import {HomeComponent} from './home/home.component';
import {HomeModule} from './home/home.module';
import {TabMenuModule} from 'primeng/tabmenu';
import {HospAgeModule} from './hosp-age/hosp-age.module';
import {CourbeHospCourantModule} from './courbe-hosp-courant/courbe-hosp-courant.module';
import {HttpClientModule} from '@angular/common/http';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

const appRoutes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'age', component: HospAgeComponent},
  {path: 'courant', component: CourbeHospCourantComponent},
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes, {enableTracing: false, relativeLinkResolution: 'legacy'}),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HomeModule,
    HospAgeModule,
    CourbeHospCourantModule,
    TabMenuModule
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
