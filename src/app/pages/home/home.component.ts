import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Olympic } from '../../core/models/olympic.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public pieChart!: Chart<'pie', number[], string>;
  public totalCountries: number = 0;
  public totalJOs: number = 0;
  public error!: string;
  titlePage: string = 'Medals per Country';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Olympic[]>(this.olympicUrl).subscribe({
      next: (data: Olympic[]) => {
        if (data && data.length > 0) {
          this.totalJOs = Array.from(
            new Set(data.flatMap((olympic) => olympic.participations.map((p) => p.year)))
          ).length;
          const countries: string[] = data.map((olympic) => olympic.country);
          this.totalCountries = countries.length;
          const sumOfAllMedalsYears: number[] = data.map((olympic) =>
            olympic.participations.reduce((acc, p) => acc + p.medalsCount, 0)
          );
          this.buildPieChart(countries, sumOfAllMedalsYears);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.message;
      },
    });
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]): void {
    const pieChart = new Chart('DashboardPieChart', {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [
          {
            label: 'Medals',
            data: sumOfAllMedalsYears,
            backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(
              e.native,
              'point',
              { intersect: true },
              true
            );
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels
                ? pieChart.data.labels[firstPoint.index]
                : '';
              this.router.navigate(['country', countryName]);
            }
          }
        },
      },
    });
    this.pieChart = pieChart;
  }
}
