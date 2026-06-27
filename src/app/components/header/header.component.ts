import { Component, Input } from '@angular/core';

export interface Kpi {
  label: string;
  value: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() kpis: Kpi[] = [];
}
