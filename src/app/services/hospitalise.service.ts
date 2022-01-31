import {Injectable, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EventEmitter} from 'events';
import {environment} from '../../environments/environment';
import {RegionData} from '../hosp-age/hosp-age.model';

@Injectable()
export class HospitaliseService {

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
  }

  reduceAdd(array: Array<any>): any {
    // tslint:disable-next-line:radix
    const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    return array?.reduce(reducer);
  }

  roundDecimal(nombre: number, precision: number): number {
    const precisionNumber = precision || 2;
    const tmp = Math.pow(10, precisionNumber);
    return Math.round(nombre * tmp) / tmp;
  }

  public getdataHospByTypeAndSexeAndDepartement(type, sex, departement): Observable<any[]> {
    return this.http.get<any[]>(`${environment.urlWs}/open/api/${type}/${sex}/${departement}`);
  }

  public getDecesByDay(): Observable<number[]> {
    return this.http.get<number[]>(`${environment.urlWs}/open/api/decesByDay`);
  }

  public getdataAgeByTypeAndDateAndRegion(type, dateMin, dateMax, region): Observable<RegionData[]> {
    return this.http.get<RegionData[]>(`${environment.urlWs}/open/api/trancheAge/${type}/${dateMin}/${dateMax}/${region}`);
  }

  public getHospitaliseTrancheAgeByDate(filtre, date): Observable<number[]> {
    return this.http.get<number[]>(`${environment.urlWs}/open/api/hospitalise/${filtre}/trancheAge/byDate/${date}`);
  }

  public getHospitaliseVariationTrancheAgeByDate(filtre, dateMin, dateMax): Observable<number[]> {
    return this.http.get<number[]>(`${environment.urlWs}/open/api/hospitalise/variation/${filtre}/trancheAge/byDate/${dateMin}/${dateMax}`);
  }

  public getDataByTypeAndSexAndDepartementAndDate(filtre, sex, departement, dateMin, dateMax): Observable<number[]> {
    return this.http.get<number[]>(`${environment.urlWs}/open/api/hospCourant/byDate/${filtre}/${sex}/${departement}/${dateMin}/${dateMax}`);
  }

  public update(): Observable<any> {
    return this.http.get(`${environment.urlWs}/open/api/update`);
  }
}
