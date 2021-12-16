import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import * as moment from 'moment';
import {UIChart} from 'primeng/chart';

@Component({
  selector: 'hosp-age',
  templateUrl: './hosp-age.component.html',
  providers: []
})
export class HospAgeComponent implements AfterViewInit, OnInit {

  LABEL_HOSPITALISATION = `Patients covid hospitalisés au `;
  LABEL_REANIMATION = `Patients covid hospitalisés en réanimation au `;
  LABEL_DECEDE = `Nombre cumulé de personnes décédées au `;
  proportion = false;
  proportionDece = false;
  variation = false;
  @ViewChild('chart')
  chart: UIChart;
  @ViewChild('chartVariation')
  chartVariation: UIChart;
  @ViewChild('chartDece')
  chartDece: UIChart;
  minDate;
  maxDate;
  jour;
  jour2;
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

  constructor(private hospService: HospitaliseService) {
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
    this.maxDate = moment(new Date(), 'YYYY-MM-DD').add(-1, 'day').toDate();
    this.jour = this.jour ? this.jour : this.maxDate;
  }

  refreshChart(): void {
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

  updateChart(date: any, couleur: any, label: any, filtre: any): void {
    const dateString = moment(date).format('YYYY-MM-DD');
    const dateFr = moment(date).format('DD-MM-YYYY');
    this.hospService.getHospitaliseTrancheAgeByDate(filtre, dateString)
      .subscribe(data => {
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
      });
  }

  updateChartDece(): void {
    if (this.chartDece) {
      this.chartDece.reinit();
      this.chartDece.refresh();
    }
    this.dataDece.datasets = [];
    const dateString = moment(this.maxDate).format('YYYY-MM-DD');
    const dateFr = moment(this.maxDate).format('DD-MM-YYYY');
    this.hospService.getHospitaliseTrancheAgeByDate('dc', dateString)
      .subscribe(data => {
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
      });
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

      this.hospService.getHospitaliseVariationTrancheAgeByDate('hosp', dateString, dateString2)
        .subscribe(data => {
          this.variationData.datasets.push({
            label: `Variation des entrées à l'hopital entre le ${dateFr} et ${dateFr2}`,
            backgroundColor: '#0050ff',
            borderColor: '#0050ff',
            data
          });
        });

      this.hospService.getHospitaliseVariationTrancheAgeByDate('rea', dateString, dateString2)
        .subscribe(data => {
          this.variationData.datasets.push({
            label: `Variation des entrées en réanimation entre le ${dateFr} et ${dateFr2}`,
            backgroundColor: '#ff0000',
            borderColor: '#ff0000',
            data
          });

          if (this.chartVariation) {
            this.chartVariation.refresh();
          }
        });
    }
  }
}
