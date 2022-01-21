import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {HospAgeComponent} from './hosp-age/hosp-age.component';
import {CourbeHospCourantComponent} from './courbe-hosp-courant/courbe-hosp-courant.component';

const appRoutes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'age', component: HospAgeComponent},
  {path: 'courant', component: CourbeHospCourantComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
