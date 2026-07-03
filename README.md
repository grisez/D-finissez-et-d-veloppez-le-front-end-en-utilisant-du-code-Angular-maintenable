# TéléSport — Olympic Games Dashboard

Application Angular affichant les résultats des Jeux Olympiques (médailles par pays, évolution par année).

---

## Installation

```bash
git clone <repo-url>
cd olympic-games-starter
npm install
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm start` | Lance le serveur de développement (`http://localhost:4200`) |
| `npm run build` | Build de production dans `dist/` |

---

## Structure du projet

```
src/
├── styles/
│   └── _mixins.scss          # Mixin glassmorphism
├── styles.scss               # Design tokens (CSS custom properties) + Tailwind
└── app/
    ├── models/               # Interfaces TypeScript (Olympic, Participation)
    ├── services/             # OlympicService — source unique de données
    ├── components/
    │   ├── header/           # Composant réutilisable : titre + KPIs
    │   └── error/            # Composant réutilisable : message d'erreur
    └── pages/
        ├── home/             # Dashboard — route /
        ├── country/          # Détail pays — route /country/:id
        └── not-found/        # Page 404 — route **
```

---

## Stack technique

- **Angular 18** — standalone components, control flow (`@if` / `@for`)
- **TypeScript strict** — zéro `any`, interfaces typées
- **RxJS** — `Observable`, `shareReplay(1)`, `| async` pipe, `catchError`
- **Chart.js 4** — pie chart (dashboard) + line chart (détail pays)
- **Tailwind CSS** — via `@apply` dans les fichiers SCSS uniquement
- **SCSS** — design tokens CSS custom properties, glassmorphism

## Design patterns

- **Singleton** : `OlympicService` (`providedIn: 'root'`)
- **Observer** : `Observable` RxJS — composants abonnés via `| async`
- **Smart / Dumb components** : pages (smart) → composants réutilisables via `@Input()`

---

## Pages

### Dashboard `/`
- Pie chart — médailles totales par pays (palette colorblind-safe)
- KPIs : nombre de pays, nombre d'éditions JO
- Clic sur un pays → navigation vers la page détail

### Détail pays `/country/:id`
- Line chart — évolution des médailles par année
- KPIs : participations, médailles totales, athlètes totaux
- ID invalide ou pays introuvable → redirection `/not-found`

---

## Gestion des erreurs

| Cas | Comportement |
|-----|-------------|
| Données vides | Message "No data available" |
| Erreur HTTP | `ErrorComponent` avec message + lien retour |
| ID pays invalide | Redirection `/not-found` |
| URL inconnue | Redirection `/not-found` |

---

## Limites connues

- Les données sont mockées (fichier `assets/mock/olympic.json`) — pas de backend réel
- Pas de tests unitaires
- Pas d'authentification

---

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — architecture détaillée, design system, décisions techniques
- [`notes-architecture.md`](./notes-architecture.md) — analyse du starter code, problèmes identifiés
- [`docs/architecture-diagram.svg`](./docs/architecture-diagram.svg) — diagramme de composants UML
