import {Injectable, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {EventEmitter} from 'events';

@Injectable()
export class HospitaliseService {

  private subjectCsvHospitalisation = new Subject<any>();

  csv = [
    {nom: 'covid-hosp-txad-age-fra', id: '', data: []},
    {nom: 'covid-hosp-txad-reg', id: '', data: []},
    {nom: 'covid-hosp-txad-fra', id: '', data: []},
    {nom: 'donnees-hospitalieres-classe-age-hebdo-covid19', id: '', data: []},
    {nom: 'covid-hospit-incid-reg', id: '', data: []},
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
    this.getAllCsv().subscribe(csvData => {
      const jsonDataFilter: any[] = csvData.data.filter(j => !j.title.includes('metadonnees'));
      for (let i = 0; i < 9; i++) {
        // @ts-ignore
        this.csv[i].id = jsonDataFilter[i].id;
        this.getCsvByUrl(jsonDataFilter[i].latest).subscribe(dataCsv => {
          this.csv[i].data = this.csvJSON(dataCsv);
          this.subjectCsvHospitalisation.next(this.csv);
        });
      }
    });
  }

  getCsvByUrl(url: string): Observable<any> {
    return this.http.get(`${url}`, {responseType: 'text'});
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

  getAllCsv(): Observable<any> {
    return this.http.get('https://www.data.gouv.fr/api/2/datasets/5e7e104ace2080d9162b61d8/resources/');
  }

  getAllHospData(): Observable<any> {
    return this.http.get('https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/live/france/all');
  }

  getdataHospByTypeAndSexeAndDepartement(type, sex, departement): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/${type}/${sex}/${departement}`);
  }
}
