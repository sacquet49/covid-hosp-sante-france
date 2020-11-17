import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Location} from '@angular/common';
import {HospitaliseService} from './services/hospitalise.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  tabMenuItems: MenuItem[] = [
    {label: '', icon: 'pi pi-home', routerLink: ['home']},
    {label: 'Hospitalisation par âges', icon: 'pi pi-chart-bar', routerLink: ['age']},
    {label: 'Courbe hospitaliser courant', icon: 'pi pi-chart-line', routerLink: ['courant']},
  ];
  currantItem;
  csvIsInit = false;

  constructor(private location: Location, private newsService: HospitaliseService) {
    this.newsService.getCsv().subscribe(csv => {
      this.csvIsInit = csv[3].data.length > 0;
    });
  }

  ngOnInit(): void {
    this.currantItem = this.location.path().replace('/', '') !== '' ?
      this.tabMenuItems
        .find(mi => this.location.path().replace('/', '').includes(mi.routerLink['0'])) :
      this.tabMenuItems[0];
  }
}
