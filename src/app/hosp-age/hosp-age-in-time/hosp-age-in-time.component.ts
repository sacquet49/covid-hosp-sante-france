import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UIChart} from 'primeng/chart';
import {Dropdown} from 'primeng/dropdown';
import {AdresseService} from '../../services/adresse.service';
import {SelectItem} from 'primeng/api';
import {HospitaliseService} from '../../services/hospitalise.service';
import * as moment from 'moment';
import {TYPE_STAT} from '../hosp-age.model';

@Component({
  selector: 'app-hosp-age-in-time',
  templateUrl: './hosp-age-in-time.component.html'
})
export class HospAgeInTimeComponent implements OnInit {

  @ViewChild('chartEvolution')
  private _chartEvolution: UIChart;
  @ViewChild('region')
  private _region: Dropdown;
  private _dataEvolution = {
    labels: [],
    datasets: []
  };
  @Input()
  public minDate;
  @Input()
  public maxDate;
  private _jours;
  private _joursSelected = [];
  private _regions: any = [];
  private _regionSelected: string;
  private _regionsDrop: SelectItem[];
  private _proportionEvoAge = false;
  private _typeStatSelected = TYPE_STAT.HOSP;

  get type_stat(): any {
    return TYPE_STAT;
  }

  get jours(): any {
    return this._jours;
  }

  set jours(jour) {
    this._jours = jour;
  }

  get typeStatSelected(): any {
    return this._typeStatSelected;
  }

  set typeStatSelected(typeStat) {
    this._typeStatSelected = typeStat;
  }

  get proportionEvoAge(): any {
    return this._proportionEvoAge;
  }

  set proportionEvoAge(proportion) {
    this._proportionEvoAge = proportion;
  }

  get regionSelected(): any {
    return this._regionSelected;
  }

  set regionSelected(region) {
    this._regionSelected = region;
  }

  get regionsDrop(): any {
    return this._regionsDrop;
  }

  get dataEvolution(): any {
    return this._dataEvolution;
  }

  constructor(private hospService: HospitaliseService,
              private adresseService: AdresseService) {
    this.adresseService.getAllRegion().subscribe(rep => {
      this._regions = rep;
      this._regionsDrop = this._regions.map(reg => ({label: reg.code + ' - ' + reg.nom, value: reg.code}));
    });
  }

  public ngOnInit(): void {
    setTimeout(() => this.init(), 50);
  }

  public getEvolutionParTrancheAge(): void {
    this.hospService.labelsDayByDate(this._joursSelected[0], this._joursSelected[1])
      .subscribe(dataLabels => {
        this._dataEvolution.labels = dataLabels;
        if (!this._regionSelected) {
          this._region.resetFilter();
        }
        if (this._chartEvolution) {
          this._chartEvolution.reinit();
          this._chartEvolution.refresh();
        }
        this._dataEvolution.datasets = [];

        this.hospService.getdataAgeByTypeAndDateAndRegion(this._typeStatSelected, this._joursSelected[0],
          this._joursSelected[1], this._regionSelected)
          .subscribe(data => {
            this.printValueOnGraph(data);
          });
      });
  }

  public refreshVariation(): void {
    if (this._jours && this._jours[1]) {
      this._joursSelected = [];
      const jourMin = this._jours[0] && !this._jours[1] ? this._jours[0] :
        (this._jours[0] < this._jours[1] ? this._jours[0] : this._jours[1]);
      const jourMax = this._jours[0] && this._jours[1] && this._jours[0] > this._jours[1] ? this._jours[0] : this._jours[1];
      this._joursSelected.push(moment(jourMin).format('YYYY-MM-DD'));
      this._joursSelected.push(moment(jourMax).format('YYYY-MM-DD'));
      this.getEvolutionParTrancheAge();
    } else if (this._joursSelected.length === 2) {
      this._joursSelected = [];
      this.getEvolutionParTrancheAge();
    }
  }

  private init(): void {
    const today = new Date();
    this._joursSelected.push(moment(today).add(-365, 'day').format('YYYY-MM-DD'));
    this._joursSelected.push(moment(today).format('YYYY-MM-DD'));
    this._jours = new Array();
    this._jours[0] = moment(today).add(-365, 'day').toDate();
    this._jours[1] = today;
    this.getEvolutionParTrancheAge();
  }

  private printValueOnGraph(evolutionByAge: any[]): void {
    evolutionByAge.forEach(t => {
      this._dataEvolution.datasets.push({
        label: `${t.label}`,
        fill: false,
        borderColor: t.color,
        data: this._proportionEvoAge ? t.dataP : t.data
      });
    });
    this._chartEvolution.refresh();
  }


}
