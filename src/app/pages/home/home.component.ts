import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Olympic } from '../../models/olympic.model';
import { HeaderComponent } from '../../components/header/header.component';
import { ErrorComponent } from '../../components/error/error.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, ErrorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public pieChart!: Chart<'pie', number[], string>;
  public totalCountries: number = 0;
  public totalJOs: number = 0;
  public loading: boolean = true;
  public error!: string;
  public isEmpty: boolean = false;
  public titlePage: string = 'Medals per Country';

  constructor(private router: Router, private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympicService.getOlympics().subscribe({
      next: (data: Olympic[]) => {
        this.loading = false;
        if (!data || data.length === 0) {
          this.isEmpty = true;
          return;
        }
        this.totalJOs = Array.from(
          new Set(data.flatMap((o) => o.participations.map((p) => p.year)))
        ).length;
        this.totalCountries = data.length;
        const countries = data.map((o) => o.country);
        const medals = data.map((o) =>
          o.participations.reduce((acc, p) => acc + p.medalsCount, 0)
        );
        setTimeout(() => this.buildPieChart(data, countries, medals));
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message;
      },
    });
  }

  buildPieChart(data: Olympic[], countries: string[], medals: number[]): void {
    // Pastel palette — hues spaced exactly 60° apart for colorblind accessibility
    const palette = [
      '#ffadad', // pastel red     (0°)
      '#fdffb6', // pastel yellow  (60°)
      '#caffbf', // pastel green   (120°)
      '#9bf6ff', // pastel cyan    (180°)
      '#a0c4ff', // pastel blue    (240°)
      '#ffc6ff', // pastel pink    (300°)
    ];

    const pieChart = new Chart('DashboardPieChart', {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: medals,
          backgroundColor: palette,
          borderColor: 'rgba(15,23,42,0.8)',
          borderWidth: 2,
          hoverOffset: 12,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#cbd5e1',
              font: { family: 'Inter, system-ui, sans-serif', size: 13 },
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.9)',
            borderColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            padding: 12,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed} medals`,
            },
          },
        },
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(
              e.native, 'point', { intersect: true }, true
            );
            if (points.length) {
              const countryId = data[points[0].index].id;
              this.router.navigate(['country', countryId]);
            }
          }
        },
      },
    });
    this.pieChart = pieChart;
  }
}
