import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UIChart} from 'primeng/chart';
import {Dropdown} from 'primeng/dropdown';
import {AdresseService} from '../../services/adresse.service';
import {SelectItem} from 'primeng/api';
import {HospitaliseService} from '../../services/hospitalise.service';
import {fr} from 'src/app/services/local';
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
  hospitaliseParJour;
  @Input()
  label;
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
  hospitaliseParTrancheAge = [];
  trancheAge = [{indice: '09', label: '0 - 9', color: '#0050ff'},
    {indice: '19', label: '10 - 19', color: '#ff00e5'},
    {indice: '29', label: '20 - 29', color: '#00f7ff'},
    {indice: '39', label: '30 - 39', color: '#6aff00'},
    {indice: '49', label: '40 - 49', color: '#ff0000'},
    {indice: '59', label: '50 - 59', color: '#ff7700'},
    {indice: '69', label: '60 - 69', color: '#9500ff'},
    {indice: '79', label: '70 - 79', color: '#d0ff00'},
    {indice: '89', label: '80 - 89', color: '#0b0b18'},
    {indice: '90', label: '>90', color: '#02a705'}];
  TYPE_STAT = {
    HOSP: 'hosp',
    REA: 'rea',
    DC: 'dc'
  };
  typeStatSelected = this.TYPE_STAT.HOSP;
  fr = fr;

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
    if (this.hospService.csv[3].data.length > 0) {
      this.hospitaliseParTrancheAge = this.hospService.csv[3].data.reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v), r), {});
      this.getEvolutionParTrancheAge();
    }
  }

  getEvolutionParTrancheAge(): void {
    this.dataEvolution.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0'])
      .filter((ha: any) => (this.joursSelected.length === 2) ? (ha >= this.joursSelected[0] && ha <= this.joursSelected[1]) : true);
    if (!this.regionSelected) {
      this.region.resetFilter();
    }
    const evolutionByAge = [];
    if (this.chartEvolution) {
      this.chartEvolution.reinit();
      this.chartEvolution.refresh();
    }
    this.dataEvolution.datasets = [];
    this.trancheAge.forEach(t => {
      evolutionByAge[t.indice] = this.getHospitaliseByAge(t.indice);
    });

    for (let i = 0; i < evolutionByAge['09'].length; i++) {
      const total = this.hospService.reduceAdd(evolutionByAge.map(t => t[i]));
      this.trancheAge.forEach(t => {
        evolutionByAge[t.indice][i] = this.hospService.roundDecimal((evolutionByAge[t.indice][i] * 100) / total, 2);
      });
    }

    this.printValueOnGraph(evolutionByAge);
  }

  private printValueOnGraph(evolutionByAge: any[]): void {
    this.trancheAge.forEach(t => {
      this.dataEvolution.datasets.push({
        label: `${t.label}`,
        fill: false,
        borderColor: t.color,
        data: this.proportionEvoAge ? evolutionByAge[t.indice] : this.getHospitaliseByAge(t.indice)
      });
      this.chartEvolution.refresh();
      this.chartEvolution.refresh();
    });
  }

  getHospitaliseByAge(trancheAge: string): any[] {
    const hospitalise = [];
    Object.entries(this.hospitaliseParTrancheAge[trancheAge]
      .filter((ha: any) => {
        if (this.joursSelected.length === 2) {
          return (ha.jour >= this.joursSelected[0] && new Date(ha.jour) <= this.addDays(this.joursSelected[1], 1)) && (this.regionSelected ? ha.reg === this.regionSelected : true);
        } else if (this.regionSelected) {
          return ha.reg === this.regionSelected;
        } else {
          return true;
        }
      })
      .reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v[this.typeStatSelected]) , r), {}))
      .map((ha: any) => hospitalise.push(this.hospService.reduceAdd(ha['1'])));
    return hospitalise.slice(1);
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

  addDays(date, days): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
