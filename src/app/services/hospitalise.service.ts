import {Injectable, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {EventEmitter} from 'events';

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

  roundDecimal(nombre, precision): any {
    precision = precision || 2;
    const tmp = Math.pow(10, precision);
    return Math.round(nombre * tmp) / tmp;
  }

  getdataHospByTypeAndSexeAndDepartement(type, sex, departement): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/${type}/${sex}/${departement}`);
  }

  getDecesByDay(): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/decesByDay`);
  }

  getLabelsDay(): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/labelsDay`);
  }

  getdataAgeByTypeAndDateAndRegion(type, dateMin, dateMax, region): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/trancheAge/${type}/${dateMin}/${dateMax}/${region}`);
  }

  labelsDayByDate(dateMin, dateMax): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/labelsDay/ByDate/${dateMin}/${dateMax}`);
  }

  getHospitaliseTrancheAgeByDate(filtre, date): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/hospitalise/${filtre}/trancheAge/byDate/${date}`);
  }

  getHospitaliseVariationTrancheAgeByDate(filtre, dateMin, dateMax): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/hospitalise/variation/${filtre}/trancheAge/byDate/${dateMin}/${dateMax}`);
  }

  getDataByTypeAndSexAndDepartementAndDate(filtre, sex, departement, dateMin, dateMax): Observable<any> {
    return this.http.get(`https://www.sacquet-covid.link/data/hospCourant/byDate/${filtre}/${sex}/${departement}/${dateMin}/${dateMax}`);
  }
}
