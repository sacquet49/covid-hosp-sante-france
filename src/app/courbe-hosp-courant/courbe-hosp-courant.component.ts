import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import {UIChart} from 'primeng/chart';
import {AdresseService} from '../services/adresse.service';
import {SelectItem} from 'primeng/api';
import * as math from 'mathjs';
import {Dropdown} from 'primeng/dropdown';
import * as moment from 'moment';
import {ENUM_SEX, LABEL_HOSPITALISATION, LABEL_REANIMATION} from './courbe-hosp-courant.model';
import {DataChart, Departement} from '../services/core.model';

@Component({
  selector: 'courbe-hosp-courant',
  templateUrl: './courbe-hosp-courant.component.html'
})
export class CourbeHospCourantComponent implements AfterViewInit {

  private _sexSelected = ENUM_SEX.TOUS;
  private _departements: Departement[] = [];
  private _jours: Date[];
  private _minDate: Date;
  private _maxDate: Date;
  private _joursSelected: string[] = [];
  private _departementSelected: string;
  private _departementsDrop: SelectItem[];
  @ViewChild('chart')
  private _chart: UIChart;
  @ViewChild('chartDece')
  private _chartDece: UIChart;
  @ViewChild('chartHospEcartType')
  private _chartHospEcartType: UIChart;
  @ViewChild('departement')
  private _departement: Dropdown;
  private _data: DataChart = new DataChart();
  private _dataDece: DataChart = new DataChart();
  private _dataHospEcartType: DataChart = new DataChart();

  get enumSex(): any {
    return ENUM_SEX;
  }

  get sexSelected(): string {
    return this._sexSelected;
  }

  set sexSelected(sex) {
    this._sexSelected = sex;
  }

  get departementsDrop(): SelectItem[] {
    return this._departementsDrop;
  }

  get departementSelected(): string {
    return this._departementSelected;
  }

  set departementSelected(departement) {
    this._departementSelected = departement;
  }

  get jours(): Date[] {
    return this._jours;
  }

  set jours(jours) {
    this._jours = jours;
  }

  get minDate(): Date {
    return this._minDate;
  }

  get maxDate(): Date {
    return this._maxDate;
  }

  get data(): DataChart {
    return this._data;
  }

  get dataDece(): DataChart {
    return this._dataDece;
  }

  get dataHospEcartType(): DataChart {
    return this._dataHospEcartType;
  }

  constructor(private hospService: HospitaliseService,
              private adresseService: AdresseService) {
    this.adresseService.getAllDepartement().subscribe(rep => {
      this._departements = rep;
      this._departementsDrop = this._departements.map(dep => ({label: dep.code + ' - ' + dep.nom, value: dep.code}));
    });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => this.init(), 50);
  }

  public refresh(): void {
    this.selectedDate();
    if (!this._departementSelected) {
      this._departement.resetFilter();
    }
    this._chart.reinit();
    this._data.datasets = [];
    this.updateChart('#0f29ae', LABEL_HOSPITALISATION, 'hosp', this._sexSelected);
    this.updateChart('#e00101', LABEL_REANIMATION, 'rea', this._sexSelected);
  }

  private init(): void {
    this.initDateForSelector();
    this.updateChart('#0f29ae', LABEL_HOSPITALISATION, 'hosp', ENUM_SEX.TOUS);
    this.updateChart('#e00101', LABEL_REANIMATION, 'rea', ENUM_SEX.TOUS);
    this.updateChartDece();
    this.updateChartHospEcartType();
  }

  private updateChart(couleur: any, label: any, filtre: any, sex: string): void {
    this.hospService.getDataByTypeAndSexAndDepartementAndDate(filtre, sex, this._departementSelected,
      this._joursSelected[0], this._joursSelected[1])
      .subscribe(data => {
        this._data.labels = Object.keys(data);
        this._data.datasets.push({
          label: `${label}`,
          fill: false,
          borderColor: couleur,
          data: Object.values(data)
        });
        this._chart.refresh();
      });
  }

  private updateChartDece(): void {
    this.hospService.getDecesByDay().subscribe(data => {
      this._dataDece.labels = Object.keys(data);
      this._dataDece.datasets.push({
        label: `Nombre quotidien de personnes nouvellement décédées`,
        fill: false,
        borderColor: '#1c9903',
        data: Object.values(data)
      });
      this._chartDece.refresh();
    });
  }

  private updateChartHospEcartType(): void {
    this.hospService.getdataHospByTypeAndSexeAndDepartement('hosp', ENUM_SEX.TOUS, this._departementSelected)
      .subscribe(data => {
        this._dataHospEcartType.labels = Object.keys(data);
        const dataArray = Object.values(data);
        let dataStd = dataArray.map((v, i) => dataArray[i + 1] && v ? math.std(v, dataArray[i + 1]) : undefined);
        dataStd = dataStd.map((v, i) => dataStd[i + 1] && v ? (v + dataStd[i + 1]) / 2 : undefined);
        this._dataHospEcartType.datasets.push({
          label: `Ecart type du nombre de personnes actuellement hospitalisées`,
          fill: false,
          borderColor: '#022179',
          data: dataStd
        });
        this.hospService.getDecesByDay().subscribe(dataDece => {
          this._dataHospEcartType.datasets.push({
            label: `Nombre quotidien de personnes nouvellement décédées`,
            fill: false,
            borderColor: '#990303',
            data: Object.values(dataDece)
          });
          this._chartHospEcartType.refresh();
        });
      });
  }

  private initDateForSelector(): void {
    const today = new Date();
    this._joursSelected.push(moment(today).add(-365, 'day').format('YYYY-MM-DD'));
    this._joursSelected.push(moment(today).format('YYYY-MM-DD'));
    this._minDate = new Date();
    this._minDate.setDate(18);
    this._minDate.setMonth(2);
    this._minDate.setFullYear(2020);
    this._maxDate = moment(new Date(), 'YYYY-MM-DD').add(-1, 'day').toDate();
    this._jours = new Array();
    this._jours[0] = moment(today).add(-365, 'day').toDate();
    this._jours[1] = today;
  }

  private selectedDate(): void {
    if (this._jours && this._jours[1]) {
      this._joursSelected = [];
      const jourMin = this._jours[0] && !this._jours[1] ? this._jours[0] :
        (this._jours[0] < this._jours[1] ? this._jours[0] : this._jours[1]);
      const jourMax = this._jours[0] && this._jours[1] && this._jours[0] > this._jours[1] ? this._jours[0] : this._jours[1];
      this._joursSelected.push(moment(jourMin).format('YYYY-MM-DD'));
      this._joursSelected.push(moment(jourMax).format('YYYY-MM-DD'));
    } else if (this._joursSelected.length === 2) {
      this._joursSelected = [];
    }
  }
}
