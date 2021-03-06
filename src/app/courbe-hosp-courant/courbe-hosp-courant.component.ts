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
        if (this.hospService.csv[1].data.length > 0 && this.hospitaliseParJour.length === 0) {
            this.hospitaliseParJour = this.hospService.csv[1].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = []))
                .push(v), r), {});
            this.data.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
            this.updateChart('#0f29ae', this.LABEL_HOSPITALISATION, 'hosp', this.ENUM_SEX.TOUS);
            this.updateChart('#e00101', this.LABEL_REANIMATION, 'rea', this.ENUM_SEX.TOUS);
        }
        if (this.hospService.csv[2].data.length > 0 && this.decesParJour.length === 0) {
            this.decesParJour = this.hospService.csv[2].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v), r), {});
            this.dataDece.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
            this.updateChartDece();

            this.dataHospEcartType.labels = Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['0']);
            this.updateChartHospEcartType();
        }
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
        let data = [];
        if (typeof filtre === 'string') {
            data = this.gethospitaliseByFilter(filtre, sex);
        } else {
            filtre?.forEach((f, i) => {
                if (i === 0) {
                    data = this.gethospitaliseByFilter(f, sex);
                } else {
                    // tslint:disable-next-line:no-shadowed-variable
                    this.gethospitaliseByFilter(f, sex)?.forEach((d, i: number) => {
                        // tslint:disable-next-line:radix
                        data[i] = parseInt(data[i]) + parseInt(d);
                    });
                }
            });
        }
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
                .map(ha => this.hospService.reduceAdd(ha));
        } else {
            return Object.entries(this.hospitaliseParJour).map(hospJour => hospJour['1']
                .reduce((r, v, i, a, k = v.sexe) => ((r[k] || (r[k] = [])).push(v[filtre]) , r), {})[sex])
                .map(ha => this.hospService.reduceAdd(ha));
        }
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
            .map(j => this.hospService.reduceAdd(Object.values(j)['0']));
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

        const dataDece = this.getDecesByDay();
        this.dataHospEcartType.datasets.push({
            label: `Nombre quotidien de personnes nouvellement décédées`,
            fill: false,
            borderColor: '#990303',
            data: dataDece
        });
        this.chartHospEcartType.refresh();
    }
}
