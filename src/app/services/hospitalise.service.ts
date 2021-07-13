import {Injectable, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {EventEmitter} from 'events';

@Injectable()
export class HospitaliseService {

  private subjectCsvHospitalisation = new Subject<any>();

  csv = [
    {nom: 'donnees-hospitalieres-covid19', id: '', data: []},
    {nom: 'donnees-hospitalieres-nouveaux-covid19', id: '', data: []},
    {nom: 'donnees-hospitalieres-classe-age-covid19', id: '', data: []},
    {nom: 'donnees-hospitalieres-etablissements-covid19', id: '', data: []}
  ];

  @Output()
  isInit = new EventEmitter<number>();

  constructor(private http: HttpClient) {
    this.initDataPage();
  }

  initDataPage(): void {
    this.getDataPage().subscribe(rep => {
      const articlesDom = new DOMParser().parseFromString(rep, 'text/html')
        .querySelectorAll('article');
      for (let i = 0; i < 4; i++) {
        // @ts-ignore
        this.csv[i].id = articlesDom[i].childNodes[1]?.firstElementChild?.id?.replace('resource-', '').replace('-header', '');
        this.getCsvToPage(this.csv[i].id).subscribe(dataCsv => {
          this.csv[i].data = this.csvJSON(dataCsv);
          this.subjectCsvHospitalisation.next(this.csv);
        });
      }
    });
  }

  getDataPage(): Observable<any> {
    return this.http.get('https://www.data.gouv.fr/fr/datasets/donnees-hospitalieres-relatives-a-lepidemie-de-covid-19/',
      {responseType: 'text'});
  }

  getCsvToPage(id: string): Observable<any> {
    return this.http.get(`https://www.data.gouv.fr/fr/datasets/r/${id}`, {responseType: 'text'});
  }

  csvJSON(csv): any {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(';');
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(';');
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j].replace(/"/g, '')?.trim()] = currentline[j]?.replace(/"/g, '').replace(/\r/g, '');
      }
      result.push(obj);
    }
    return result;
  }

  getCsv(): Observable<any> {
    return this.subjectCsvHospitalisation.asObservable();
  }

  reduceAdd(array: Array<any>): any {
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    return array?.reduce(reducer);
  }

  roundDecimal(nombre, precision): any {
    precision = precision || 2;
    const tmp = Math.pow(10, precision);
    return Math.round(nombre * tmp) / tmp;
  }
}
