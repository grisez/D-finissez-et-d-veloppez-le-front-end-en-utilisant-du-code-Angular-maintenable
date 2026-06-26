import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Olympic } from '../../models/olympic.model';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public lineChart!: Chart<'line', number[], number>;
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

  ngOnInit(): void {
    let countryId: string | null = null;
    this.route.paramMap.subscribe((param: ParamMap) => (countryId = param.get('id')));
    this.http.get<Olympic[]>(this.olympicUrl).subscribe({
      next: (data: Olympic[]) => {
        if (data && data.length > 0) {
          const selectedCountry = data.find((olympic) => olympic.country === countryId);
          if (!selectedCountry) {
            this.router.navigate(['/not-found']);
            return;
          }
          this.titlePage = selectedCountry.country;
          this.totalEntries = selectedCountry.participations.length;
          this.totalMedals = selectedCountry.participations.reduce(
            (acc, p) => acc + p.medalsCount,
            0
          );
          this.totalAthletes = selectedCountry.participations.reduce(
            (acc, p) => acc + p.athleteCount,
            0
          );
          const years: number[] = selectedCountry.participations.map((p) => p.year);
          const medals: number[] = selectedCountry.participations.map((p) => p.medalsCount);
          this.buildChart(years, medals);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.message;
      },
    });
  }

  buildChart(years: number[], medals: number[]): void {
    new Chart('countryChart', {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Medals',
            data: medals,
            backgroundColor: '#0b868f',
            borderColor: '#0b868f',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }
}
