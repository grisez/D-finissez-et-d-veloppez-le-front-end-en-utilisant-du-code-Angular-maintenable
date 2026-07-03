import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Olympic } from '../../models/olympic.model';
import { HeaderComponent } from '../../components/header/header.component';
import { ErrorComponent } from '../../components/error/error.component';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [AsyncPipe, RouterLink, HeaderComponent, ErrorComponent],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  public titlePage = '';
  public totalEntries = 0;
  public totalMedals = 0;
  public totalAthletes = 0;
  public error = '';

  public country$!: Observable<Olympic | undefined>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (isNaN(id)) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.country$ = this.olympicService.getCountryById(id).pipe(
      tap((country) => {
        if (!country) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.titlePage = country.country;
        this.totalEntries = country.participations.length;
        this.totalMedals = country.participations.reduce(
          (acc, p) => acc + p.medalsCount, 0
        );
        this.totalAthletes = country.participations.reduce(
          (acc, p) => acc + p.athleteCount, 0
        );
        if (country.participations.length > 0) {
          const years = country.participations.map((p) => p.year);
          const medals = country.participations.map((p) => p.medalsCount);
          setTimeout(() => this.buildChart(years, medals));
        }
      }),
      catchError((err) => {
        this.error = err.message;
        return EMPTY;
      })
    );
  }

  buildChart(years: number[], medals: number[]): void {
    const canvas = document.getElementById('countryChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const gradient = ctx!.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99,102,241,0.4)');
    gradient.addColorStop(1, 'rgba(99,102,241,0.0)');

    new Chart('countryChart', {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Medals',
          data: medals,
          borderColor: '#818cf8',
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointBackgroundColor: '#818cf8',
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.35,
        }],
      },
      options: {
        aspectRatio: 2.5,
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif' } },
            grid: { color: 'rgba(255,255,255,0.06)' },
            border: { color: 'rgba(255,255,255,0.1)' },
          },
          y: {
            ticks: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif' } },
            grid: { color: 'rgba(255,255,255,0.06)' },
            border: { color: 'rgba(255,255,255,0.1)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.9)',
            borderColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            padding: 12,
            callbacks: { label: (ctx) => ` ${ctx.parsed.y} medals` },
          },
        },
      },
    });
  }
}
