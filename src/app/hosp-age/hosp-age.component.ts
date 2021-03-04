import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import * as moment from 'moment';
import {UIChart} from 'primeng/chart';
import {fr} from '../services/local';
import {SelectItem} from 'primeng/api';
import {AdresseService} from '../services/adresse.service';
import {Dropdown} from 'primeng/dropdown';

@Component({
  selector: 'home',
  templateUrl: './hosp-age.component.html',
  providers: []
})
export class HospAgeComponent implements AfterViewInit, OnInit {

  LABEL_HOSPITALISATION = `Patients covid hospitalisés au `;
  LABEL_REANIMATION = `Patients covid hospitalisés en réanimation au `;
  LABEL_DECEDE = `Nombre cumulé de personnes décédées au `;
  proportion = false;
  proportionDece = false;
  proportionEvoAge = false;
  variation = false;
  isRea = false;
  regions: any = [];
  regionSelected: string;
  regionsDrop: SelectItem[];
  @ViewChild('chart')
  chart: UIChart;
  @ViewChild('chartVariation')
  chartVariation: UIChart;
  @ViewChild('chartDece')
  chartDece: UIChart;
  @ViewChild('chartEvolution')
  chartEvolution: UIChart;
  @ViewChild('region')
  region: Dropdown;
  hospitaliseParJour = [];
  hospitaliseParTrancheAge = [];
  minDate;
  maxDate;
  jour;
  jour2;
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
  label = ['0 - 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90'];
  data = {
    labels: this.label,
    datasets: []
  };
  dataDece = {
    labels: this.label,
    datasets: []
  };
  variationData = {
    labels: this.label,
    datasets: []
  };
  dataEvolution = {
    labels: [],
    datasets: []
  };
  fr = fr;

  constructor(private hospService: HospitaliseService, private adresseService: AdresseService) {
    this.adresseService.getAllRegion().subscribe(rep => {
      this.regions = rep;
      this.regionsDrop = this.regions.map(reg => ({label: reg.code + ' - ' + reg.nom, value: reg.code}));
    });
  }

