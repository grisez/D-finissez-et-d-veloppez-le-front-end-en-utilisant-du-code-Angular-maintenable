import Chart, { Plugin } from 'chart.js/auto';
import { Olympic } from '../models/olympic.model';

// Figma spec colors — one per country
export const COUNTRY_COLORS: Record<string, string> = {
  'Italy':         'rgb(148, 95, 100)',
  'Spain':         'rgb(183, 202, 230)',
  'United States': 'rgb(136, 160, 218)',
  'Germany':       'rgb(120, 60, 81)',
  'France':        'rgb(150, 127, 160)',
};

// Desired clockwise draw order (determines which slices are left/right visually)
const DRAW_ORDER = ['Spain', 'Italy', 'Germany', 'United States', 'France'];

// Custom plugin: horizontal lines from circle edge to a fixed x column per side
const externalLabelsPlugin: Plugin<'pie'> = {
  id: 'externalLabels',
  afterDatasetsDraw(chart) {
    const { ctx, data, chartArea } = chart;
    const meta = chart.getDatasetMeta(0);
    const colors = data.datasets[0].backgroundColor as string[];
    const LABEL_GAP = 8;
    const FONT_SIZE = 17;

    const xLeftCol  = chartArea.left + 4;
    const xRightCol = chartArea.right - 4;

    meta.data.forEach((arc, index) => {
      const { startAngle, endAngle, outerRadius, x: cx, y: cy } =
        arc.getProps(['startAngle', 'endAngle', 'outerRadius', 'x', 'y'], true);

      const midAngle = (startAngle + endAngle) / 2;
      const label = String(data.labels?.[index] ?? '');
      const color = colors[index];
      const isLeft = Math.cos(midAngle) < 0;

      const horizontalY = cy + Math.sin(midAngle) * outerRadius;
      const dx = Math.sqrt(Math.max(0, outerRadius ** 2 - (horizontalY - cy) ** 2));
      const xEdge = isLeft ? cx - dx : cx + dx;
      const xCol = isLeft ? xLeftCol : xRightCol;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xEdge, horizontalY);
      ctx.lineTo(xCol, horizontalY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.textAlign = isLeft ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${FONT_SIZE}px Inter, system-ui, sans-serif`;
      ctx.fillText(label, isLeft ? xCol - LABEL_GAP : xCol + LABEL_GAP, horizontalY);
      ctx.restore();
    });
  },
};

export function buildPieChart(
  data: Olympic[],
  countries: string[],
  medals: number[],
  onCountryClick: (id: number) => void
): void {
  // Reorder data to control slice positions (Spain→Italy left, Germany→US→France right)
  const order = DRAW_ORDER.map((name) => countries.indexOf(name)).filter((i) => i >= 0);
  const sortedData      = order.map((i) => data[i]);
  const sortedCountries = order.map((i) => countries[i]);
  const sortedMedals    = order.map((i) => medals[i]);
  const backgroundColor = sortedCountries.map((c) => COUNTRY_COLORS[c] ?? 'rgb(200,200,200)');
  const hoverBg         = backgroundColor;

  const chart = new Chart('DashboardPieChart', {
    type: 'pie',
    plugins: [externalLabelsPlugin],
    data: {
      labels: sortedCountries,
      datasets: [{
        data: sortedMedals,
        backgroundColor,
        hoverBackgroundColor: hoverBg,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: 90,
      layout: { padding: { top: 30, right: 120, bottom: 30, left: 120 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgb(4, 130, 142)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          titleAlign: 'center',
          bodyAlign: 'center',
          titleFont: { size: 14, weight: 'bold', family: 'Inter, system-ui, sans-serif' },
          bodyFont: { size: 13, family: 'Inter, system-ui, sans-serif' },
          padding: 14,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: (ctx) => `🏅 ${ctx.parsed} medals`,
          },
        },
      },
      onClick: (e) => {
        if (!e.native) return;
        const points = chart.getElementsAtEventForMode(
          e.native, 'nearest', { intersect: true }, true
        );
        if (points.length) {
          onCountryClick(sortedData[points[0].index].id);
        }
      },
    },
  });
}

export function buildLineChart(
  canvasId: string,
  years: number[],
  medals: number[]
): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(4,130,142,0.4)');
  gradient.addColorStop(1, 'rgba(4,130,142,0.0)');

  new Chart(canvasId, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Medals',
        data: medals,
        borderColor: 'rgb(4, 130, 142)',
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: 'rgb(4, 130, 142)',
        pointBorderColor: '#ffffff',
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
          ticks: { color: '#6b7280', font: { family: 'Inter, system-ui, sans-serif' } },
          grid: { color: 'rgba(0,0,0,0.06)' },
          border: { color: 'rgba(0,0,0,0.1)' },
        },
        y: {
          ticks: { color: '#6b7280', font: { family: 'Inter, system-ui, sans-serif' } },
          grid: { color: 'rgba(0,0,0,0.06)' },
          border: { color: 'rgba(0,0,0,0.1)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          borderColor: 'rgba(0,0,0,0.1)',
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
