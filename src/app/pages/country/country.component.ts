import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public lineChart!: Chart<'line', string[], number>;
  public titlePage: string = '';
  public totalEntries: number = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    let countryName: string | null = null;
    this.route.paramMap.subscribe((param: ParamMap) => (countryName = param.get('id')));
    this.http.get<any[]>(this.olympicUrl).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const selectedCountry = data.find((i: any) => i.country === countryName);
          if (!selectedCountry) {
            this.router.navigate(['/not-found']);
            return;
          }
          this.titlePage = selectedCountry.country;
          this.totalEntries = selectedCountry.participations.length;
          const years = selectedCountry.participations.map((i: any) => i.year);
          const medals = selectedCountry.participations.map((i: any) =>
            i.medalsCount.toString()
          );
          this.totalMedals = selectedCountry.participations.reduce(
            (acc: number, i: any) => acc + i.medalsCount,
            0
          );
          this.totalAthletes = selectedCountry.participations.reduce(
            (acc: number, i: any) => acc + i.athleteCount,
            0
          );
          this.buildChart(years, medals);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.message;
      },
    });
  }

  buildChart(years: number[], medals: string[]) {
    const lineChart = new Chart('countryChart', {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'medals',
            data: medals,
            backgroundColor: '#0b868f',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
    this.lineChart = lineChart;
  }
}
