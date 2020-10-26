import {Component, OnInit, ViewChild} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import {Subscription} from 'rxjs';
import * as moment from 'moment';
import {UIChart} from 'primeng/chart';

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
  hospitaliseParAge = [];
  hospitaliseReaParAge = [];
  minDate;
  maxDate;
  jour;
  data: any;

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
      }
    });
  }

  updateChart(): any {
    this.hospitaliseParAge = [];
    this.hospitaliseReaParAge = [];
    this.chart.reinit();
    this.chart.refresh();

    const date = moment(this.jour).format('YYYY-MM-DD');
    const dateFr = moment(this.jour).format('DD-MM-YYYY');
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    Object.entries(this.hospitaliseParJour[date]
      .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v.hosp) , r), {}))
      .map((ha: any) => this.hospitaliseParAge.push(ha['1'].reduce(reducer)));

    Object.entries(this.hospitaliseParJour[date]
      .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v.rea) , r), {}))
      .map((ha: any) => this.hospitaliseReaParAge.push(ha['1'].reduce(reducer)));

    this.data = {
      labels: ['0- 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90' ],
      datasets: [
        {
          label: `Patient covid hospitaliser au ${dateFr}`,
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: this.hospitaliseParAge.slice(1)
        },
        {
          label: `Patient covid hospitaliser en réanimation au ${dateFr}`,
          backgroundColor: '#9CCC65',
          borderColor: '#7CB342',
          data: this.hospitaliseReaParAge.slice(1)
        }
      ]
    };
  }
}
