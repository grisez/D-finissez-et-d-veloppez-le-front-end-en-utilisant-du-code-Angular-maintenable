import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Olympic } from '../../models/olympic.model';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [RouterLink, HeaderComponent],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  public titlePage: string = '';
  public totalEntries: number = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;

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

    this.olympicService.getCountryById(id).subscribe({
      next: (country: Olympic | undefined) => {
        if (!country) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.titlePage = country.country;
        this.totalEntries = country.participations.length;
        this.totalMedals = country.participations.reduce(
          (acc, p) => acc + p.medalsCount,
          0
        );
        this.totalAthletes = country.participations.reduce(
          (acc, p) => acc + p.athleteCount,
          0
        );
        const years = country.participations.map((p) => p.year);
        const medals = country.participations.map((p) => p.medalsCount);
        this.buildChart(years, medals);
      },
      error: (err) => {
        this.error = err.message;
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
