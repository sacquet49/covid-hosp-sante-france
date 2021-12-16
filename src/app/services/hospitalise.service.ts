import {Injectable, Output} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EventEmitter} from 'events';

@Injectable()
export class HospitaliseService {

  header_node = {
    Accept: 'application/json',
    rejectUnauthorized: 'false',
  };

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
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/${type}/${sex}/${departement}`,{headers: this.header_node});
  }

  getDecesByDay(): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/decesByDay`, {headers: this.header_node});
  }

  getLabelsDay(): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/labelsDay`, {headers: this.header_node});
  }

  getdataAgeByTypeAndDateAndRegion(type, dateMin, dateMax, region): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/trancheAge/${type}/${dateMin}/${dateMax}/${region}`,{headers: this.header_node});
  }

  labelsDayByDate(dateMin, dateMax): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/labelsDay/ByDate/${dateMin}/${dateMax}`, {headers: this.header_node});
  }

  getHospitaliseTrancheAgeByDate(filtre, date): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/hospitalise/${filtre}/trancheAge/byDate/${date}`, {headers: this.header_node});
  }

  getHospitaliseVariationTrancheAgeByDate(filtre, dateMin, dateMax): Observable<any> {
    return this.http.get(`https://ec2-13-38-104-219.eu-west-3.compute.amazonaws.com/data/hospitalise/variation/${filtre}/trancheAge/byDate/${dateMin}/${dateMax}`, {headers: this.header_node});
  }
}
