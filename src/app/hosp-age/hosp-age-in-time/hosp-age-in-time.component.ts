import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UIChart} from 'primeng/chart';
import {Dropdown} from 'primeng/dropdown';
import {AdresseService} from '../../services/adresse.service';
import {SelectItem} from 'primeng/api';
import {HospitaliseService} from '../../services/hospitalise.service';
import * as moment from 'moment';

@Component({
  selector: 'app-hosp-age-in-time',
  templateUrl: './hosp-age-in-time.component.html'
})
export class HospAgeInTimeComponent implements OnInit {

  @ViewChild('chartEvolution')
  chartEvolution: UIChart;
  @ViewChild('region')
  region: Dropdown;
  dataEvolution = {
    labels: [],
    datasets: []
  };
  @Input()
  minDate;
  @Input()
  maxDate;
  jours;
  joursSelected = [];
  regions: any = [];
  regionSelected: string;
  regionsDrop: SelectItem[];
  proportionEvoAge = false;
  TYPE_STAT = {
    HOSP: 'hosp',
    REA: 'rea',
    DC: 'dc'
  };
  typeStatSelected = this.TYPE_STAT.HOSP;

  constructor(private hospService: HospitaliseService, private adresseService: AdresseService) {
    this.adresseService.getAllRegion().subscribe(rep => {
      this.regions = rep;
      this.regionsDrop = this.regions.map(reg => ({label: reg.code + ' - ' + reg.nom, value: reg.code}));
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.init(), 50);
  }

  init(): void {
    const today = new Date();
    this.joursSelected.push(moment(today).add(-365, 'day').format('YYYY-MM-DD'));
    this.joursSelected.push(moment(today).format('YYYY-MM-DD'));
    this.jours = new Array();
    this.jours[0] = moment(today).add(-365, 'day').toDate();
    this.jours[1] = today;
    this.getEvolutionParTrancheAge();
  }

  getEvolutionParTrancheAge(): void {
    this.hospService.labelsDayByDate(this.joursSelected[0], this.joursSelected[1])
      .subscribe(dataLabels => {
        this.dataEvolution.labels = dataLabels;
        if (!this.regionSelected) {
          this.region.resetFilter();
        }
        if (this.chartEvolution) {
          this.chartEvolution.reinit();
          this.chartEvolution.refresh();
        }
        this.dataEvolution.datasets = [];

        this.hospService.getdataAgeByTypeAndDateAndRegion(this.typeStatSelected, this.joursSelected[0], this.joursSelected[1], this.regionSelected)
          .subscribe(data => {
            this.printValueOnGraph(data);
          });
      });
  }

  private printValueOnGraph(evolutionByAge: any[]): void {
    evolutionByAge.forEach(t => {
      this.dataEvolution.datasets.push({
        label: `${t.label}`,
        fill: false,
        borderColor: t.color,
        data: this.proportionEvoAge ? t.dataP : t.data
      });
    });
    this.chartEvolution.refresh();
  }

  refreshVariation(): void {
    if (this.jours && this.jours[1]) {
      this.joursSelected = [];
      const jourMin = this.jours[0] && !this.jours[1] ? this.jours[0] : (this.jours[0] < this.jours[1] ? this.jours[0] : this.jours[1]);
      const jourMax = this.jours[0] && this.jours[1] && this.jours[0] > this.jours[1] ? this.jours[0] : this.jours[1];
      this.joursSelected.push(moment(jourMin).format('YYYY-MM-DD'));
      this.joursSelected.push(moment(jourMax).format('YYYY-MM-DD'));
      this.getEvolutionParTrancheAge();
    } else if (this.joursSelected.length === 2) {
      this.joursSelected = [];
      this.getEvolutionParTrancheAge();
    }
  }
}
