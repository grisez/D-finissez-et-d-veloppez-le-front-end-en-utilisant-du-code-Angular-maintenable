import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { switchMap, tap, catchError, map, filter } from 'rxjs/operators';
import { OlympicService } from '../../services/olympic.service';
import { Olympic } from '../../models/olympic.model';
import { ErrorComponent } from '../../components/error/error.component';
import { HeaderComponent, Kpi } from '../../components/header/header.component';
import { buildLineChart } from '../../utils/chart.utils';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [AsyncPipe, RouterLink, ErrorComponent, HeaderComponent],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent {
  public error = '';
  public headerTitle = '';
  public headerKpis: Kpi[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private olympicService = inject(OlympicService);

  public country$: Observable<Olympic | undefined> = this.route.paramMap.pipe(
    map((params) => { const raw = params.get('id'); return raw !== null ? Number(raw) : NaN; }),
    tap((id) => { if (isNaN(id)) this.router.navigate(['/not-found']); }),
    filter((id) => !isNaN(id)),
    switchMap((id) => this.olympicService.getCountryById(id)),
    tap((country) => {
      if (!country) {
        this.router.navigate(['/not-found']);
        return;
      }
      this.headerTitle = country.country;
      this.headerKpis = [
        { label: 'Number of entries', value: country.participations.length },
        { label: 'Total number of medals', value: country.participations.reduce((acc, p) => acc + p.medalsCount, 0) },
        { label: 'Total number of athletes', value: country.participations.reduce((acc, p) => acc + p.athleteCount, 0) },
      ];
      if (country.participations.length > 0) {
        const years = country.participations.map((p) => p.year);
        const medals = country.participations.map((p) => p.medalsCount);
        setTimeout(() => buildLineChart('countryChart', years, medals));
      }
    }),
    catchError((err) => {
      this.error = err.message;
      return EMPTY;
    })
  );
}
