# Architecture — TéléSport Olympic Games

## 1. Tech Stack

- Angular 18 (standalone components)
- TypeScript strict (no `any`)
- RxJS (Observables + `async` pipe)
- Chart.js 4 (pie + line charts)
- Tailwind CSS (directives base/components/utilities uniquement)
- SCSS + CSS custom properties (design tokens)
- Angular Router (lazy loading)
- HttpClient (local JSON file)

---

## 2. Project Structure

```
src/
├── styles/
│   └── _mixins.scss              # Réservé aux futurs mixins partagés
├── styles.scss                   # Design tokens, reset, spinner, focus-visible
└── app/
    ├── models/
    │   ├── olympic.model.ts
    │   └── participation.model.ts
    ├── services/
    │   └── olympic.service.ts    # Single source of truth
    ├── utils/
    │   └── chart.utils.ts        # buildPieChart, buildLineChart
    ├── components/
    │   ├── header/               # Reusable header (title + KPIs)
    │   └── error/                # Reusable error message
    ├── pages/
    │   ├── home/                 # Route /
    │   ├── country/              # Route /country/:id
    │   └── not-found/            # Route **
    ├── app.component.ts
    ├── app.config.ts
    └── app.routes.ts
```

---

## 3. Architecture Decisions

### Standalone components
All components use `standalone: true`. No NgModule. Bootstrap via `bootstrapApplication`.

### Lazy loading
Every page loaded on demand via `loadComponent` in `app.routes.ts`.

### Data flow
```
olympic.json (local)
      │
      ▼
OlympicService  ──  shareReplay(1)
      │
      ▼
Observable
      │
      ▼
Component (| async pipe in template)
      │
      ▼
Template (@if / @for)
```

### Strict TypeScript
`strict: true` — zero `any` — all data typed via `Olympic` and `Participation` interfaces.

### inject() over constructor injection
All dependencies injected via `inject()` — no constructor parameters.

### No ngOnInit on CountryComponent
Route param handled reactively via `switchMap` on `route.paramMap`.

---

## 4. Data Models

```typescript
interface Participation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}

interface Olympic {
  id: number;
  country: string;
  participations: Participation[];
}
```

---

## 5. Components

### HeaderComponent (reusable)
- `@Input() title: string`
- `@Input() kpis: Kpi[]` — `{ label: string; value: number }`
- Used on Home and Country pages

### ErrorComponent (reusable)
- `@Input() message: string`
- Used on Home and Country pages

### HomePage `/`
- Pie chart — medals per country (Figma colors per country)
- KPIs: number of countries, number of Olympic editions
- Click on chart slice → navigate to `/country/:id`

### CountryPage `/country/:id`
- KPIs: participations, total medals, total athletes
- Line chart — medals per year (straight lines, no fill)
- Invalid ID → redirect to `/not-found`
- Back button → `/`

---

## 6. Business Rules

- Total medals = sum of `medalsCount` across all participations
- Total athletes = sum of `athleteCount` across all participations
- Number of JO editions = distinct years across all countries

---

## 7. UI States

| State | Display |
|-------|---------|
| Loading | Spinner CSS teal animé |
| Empty | "No data available" message |
| Error | `ErrorComponent` with message + back link |

---

## 8. Design System

White theme with teal accent (`rgb(4, 130, 142)`).

| Token | Value | Usage |
|-------|-------|-------|
| `--color-teal` | `rgb(4, 130, 142)` | Titre, bordures, liens |
| `--color-text` | `#111827` | Texte principal |
| `--color-muted` | `#4b5563` | Texte secondaire (7.1:1 contrast) |

Pie chart colors (Figma spec):

| Pays | Couleur |
|------|---------|
| Italy | `rgb(148, 95, 100)` |
| Spain | `rgb(183, 202, 230)` |
| United States | `rgb(136, 160, 218)` |
| Germany | `rgb(120, 60, 81)` |
| France | `rgb(150, 127, 160)` |

---

## 9. Accessibility

- Semantic HTML (`main`, `section`, `header`, `nav`, `ul/li`)
- `aria-label` on sections and charts
- `role="status"` on loading/empty states
- `role="alert"` on error messages
- Text contrast WCAG AA compliant (≥ 4.5:1)
- `:focus-visible` global — outline teal on all interactive elements

---

## 10. Responsive Design

| Breakpoint | Comportement |
|------------|-------------|
| ≥ 1200px | Layout centré, chart max-width 680px |
| 768–1199px | Chart pleine largeur |
| ≤ 767px | Padding réduit, chart plus petit, KPIs flex-wrap |

Pie chart : padding et taille de police des labels s'ajustent dynamiquement via le plugin Chart.js selon `chart.width`.

---

## 11. Routing

| Path | Page |
|------|------|
| `/` | HomePage |
| `/country/:id` | CountryPage |
| `/not-found` | NotFoundPage |
| `**` | NotFoundPage |

---

## 12. Git Strategy

Gitflow — `main` / `develop` / `feat*` / `refactor*` / `fix*` / `docs*`

Atomic commits — convention: `feat:` / `fix:` / `refactor:` / `docs:` / `chore:`

---

## 13. Out of Scope

- No authentication
- No backend / database
- No unit tests
- No sport detail (version ultérieure)
