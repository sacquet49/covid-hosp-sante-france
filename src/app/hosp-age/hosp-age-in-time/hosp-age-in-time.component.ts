import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UIChart} from 'primeng/chart';
import {Dropdown} from 'primeng/dropdown';
import {AdresseService} from '../../services/adresse.service';
import {SelectItem} from 'primeng/api';
import {HospitaliseService} from '../../services/hospitalise.service';

@Component({
  selector: 'app-hosp-age-in-time',
  templateUrl: './hosp-age-in-time.component.html'
})
export class HospAgeInTimeComponent implements OnInit {

  @ViewChild('chartEvolution')
  chartEvolution: UIChart;
  @ViewChild('region')
  region: Dropdown;
  isRea = false;
  dataEvolution = {
    labels: [],
    datasets: []
  };
  @Input()
  hospitaliseParJour;
  @Input()
  label;
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
      this.dataEvolution.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
      this.getEvolutionParTrancheAge();
    }
  }

  getEvolutionParTrancheAge(): void {
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
    const reaOrHosp = this.isRea ? 'rea' : 'hosp';
    if (this.regionSelected) {
      Object.entries(this.hospitaliseParTrancheAge[trancheAge]
        .filter((ha: any) => ha.reg === this.regionSelected)
        .reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v[reaOrHosp]) , r), {}))
        .map((ha: any) => hospitalise.push(this.hospService.reduceAdd(ha['1'])));
    } else {
      Object.entries(this.hospitaliseParTrancheAge[trancheAge]
        .reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v[reaOrHosp]) , r), {}))
        .map((ha: any) => hospitalise.push(this.hospService.reduceAdd(ha['1'])));
    }
    return hospitalise.slice(1);
  }

}
