import {Component} from '@angular/core';
import {HospitaliseService} from '../services/hospitalise.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'ass-home',
  templateUrl: './home.component.html',
  providers: []
})
export class HomeComponent {

  subscription: Subscription;
  hospitaliseParJour = [];
  hospitaliseParAge = [];
  hospitaliseReaParAge = [];
  data: any;

  constructor(private newsService: HospitaliseService) {
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    this.subscription = this.newsService.getCsv().subscribe(csv => {
      if (csv[2].data.length > 0 && this.hospitaliseParJour.length === 0) {
        this.hospitaliseParJour = csv[2].data.reduce((r, v, i, a, k = v.jour) => ((r[k] || (r[k] = [])).push(v), r), {});

        Object.entries(this.hospitaliseParJour['2020-10-25']
          .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v.hosp) , r), {}))
          .map((ha: any) => this.hospitaliseParAge.push(ha['1'].reduce(reducer)));

        Object.entries(this.hospitaliseParJour['2020-10-25']
          .reduce((r, v, i, a, k = v.cl_age90) => ((r[k] || (r[k] = [])).push(v.rea) , r), {}))
          .map((ha: any) => this.hospitaliseReaParAge.push(ha['1'].reduce(reducer)));

        this.data = {
          labels: ['0- 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90' ],
          datasets: [
            {
              label: 'Patient covid hospitaliser au 2020-10-25',
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              data: this.hospitaliseParAge.slice(1)
            },
            {
              label: 'Patient covid hospitaliser en réanimation au 2020-10-25',
              backgroundColor: '#9CCC65',
              borderColor: '#7CB342',
              data: this.hospitaliseReaParAge.slice(1)
            }
          ]
        };
      }
    });
  }
}
