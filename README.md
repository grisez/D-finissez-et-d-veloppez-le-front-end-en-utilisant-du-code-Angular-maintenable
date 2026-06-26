# TéléSport — Olympic Games

An Angular application for TéléSport, a French national TV channel, displaying Olympic Games performance data by country.

## Prerequisites

- Node.js >= 18
- npm >= 9
- Angular CLI 18

```bash
npm install
```

## Development server

```bash
ng serve
```

Navigate to `http://localhost:4200/`.

## Build

```bash
ng build
```

Build artifacts are stored in `dist/`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — pie chart of medals by country + KPIs |
| `/country/:id` | Country detail — line chart + participations, medals, athletes |
| `/not-found` | 404 page |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical architecture.

## Tech Stack

- Angular 18 — standalone components, lazy loading
- TypeScript 5.4 — strict mode, zero `any`
- RxJS 7.8
- Chart.js 4
- SCSS

## Git Strategy

Gitflow — `main` / `develop` / `feat*` / `refactor*` / `fix*` / `docs*`

See [ARCHITECTURE.md](./ARCHITECTURE.md#git-strategy) for details.
