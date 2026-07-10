import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { OlympicService } from '../../services/olympic.service';
import { Olympic } from '../../models/olympic.model';
import { ErrorComponent } from '../../components/error/error.component';
import { HeaderComponent, Kpi } from '../../components/header/header.component';
import { buildPieChart } from '../../utils/chart.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, ErrorComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private router = inject(Router);
  private olympicService = inject(OlympicService);

  public error = '';
  public headerTitle = 'Medals per country';
  public headerKpis: Kpi[] = [];

  public olympics$: Observable<Olympic[]> = this.olympicService.getOlympics().pipe(
    tap((data) => {
      const totalJOs = new Set(data.flatMap((o) => o.participations.map((p) => p.year))).size;
      this.headerKpis = [
        { label: 'Number of JOs', value: totalJOs },
        { label: 'Number of countries', value: data.length },
      ];
      if (data.length > 0) {
        const countries = data.map((o) => o.country);
        const medals = data.map((o) =>
          o.participations.reduce((acc, p) => acc + p.medalsCount, 0)
        );
        setTimeout(() => buildPieChart(data, countries, medals, (id) => this.router.navigate(['country', id])));
      }
    }),
    catchError((err) => {
      this.error = err.message;
      return EMPTY;
    })
  );
}