  ngOnInit(): void {
    this.minDate = new Date();
    this.minDate.setDate(18);
    this.minDate.setMonth(2);
    this.minDate.setFullYear(2020);
    setTimeout(() => this.init(), 50);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.refreshChart(), 50);
    setTimeout(() => this.updateChartDece(), 50);
  }

  init(): void {
    if (this.hospService.csv[3].data.length > 0 && this.hospitaliseParJour.length === 0) {
      this.hospitaliseParJour = this.hospService.csv[3].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v), r), {});
      this.hospitaliseParTrancheAge = this.hospService.csv[3].data.reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v), r), {});
      const maxDatePossible = Object.entries(this.hospitaliseParJour)[Object.entries(this.hospitaliseParJour).length - 2][0];
      this.maxDate = moment(maxDatePossible, 'YYYY-MM-DD').toDate();
      this.jour = this.jour ? this.jour : this.maxDate;
      this.dataEvolution.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
      this.getEvolutionParTrancheAge();
    }
  }

  refreshChart(): void {
    if (this.hospitaliseParJour instanceof Object) {
      if (this.chart) {
        this.chart.reinit();
        this.chart.refresh();
      }
      this.data.datasets = [];

      const jourMin = this.jour && !this.jour2 ? this.jour : (this.jour < this.jour2 ? this.jour : this.jour2);
      const jourMax = this.jour && this.jour2 && this.jour > this.jour2 ? this.jour : this.jour2;

      this.updateChart(jourMin, '#42A5F5', this.LABEL_HOSPITALISATION, 'hosp');
      if (this.jour2) {
        this.updateChart(jourMax, '#9CCC65', this.LABEL_HOSPITALISATION, 'hosp');
      }

      this.updateChart(jourMin, '#eccd05', this.LABEL_REANIMATION, 'rea');
      if (this.jour2) {
        this.updateChart(jourMax, '#b80000', this.LABEL_REANIMATION, 'rea');
      }
    }
  }

  updateChart(date: any, couleur: any, label: any, filtre: any): void {
    const dateString = moment(date).format('YYYY-MM-DD');
    const dateFr = moment(date).format('DD-MM-YYYY');
    let data = this.gethospitaliseByFilterAndDate(filtre, dateString);
    if (this.proportion) {
      const total = this.hospService.reduceAdd(data);
      data = data.map(d => this.hospService.roundDecimal((d * 100) / total, 2));
    }
    this.data.datasets.push({
      label: `${label} ${dateFr}`,
      backgroundColor: couleur,
      borderColor: couleur,
      data
    });
    if (this.chart) {
      this.chart.refresh();
    }
  }

  updateChartDece(): void {
    if (this.chartDece) {
      this.chartDece.reinit();
      this.chartDece.refresh();
    }
    this.dataDece.datasets = [];
    const dateString = moment(this.maxDate).format('YYYY-MM-DD');
    const dateFr = moment(this.maxDate).format('DD-MM-YYYY');
    let data = this.gethospitaliseByFilterAndDate('dc', dateString);
    const total = this.hospService.reduceAdd(data);
    if (this.proportionDece) {
      data = data.map(d => this.hospService.roundDecimal((d * 100) / total, 2));
    }
    this.dataDece.datasets.push({
      label: `${this.LABEL_DECEDE} ${dateFr} total : ${total}`,
      backgroundColor: '#048d92',
      borderColor: '#048d92',
      data
    });
    if (this.chartDece) {
      this.chartDece.refresh();
    }
  }

  refreshVariation(): void {
    if (this.jour && this.jour2) {
      if (this.chartVariation) {
        this.chartVariation.reinit();
        this.chartVariation.refresh();
      }
      this.variationData.datasets = [];

      const jourMin = this.jour && !this.jour2 ? this.jour : (this.jour < this.jour2 ? this.jour : this.jour2);
      const jourMax = this.jour && this.jour2 && this.jour > this.jour2 ? this.jour : this.jour2;
      const dateString = moment(jourMin).format('YYYY-MM-DD');
      const dateString2 = moment(jourMax).format('YYYY-MM-DD');
      const dateFr = moment(jourMin).format('DD-MM-YYYY');
      const dateFr2 = moment(jourMax).format('DD-MM-YYYY');

      this.variationData.datasets.push({
        label: `Variation des entrées à l'hopital entre le ${dateFr} et ${dateFr2}`,
        backgroundColor: '#0050ff',
        borderColor: '#0050ff',
        data: this.getVariation('hosp', dateString, dateString2)
      });

      this.variationData.datasets.push({
        label: `Variation des entrées en réanimation entre le ${dateFr} et ${dateFr2}`,
        backgroundColor: '#ff0000',
        borderColor: '#ff0000',
        data: this.getVariation('rea', dateString, dateString2)
      });
      if (this.chartVariation) {
        this.chartVariation.refresh();
      }
    }
  }

  getVariation(filtre: string, dateMin: any, dateMax: any): any {
    const dataRea = this.gethospitaliseByFilterAndDate(filtre, dateMin);
    const dataRea2 = this.gethospitaliseByFilterAndDate(filtre, dateMax);
    return dataRea.map((v, i) => this.hospService.roundDecimal((100 * (dataRea2[i] - v)) / v, 2));
  }

  gethospitaliseByFilterAndDate(filtre: string, date: string): any[] {
    const hospitalise = [];
    if (this.hospitaliseParJour[date]) {
      Object.entries(this.hospitaliseParJour[date]
        .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v[filtre]) , r), {}))
        .map((ha: any) => hospitalise.push(this.hospService.reduceAdd(ha['1'])));
    }
    hospitalise[0] = hospitalise[10];
    return hospitalise.slice(0, 10);
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
