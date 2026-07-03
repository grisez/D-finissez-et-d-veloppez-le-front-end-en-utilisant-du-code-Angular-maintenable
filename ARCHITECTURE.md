# Architecture — TéléSport Olympic Games

## 1. Tech Stack

- Angular 18 (standalone components)
- TypeScript strict (no `any`)
- RxJS (Observables + `async` pipe)
- Chart.js 4 (pie + line charts)
- Tailwind CSS (via `@apply` in SCSS only — no utility classes in HTML)
- SCSS + CSS custom properties (design tokens)
- Angular Router (lazy loading)
- HttpClient (local JSON file)

---

## 2. Project Structure

```
src/
├── styles/
│   └── _mixins.scss              # Glass mixin
├── styles.scss                   # Design tokens, base reset, Tailwind directives
└── app/
    ├── models/
    │   ├── olympic.model.ts
    │   └── participation.model.ts
    ├── services/
    │   └── olympic.service.ts    # Single source of truth
    ├── components/
    │   ├── header/               # Reusable header (title + KPIs)
    │   └── error/                # Reusable error message
    ├── pages/
    │   ├── dashboard/            # Route /
    │   ├── country-detail/       # Route /country/:id
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
Component (subscribe in ngOnInit)
      │
      ▼
Template (@if / @for)
```

### Strict TypeScript
`strict: true` — zero `any` — all data typed via `Olympic` and `Participation` interfaces.

### Tailwind usage
Tailwind is used **only via `@apply`** inside SCSS files. HTML templates contain no Tailwind utility classes — keeping templates clean and readable.

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
- `@Input() kpis: { label: string; value: number }[]`
- Used on Dashboard and CountryDetail pages

### ErrorComponent (reusable)
- `@Input() message: string`
- Used on Dashboard and CountryDetail pages

### DashboardPage `/`
- Pie chart — medals per country (colorblind-safe pastel palette)
- KPIs: number of countries, number of Olympic editions
- Click on chart slice → navigate to `/country/:id`

### CountryDetailPage `/country/:id`
- KPIs: participations, total medals, total athletes
- Line chart — medals per year with gradient fill
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
| Loading | "Loading..." message |
| Empty | "No data available" message |
| Error | `ErrorComponent` with message + back link |

---

## 8. Design System

Dark glassmorphism theme with CSS custom properties:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#6366f1` | Indigo — gradients, accents |
| `--color-secondary` | `#06b6d4` | Cyan — links, hover |
| `--color-bg` | `#0f172a` | Page background |
| `--color-surface` | `rgba(255,255,255,0.06)` | Glass cards |
| `--color-text` | `#f1f5f9` | Main text (15:1 contrast) |
| `--color-text-muted` | `#cbd5e1` | Secondary text (7.5:1 contrast) |

Charts use a **colorblind-safe pastel palette** with hues spaced 60° apart.

---

## 9. Accessibility

- Semantic HTML (`main`, `section`, `header`, `nav`, `figure`, `ul/li`)
- `aria-label` on sections and charts
- `role="status"` on loading/empty states
- `role="alert"` on error messages
- Text contrast WCAG AA compliant (≥ 4.5:1)
- Focus visible on all interactive elements

---

## 10. Responsive Design

| Breakpoint | Layout |
|------------|--------|
| ≥ 1024px | Pie chart legend on right |
| < 1024px | Pie chart legend on bottom |
| All | Chart.js `responsive: true` — auto-resizes |

---

## 11. Routing

| Path | Page |
|------|------|
| `/` | DashboardPage |
| `/country/:id` | CountryDetailPage |
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
