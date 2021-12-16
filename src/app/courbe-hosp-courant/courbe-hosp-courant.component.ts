import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import {UIChart} from 'primeng/chart';
import {AdresseService} from '../services/adresse.service';
import {SelectItem} from 'primeng/api';
import * as math from 'mathjs';
import {Dropdown} from 'primeng/dropdown';

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
  LABEL_HOSPITALISATION = `Patients covid hospitaliser (comprend les réanimations)`;
  LABEL_REANIMATION = `Patients covid en réanimation`;
  @ViewChild('chart')
  chart: UIChart;
  @ViewChild('chartDece')
  chartDece: UIChart;
  @ViewChild('chartHospEcartType')
  chartHospEcartType: UIChart;
  @ViewChild('departement')
  departement: Dropdown;
  data = {
    labels: [],
    datasets: []
  };
  dataDece = {
    labels: [],
    datasets: []
  };
  dataHospEcartType = {
    labels: [],
    datasets: []
  };

  constructor(private hospService: HospitaliseService, private adresseService: AdresseService) {
    this.adresseService.getAllDepartement().subscribe(rep => {
      this.departements = rep;
      this.departementsDrop = this.departements.map(dep => ({label: dep.code + ' - ' + dep.nom, value: dep.code}));
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.init(), 50);
  }

  init(): void {
    this.hospService.getLabelsDay()
      .subscribe(labels => {
        this.data.labels = labels;
        this.updateChart('#0f29ae', this.LABEL_HOSPITALISATION, 'hosp', this.ENUM_SEX.TOUS);
        this.updateChart('#e00101', this.LABEL_REANIMATION, 'rea', this.ENUM_SEX.TOUS);

        this.dataDece.labels = labels;
        this.updateChartDece();

        this.dataHospEcartType.labels = labels;
        this.updateChartHospEcartType();
      });
  }

  refresh(): void {
    if (!this.departementSelected) {
      this.departement.resetFilter();
    }
    this.chart.reinit();
    this.data.datasets = [];
    this.updateChart('#0f29ae', this.LABEL_HOSPITALISATION, 'hosp', this.sexSelected);
    this.updateChart('#e00101', this.LABEL_REANIMATION, 'rea', this.sexSelected);
  }

  updateChart(couleur: any, label: any, filtre: any, sex: string): void {
    this.hospService.getdataHospByTypeAndSexeAndDepartement(filtre, sex, this.departementSelected)
      .subscribe(data => {
        this.data.datasets.push({
          label: `${label}`,
          fill: false,
          borderColor: couleur,
          data
        });
        this.chart.refresh();
      });
  }

  updateChartDece(): void {
    this.hospService.getDecesByDay().subscribe(data => {
      this.dataDece.datasets.push({
        label: `Nombre quotidien de personnes nouvellement décédées`,
        fill: false,
        borderColor: '#1c9903',
        data
      });
      this.chartDece.refresh();
      this.chartDece.refresh();
    });
  }

  updateChartHospEcartType(): void {
    this.hospService.getdataHospByTypeAndSexeAndDepartement('hosp', this.ENUM_SEX.TOUS, this.departementSelected)
      .subscribe(data => {
        let dataStd = data.map((v, i) => data[i + 1] && v ? math.std(v, data[i + 1]) : undefined);
        dataStd = dataStd.map((v, i) => dataStd[i + 1] && v ? (v + dataStd[i + 1]) / 2 : undefined);
        this.dataHospEcartType.datasets.push({
          label: `Ecart type du nombre de personnes actuellement hospitalisées`,
          fill: false,
          borderColor: '#022179',
          data: dataStd
        });
        this.chartHospEcartType.refresh();

        this.hospService.getDecesByDay().subscribe(dataDece => {
          this.dataHospEcartType.datasets.push({
            label: `Nombre quotidien de personnes nouvellement décédées`,
            fill: false,
            borderColor: '#990303',
            data: dataDece
          });
          this.chartHospEcartType.refresh();
        });
      });
  }
}
