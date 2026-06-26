# Architecture — TéléSport Olympic Games

## 1. Tech Stack

- Angular 18 (standalone components)
- TypeScript strict (no `any`)
- RxJS (Observables + `async` pipe)
- Chart.js (pie + line charts)
- SCSS
- Angular Router
- HttpClient (local JSON file)

---

## 2. Project Structure

```
src/app/
├── models/
│   ├── olympic.model.ts          # Olympic interface
│   └── participation.model.ts    # Participation interface
│
├── services/
│   └── olympic.service.ts        # Single source of truth
│
├── components/
│   └── header/                   # Reusable header component
│
├── pages/
│   ├── dashboard/                # Route /
│   ├── country-detail/           # Route /country/:id
│   └── not-found/                # Route **
│
├── app.component.ts              # Root component (router-outlet only)
├── app.config.ts                 # provideRouter + provideHttpClient
└── app.routes.ts                 # Lazy-loaded routes
```

---

## 3. Architecture Decisions

### Standalone components
All components use `standalone: true`. No NgModule. Bootstrap via `bootstrapApplication`.

### Data flow
```
olympic.json (local)
      │
      ▼
OlympicService (single source of truth)
      │
      ▼
RxJS Observable
      │
      ▼
async pipe (templates)
      │
      ▼
UI components
```

- No manual `subscribe` in components
- Unidirectional data flow
- No data duplication between pages

### Strict TypeScript
`strict: true` — zero `any` — all data typed via `Olympic` and `Participation` interfaces.

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
- Used on Dashboard and Country detail pages

### DashboardPage `/`
- Pie chart — medals per country
- KPIs: number of countries, number of Olympic editions
- Click on chart slice → navigate to `/country/:id`

### CountryDetailPage `/country/:id`
- KPIs: participations, total medals, total athletes
- Line chart — medals per year
- Invalid ID → redirect to `/not-found`
- Back button → `/`

---

## 6. Business Rules

- Total medals = sum of `medalsCount` across all participations
- Total athletes = sum of `athleteCount` across all participations
- Number of JO editions = distinct years across all countries

---

## 7. UI States

Every page handles three states:

| State | Display |
|-------|---------|
| Loading | Spinner / skeleton |
| Empty | "No data available" message |
| Error | Error message + fallback |

---

## 8. Responsive Design

| Breakpoint | Columns |
|------------|---------|
| ≥ 1200px | 12 columns |
| 768–1199px | 8 columns |
| ≤ 767px | 4 columns (stacked) |

---

## 9. Accessibility

- `aria-label` on interactive elements
- Visible focus indicators
- Minimum AA color contrast
- Text alternatives for charts

---

## 10. Routing

| Path | Page | Description |
|------|------|-------------|
| `/` | DashboardPage | Pie chart + global KPIs |
| `/country/:id` | CountryDetailPage | Line chart + country KPIs |
| `/not-found` | NotFoundPage | Explicit 404 |
| `**` | NotFoundPage | Wildcard fallback |

---

## 11. Git Strategy

Gitflow:
- `main` — production, never committed to directly
- `develop` — integration branch, base for all feature branches
- `feat/*` — new features
- `refactor/*` — refactoring
- `fix/*` — bug fixes
- `docs/*` — documentation only

Atomic commits only. Convention: `feat:` / `fix:` / `refactor:` / `docs:` / `chore:`

---

## 12. Out of Scope

- No authentication
- No backend / database
- No unit tests (not required)

---

## 13. Roadmap

| Step | Branch | Status |
|------|--------|--------|
| Standalone migration | `refactor/standalone-migration` | ✅ Done |
| TypeScript models | `feat/add-typescript-models-and-strict-typing` | ✅ Done |
| Documentation | `docs/architecture-and-readme` | 🔄 In progress |
| OlympicService | `feat/olympic-service` | ⏳ Pending |
| Dashboard page | `feat/dashboard-page` | ⏳ Pending |
| Country detail page | `feat/country-detail-page` | ⏳ Pending |
| Header component | `feat/header-component` | ⏳ Pending |
| Loading / error states | `feat/loading-error-states` | ⏳ Pending |
| Responsive + a11y | `feat/responsive-and-a11y` | ⏳ Pending |
