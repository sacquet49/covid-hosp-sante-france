import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {PrimeNG} from 'primeng/config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  private _tabMenuItems: MenuItem[] = [
    {label: '', icon: 'pi pi-home', routerLink: ['/home']},
    {label: 'Hospitalisation par âges', icon: 'pi pi-chart-bar', routerLink: ['/age']},
    {label: 'Courbe hospitaliser courant', icon: 'pi pi-chart-line', routerLink: ['/courant']}
  ];

  get tabMenuItems(): MenuItem[] {
    return this._tabMenuItems;
  }

  constructor(private config: PrimeNG) {
  }

  public ngOnInit(): void {
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
  }
}
