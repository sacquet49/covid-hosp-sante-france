import {Component, OnInit, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import {Subscription} from 'rxjs';
import * as moment from 'moment';
import {UIChart} from 'primeng/chart';
import {fr} from '../services/local';

@Component({
  selector: 'ass-home',
  templateUrl: './home.component.html',
  providers: []
})
export class HomeComponent implements OnInit {

  LABEL_HOSPITALISATION = `Patients covid hospitalisés au `;
  LABEL_REANIMATION = `Patients covid hospitalisés au `;
  proportion = false;
  variation = false;
  @ViewChild('chart')
  chart: UIChart;
  @ViewChild('chartVariation')
  chartVariation: UIChart;
  subscription: Subscription;
  hospitaliseParJour = [];
  minDate;
  maxDate;
  jour;
  jour2;
  data = {
    labels: ['0- 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90'],
    datasets: []
  };;
  variationData = {
    labels: ['0- 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90'],
    datasets: []
  };;
  fr = fr;

  ngOnInit(): void {
    this.minDate = new Date();
    this.minDate.setDate(18);
    this.minDate.setMonth(2);
    this.minDate.setFullYear(2020);
    this.maxDate = new Date();
  }

  constructor(private newsService: HospitaliseService) {
    this.subscription = this.newsService.getCsv().subscribe(csv => {
      if (csv[2].data.length > 0 && this.hospitaliseParJour.length === 0) {
        this.hospitaliseParJour = csv[2].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v), r), {});
        const maxDatePossible = Object.entries(this.hospitaliseParJour)[Object.entries(this.hospitaliseParJour).length - 2][0];
        this.maxDate = moment(maxDatePossible, 'YYYY-MM-DD').toDate();
      }
    });
  }

  refreshChart(): void {
    this.chart.reinit();
    this.chart.refresh();
    this.data.datasets = [];

    this.updateChart(this.jour, '#42A5F5', this.LABEL_HOSPITALISATION, 'hosp');
    if (this.jour2) {
      this.updateChart(this.jour2, '#9CCC65', this.LABEL_HOSPITALISATION, 'hosp');
    }

    this.updateChart(this.jour, '#eccd05', this.LABEL_REANIMATION, 'rea');
    if (this.jour2) {
      this.updateChart(this.jour2, '#b80000', this.LABEL_REANIMATION, 'rea');
    }
  }

  updateChart(date: any, couleur: any, label: any, filtre: any): void {
    const dateString = moment(date).format('YYYY-MM-DD');
    const dateFr = moment(date).format('DD-MM-YYYY');
    let data = this.gethospitaliseByFilterAndDate(filtre, dateString);
    if (this.proportion) {
      const total = this.reduceAdd(data);
      data = data.map(d => (d * 100) / total);
    }
    this.data.datasets.push({
      label: `${label} ${dateFr}`,
      backgroundColor: couleur,
      borderColor: couleur,
      data
    });
  }

  refreshVariation(): void {
    if (this.chartVariation) {
      this.chartVariation.reinit();
      this.chartVariation.refresh();
    }
    this.variationData.datasets = [];

    const dateString = moment(this.jour).format('YYYY-MM-DD');
    const dateString2 = moment(this.jour2).format('YYYY-MM-DD');
    const dateFr = moment(this.jour).format('DD-MM-YYYY');
    const dateFr2 = moment(this.jour2).format('DD-MM-YYYY');

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
  }

  getVariation(filtre: string, dateMin: any, dateMax: any): any {
    const dataRea = this.gethospitaliseByFilterAndDate(filtre, dateMin);
    const dataRea2 = this.gethospitaliseByFilterAndDate(filtre, dateMax);
    return dataRea.map((v, i) => (100 * (dataRea2[i] - v)) / v);
  }

  gethospitaliseByFilterAndDate(filtre: string, date: string): any[] {
    const hospitalise = [];
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    Object.entries(this.hospitaliseParJour[date]
      .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v[filtre]) , r), {}))
      .map((ha: any) => hospitalise.push(this.reduceAdd(ha['1'])));
    return hospitalise.slice(1);
  }

  reduceAdd(array: Array<any>): any {
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    return array.reduce(reducer);
  }
}
