import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CardModule} from 'primeng/card';
import {HomeComponent} from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    CardModule
  ]
})
export class HomeModule {
}
