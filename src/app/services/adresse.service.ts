import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class AdresseService {

    constructor(private http: HttpClient) {
    }

    getAllDepartement(): Observable<any> {
        return this.http.get('https://geo.api.gouv.fr/departements?fields=nom,code,codeRegion');
    }

    getAllRegion(): Observable<any> {
        return this.http.get('https://geo.api.gouv.fr/regions?fields=nom,code');
    }
}
