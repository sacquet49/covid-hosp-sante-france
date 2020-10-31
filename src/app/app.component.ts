import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Location} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  tabMenuItems: MenuItem[] = [
    {label: '', icon: 'pi pi-home', routerLink: ['home']},
    {label: 'Courbe hospitaliser courant', icon: 'pi pi-chart-line', routerLink: ['courant']},
  ];
  currantItem;

  constructor(private location: Location) {
  }

  ngOnInit(): void {
    this.currantItem = this.location.path().replace('/', '') != '' ?
      this.tabMenuItems
        .find(mi => mi.routerLink['0'] === this.location.path().replace('/', '')) :
      this.tabMenuItems[0];
  }
}
