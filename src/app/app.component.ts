import {Component, OnInit} from '@angular/core';
import {MenuItem, PrimeNGConfig} from 'primeng/api';
import {Location} from '@angular/common';
import {HospitaliseService} from './services/hospitalise.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private _tabMenuItems: MenuItem[] = [
    {label: '', icon: 'pi pi-home', routerLink: ['home']},
    {label: 'Hospitalisation par âges', icon: 'pi pi-chart-bar', routerLink: ['age']},
    {label: 'Courbe hospitaliser courant', icon: 'pi pi-chart-line', routerLink: ['courant']},
  ];
  private _currantItem: MenuItem;

  get tabMenuItems(): MenuItem[] {
    return this._tabMenuItems;
  }

  get currantItem(): MenuItem {
    return this._currantItem;
  }

  constructor(private location: Location,
              private hospService: HospitaliseService,
              private config: PrimeNGConfig) {
  }

  public ngOnInit(): void {
    this.hospService.update().subscribe();
    this.config.setTranslation({
      dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'],
      today: 'Aujourd\'hui',
      clear: 'Effacer',
      weekHeader: 'Semaine'
    });
    this._currantItem = this.location.path().replace('/', '') !== '' ?
      this._tabMenuItems
        .find(mi => this.location.path().replace('/', '').includes(mi.routerLink['0'])) :
      this._tabMenuItems[0];
  }
}
