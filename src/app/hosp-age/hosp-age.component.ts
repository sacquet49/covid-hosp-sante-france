import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import * as moment from 'moment';
import {UIChart} from 'primeng/chart';
import {LABEL, LABEL_DECEDE, LABEL_HOSPITALISATION, LABEL_REANIMATION} from './hosp-age.model';
import {DataChartBar} from '../services/core.model';

@Component({
  selector: 'hosp-age',
  templateUrl: './hosp-age.component.html',
  providers: []
})
export class HospAgeComponent implements AfterViewInit, OnInit {

  private _proportion = false;
  private _proportionDece = false;
  private _variation = false;
  @ViewChild('chart')
  private _chart: UIChart;
  @ViewChild('chartVariation')
  private _chartVariation: UIChart;
  @ViewChild('chartDece')
  private _chartDece: UIChart;
  private _minDate: Date;
  private _maxDate: Date;
  private _jour: Date;
  private _jour2: Date;
  private _data: DataChartBar = new DataChartBar();
  private _dataDece: DataChartBar = new DataChartBar();
  private _variationData: DataChartBar = new DataChartBar();

  get proportionDece(): boolean {
    return this._proportionDece;
  }

  set proportionDece(proportion) {
    this._proportionDece = proportion;
  }

  get variation(): boolean {
    return this._variation;
  }

  set variation(variation) {
    this._variation = variation;
  }

  get proportion(): boolean {
    return this._proportion;
  }

  set proportion(proportion) {
    this._proportion = proportion;
  }

  get jour2(): Date {
    return this._jour2;
  }

  set jour2(jour2) {
    this._jour2 = jour2;
  }

  get jour(): Date {
    return this._jour;
  }

  set jour(jour) {
    this._jour = jour;
  }

  get minDate(): Date {
    return this._minDate;
  }

  get maxDate(): Date {
    return this._maxDate;
  }

  get variationData(): DataChartBar {
    return this._variationData;
  }

  get data(): DataChartBar {
    return this._data;
  }

  get dataDece(): DataChartBar {
    return this._dataDece;
  }

  constructor(private hospService: HospitaliseService) {
  }

  public ngOnInit(): void {
    this._minDate = new Date();
    this._minDate.setDate(18);
    this._minDate.setMonth(2);
    this._minDate.setFullYear(2020);
    setTimeout(() => this.init(), 50);
    this._data.labels = LABEL;
    this._dataDece.labels = LABEL;
    this._variationData.labels = LABEL;
  }

  public ngAfterViewInit(): void {
    setTimeout(() => this.refreshChart(), 50);
    setTimeout(() => this.updateChartDece(), 50);
  }

  public refreshChart(): void {
    if (this._chart) {
      this._chart.reinit();
      this._chart.refresh();
    }
    this._data.datasets = [];

    const jourMin = this._jour && !this._jour2 ? this._jour : (this._jour < this._jour2 ? this._jour : this._jour2);
    const jourMax = this._jour && this._jour2 && this._jour > this._jour2 ? this._jour : this._jour2;

    this.updateChart(jourMin, '#42A5F5', LABEL_HOSPITALISATION, 'hosp');
    if (this._jour2) {
      this.updateChart(jourMax, '#9CCC65', LABEL_HOSPITALISATION, 'hosp');
    }

    this.updateChart(jourMin, '#eccd05', LABEL_REANIMATION, 'rea');
    if (this._jour2) {
      this.updateChart(jourMax, '#b80000', LABEL_REANIMATION, 'rea');
    }
  }

  public updateChartDece(): void {
    if (this._chartDece) {
      this._chartDece.reinit();
      this._chartDece.refresh();
    }
    this._dataDece.datasets = [];
    const dateString = moment(this._maxDate).format('YYYY-MM-DD');
    const dateFr = moment(this._maxDate).format('DD-MM-YYYY');
    this.hospService.getHospitaliseTrancheAgeByDate('dc', dateString)
      .subscribe(data => {
        const total = this.hospService.reduceAdd(data);
        if (this._proportionDece) {
          data = data.map(d => this.hospService.roundDecimal((d * 100) / total, 2));
        }
        this._dataDece.datasets.push({
          label: `${LABEL_DECEDE} ${dateFr} total : ${total}`,
          backgroundColor: '#048d92',
          borderColor: '#048d92',
          data
        });
        if (this._chartDece) {
          this._chartDece.refresh();
        }
      });
  }

  public refreshVariation(): void {
    if (this._jour && this._jour2) {
      if (this._chartVariation) {
        this._chartVariation.reinit();
        this._chartVariation.refresh();
      }
      this._variationData.datasets = [];

      const jourMin = this._jour && !this._jour2 ? this._jour : (this._jour < this._jour2 ? this._jour : this._jour2);
      const jourMax = this._jour && this._jour2 && this._jour > this._jour2 ? this._jour : this._jour2;
      const dateString = moment(jourMin).format('YYYY-MM-DD');
      const dateString2 = moment(jourMax).format('YYYY-MM-DD');
      const dateFr = moment(jourMin).format('DD-MM-YYYY');
      const dateFr2 = moment(jourMax).format('DD-MM-YYYY');

      this.hospService.getHospitaliseVariationTrancheAgeByDate('hosp', dateString, dateString2)
        .subscribe(data => {
          this._variationData.datasets.push({
            label: `Variation des entrées à l'hopital entre le ${dateFr} et ${dateFr2}`,
            backgroundColor: '#0050ff',
            borderColor: '#0050ff',
            data
          });
        });

      this.hospService.getHospitaliseVariationTrancheAgeByDate('rea', dateString, dateString2)
        .subscribe(data => {
          this._variationData.datasets.push({
            label: `Variation des entrées en réanimation entre le ${dateFr} et ${dateFr2}`,
            backgroundColor: '#ff0000',
            borderColor: '#ff0000',
            data
          });

          if (this._chartVariation) {
            this._chartVariation.refresh();
          }
        });
    }
  }

  private updateChart(date: any, couleur: any, label: any, filtre: any): void {
    const dateString = moment(date).format('YYYY-MM-DD');
    const dateFr = moment(date).format('DD-MM-YYYY');
    this.hospService.getHospitaliseTrancheAgeByDate(filtre, dateString)
      .subscribe(data => {
        if (this._proportion) {
          const total = this.hospService.reduceAdd(data);
          data = data.map(d => this.hospService.roundDecimal((d * 100) / total, 2));
        }
        this._data.datasets.push({
          label: `${label} ${dateFr}`,
          backgroundColor: couleur,
          borderColor: couleur,
          data
        });
        if (this._chart) {
          this._chart.refresh();
        }
      });
  }

  private init(): void {
    this._maxDate = moment(new Date(), 'YYYY-MM-DD').add(-1, 'day').toDate();
    this._jour = this._jour ? this._jour : this._maxDate;
  }
}
