import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {ChartModule} from 'primeng/chart';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {RadioButtonModule} from 'primeng/radiobutton';
import {CourbeHospCourantComponent} from './courbe-hosp-courant.component';

@NgModule({
  declarations: [CourbeHospCourantComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ChartModule,
    CalendarModule,
    DropdownModule,
    CheckboxModule,
    RadioButtonModule
  ]
})
export class CourbeHospCourantModule {
}
