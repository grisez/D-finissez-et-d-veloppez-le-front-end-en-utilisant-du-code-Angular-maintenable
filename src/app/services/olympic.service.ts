import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, map } from 'rxjs/operators';
import { Olympic } from '../models/olympic.model';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private readonly olympicUrl = './assets/mock/olympic.json';

  private olympics$: Observable<Olympic[]> = this.http
    .get<Olympic[]>(this.olympicUrl)
    .pipe(
      shareReplay(1),
      catchError((error) => throwError(() => error))
    );

  constructor(private http: HttpClient) {}

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$;
  }

  getCountryById(id: number): Observable<Olympic | undefined> {
    return this.olympics$.pipe(
      map((olympics) => olympics.find((o) => o.id === id))
    );
  }

  getTotalCountries(): Observable<number> {
    return this.olympics$.pipe(map((data) => data.length));
  }

  getTotalJOs(): Observable<number> {
    return this.olympics$.pipe(
      map((data) => new Set(data.flatMap((o) => o.participations.map((p) => p.year))).size)
    );
  }
}
