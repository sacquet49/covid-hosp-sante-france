import {BrowserModule} from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChartModule} from 'primeng/chart';
import {RouterModule, Routes} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {TabMenuModule} from 'primeng/tabmenu';
import {CardModule} from 'primeng/card';
import {HomeComponent} from './home/home.component';
import {HospitaliseService} from './services/hospitalise.service';
import {MenubarModule} from 'primeng/menubar';
import {MenuModule} from 'primeng/menu';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {CalendarModule} from 'primeng/calendar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

const appRoutes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes, {enableTracing: false}),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ChartModule,
    CardModule,
    TabMenuModule,
    MenuModule,
    CalendarModule,
    DropdownModule,
    MenubarModule,
    AppRoutingModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr'},
    HospitaliseService
    ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
