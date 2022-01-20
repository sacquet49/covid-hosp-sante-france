import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Departement, Region} from './core.model';

@Injectable()
export class AdresseService {

    constructor(private http: HttpClient) {
    }

    getAllDepartement(): Observable<Departement[]> {
        return this.http.get<Departement[]>('https://geo.api.gouv.fr/departements?fields=nom,code,codeRegion');
    }

    getAllRegion(): Observable<Region[]> {
        return this.http.get<Region[]>('https://geo.api.gouv.fr/regions?fields=nom,code');
    }
}
