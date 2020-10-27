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

  @ViewChild('chart')
  chart: UIChart;
  subscription: Subscription;
  hospitaliseParJour = [];
  minDate;
  maxDate;
  jour;
  jour2;
  data: any;
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

  updateChart(): any {
    this.chart.reinit();
    this.chart.refresh();
    const date = moment(this.jour).format('YYYY-MM-DD');
    const dateFr = moment(this.jour).format('DD-MM-YYYY');
    this.data = {
      labels: ['0- 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90' ],
      datasets: [
        {
          label: `Patients covid hospitalisés au ${dateFr}`,
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: this.gethospitaliseByFilterAndDate('hosp', date)
        },
        {
          label: `Patients covid hospitalisés en réanimation au ${dateFr}`,
          backgroundColor: '#9CCC65',
          borderColor: '#7CB342',
          data: this.gethospitaliseByFilterAndDate('rea', date)
        }
      ]
    };
    if(this.jour2) {
      this.updateChartJour2();
    }
  }

  updateChartJour2(): any {
    const date = moment(this.jour2).format('YYYY-MM-DD');
    const dateFr = moment(this.jour2).format('DD-MM-YYYY');
    this.data.datasets.push({
      label: `Patients covid hospitalisés au ${dateFr}`,
      backgroundColor: '#9f0650',
      borderColor: '#980235',
      data: this.gethospitaliseByFilterAndDate('hosp', date)
    });
    this.data.datasets.push({
      label: `Patients covid hospitalisés au ${dateFr}`,
      backgroundColor: '#b80000',
      borderColor: '#ea0000',
      data: this.gethospitaliseByFilterAndDate('rea', date)
    });
  }

  gethospitaliseByFilterAndDate(filtre: string, date: string): any[] {
    const hospitalise = [];
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    Object.entries(this.hospitaliseParJour[date]
      .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v[filtre]) , r), {}))
      .map((ha: any) => hospitalise.push(ha['1'].reduce(reducer)));
    return hospitalise.slice(1);
  }
}
