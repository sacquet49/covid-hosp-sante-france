import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import {UIChart} from 'primeng/chart';
import {AdresseService} from '../services/adresse.service';
import {SelectItem} from 'primeng/api';
import * as math from 'mathjs';

@Component({
  selector: 'courbe-hosp-courant',
  templateUrl: './courbe-hosp-courant.component.html',
  providers: []
})
export class CourbeHospCourantComponent implements AfterViewInit {

  ENUM_SEX = {
    TOUS: '0',
    HOMME: '1',
    FEMME: '2'
  };
  sexSelected = this.ENUM_SEX.TOUS;
  departements: any = [];
  departementSelected: string;
  departementsDrop: SelectItem[];
  LABEL_HOSPITALISATION = `Patients covid hospitaliser`;
  LABEL_REANIMATION = `Patients covid en réanimation`;
  @ViewChild('chart')
  chart: UIChart;
  @ViewChild('chartDece')
  chartDece: UIChart;
  @ViewChild('chartHospAndDece')
  chartHospAndDece: UIChart;
  @ViewChild('chartHospEcartType')
  chartHospEcartType: UIChart;
  hospitaliseParJour = [];
  decesParJour = [];
  data = {
    labels: [],
    datasets: []
  };
  dataDece = {
    labels: [],
    datasets: []
  };
  dataHospAndDece = {
    labels: [],
    datasets: []
  };
  dataHospEcartType = {
    labels: [],
    datasets: []
  };

  constructor(private newsService: HospitaliseService, private adresseService: AdresseService) {
    this.adresseService.getAllDepartement().subscribe(rep => {
      this.departements = rep;
      this.departementsDrop = this.departements.map(dep => ({label: dep.nom, value: dep.code}));
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.init(), 50);
  }

  init(): void {
    if (this.newsService.csv[0].data.length > 0 && this.hospitaliseParJour.length === 0) {
      this.hospitaliseParJour = this.newsService.csv[0].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v), r), {});
      this.data.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
      this.updateChart('#0f29ae', this.LABEL_HOSPITALISATION, 'hosp', this.ENUM_SEX.TOUS);
      this.updateChart('#e00101', this.LABEL_REANIMATION, 'rea', this.ENUM_SEX.TOUS);
    }
    if (this.newsService.csv[1].data.length > 0 && this.decesParJour.length === 0) {
      this.decesParJour = this.newsService.csv[1].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v), r), {});
      this.dataDece.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
      this.updateChartDece();

      this.dataHospAndDece.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
      this.updateChartHospAndDece();

      this.dataHospEcartType.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
      this.updateChartHospEcartType();
    }
  }

  refresh(): void {
    this.chart.reinit();
    this.data.datasets = [];
    this.updateChart('#0f29ae', this.LABEL_HOSPITALISATION, 'hosp', this.sexSelected);
    this.updateChart('#e00101', this.LABEL_REANIMATION, 'rea', this.sexSelected);
  }

  updateChart(couleur: any, label: any, filtre: any, sex: string): void {
    const data = this.gethospitaliseByFilter(filtre, sex);
    this.data.datasets.push({
      label: `${label}`,
      fill: false,
      borderColor: couleur,
      data
    });
    this.chart.refresh();
  }

  gethospitaliseByFilter(filtre: string, sex: string): any[] {
    if (this.departementSelected) {
      return Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['1']
        .filter((ha: any) => ha.dep === this.departementSelected)
        .reduce((r, v, i, a, k = v.sexe) => ((r[k] || (r[k] = [])).push(v[filtre]) , r), {})[sex])
        .map(ha => this.reduceAdd(ha));
    } else {
      return Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['1']
        .reduce((r, v, i, a, k = v.sexe) => ((r[k] || (r[k] = [])).push(v[filtre]) , r), {})[sex])
        .map(ha => this.reduceAdd(ha));
    }
  }

  reduceAdd(array: Array<any>): any {
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    return array ? array.reduce(reducer) : undefined;
  }

  updateChartDece(): void {
    const data = this.getDecesByDay();
    this.dataDece.datasets.push({
      label: `Nombre quotidien de personnes nouvellement décédées`,
      fill: false,
      borderColor: '#1c9903',
      data
    });
    this.chartDece.refresh();
    this.chartDece.refresh();
  }

  getDecesByDay(): any[] {
    return Object.entries(this.decesParJour).map(hospJour => hospJour['1']
      .reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v.incid_dc) , r), {}))
      .map(j => this.reduceAdd(Object.values(j)['0']));
  }

  updateChartHospAndDece(): void {
    const dataDece = this.getDecesByDay();
    this.dataHospAndDece.datasets.push({
      label: `Nombre quotidien de personnes nouvellement décédées`,
      fill: false,
      borderColor: '#990303',
      data: dataDece
    });
    this.chartHospAndDece.refresh();

    const data = this.gethospitaliseByFilter('hosp', this.ENUM_SEX.TOUS);
    this.dataHospAndDece.datasets.push({
      label: `Nombre de personnes actuellement hospitalisées`,
      fill: false,
      borderColor: '#022179',
      data
    });
    this.chartHospAndDece.refresh();
  }

  updateChartHospEcartType(): void {
    const data = this.gethospitaliseByFilter('hosp', this.ENUM_SEX.TOUS);

    let dataStd = data.map((v, i) => data[i + 1] && v ? math.std(v, data[i + 1]) : undefined);
    dataStd = dataStd.map((v, i) => dataStd[i + 1] && v ? (v + dataStd[i + 1]) / 2 : undefined);
    this.dataHospEcartType.datasets.push({
      label: `Ecart type du nombre de personnes actuellement hospitalisées`,
      fill: false,
      borderColor: '#022179',
      data: dataStd
    });
    this.chartHospEcartType.refresh();
  }
}
