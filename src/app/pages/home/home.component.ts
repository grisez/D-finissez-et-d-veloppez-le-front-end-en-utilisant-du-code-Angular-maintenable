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
    const pieChart = new Chart('DashboardPieChart', {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [
          {
            label: 'Medals',
            data: medals,
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
              const index = points[0].index;
              const countryId = data[index].id;
              this.router.navigate(['country', countryId]);
            }
          }
        },
      },
    });
    this.pieChart = pieChart;
  }
}
