# Notes d'architecture — Analyse du starter code

## 1. Problèmes identifiés dans le starter code

### Structure
| Problème | Fichier | Ligne |
|----------|---------|-------|
| Aucune séparation pages / composants réutilisables | `src/app/` | — |
| Pas de lazy loading sur les routes | `app-routing.module.ts` | — |
| NgModule au lieu de standalone components | `app.module.ts` | — |

### Typage
| Problème | Fichier |
|----------|---------|
| Utilisation de `any` dans les modèles | `olympic.model.ts` |
| Interfaces incomplètes (pas de `Participation`) | `olympic.model.ts` |
| Absence de `strict: true` en TypeScript | `tsconfig.json` |

### Données
| Problème | Fichier |
|----------|---------|
| Données manipulées directement dans le composant | `home.component.ts` |
| Pas de `shareReplay` — HTTP appelé plusieurs fois | `olympic.service.ts` |
| Pas de gestion d'erreur (`catchError`) | `olympic.service.ts` |
| Subscribe manuel sans unsubscribe (memory leak) | `home.component.ts` |

### UI
| Problème | Fichier |
|----------|---------|
| Pas d'état loading / error / empty | `home.component.html` |
| Utilisation de `*ngIf` / `*ngFor` (ancienne syntaxe) | `home.component.html` |
| Aucun composant réutilisable (header, erreur) | — |

---

## 2. Catégorisation et priorisation

| Priorité | Catégorie | Problème |
|----------|-----------|----------|
| 🔴 Haute | Typage | `any` partout — TypeScript strict non activé |
| 🔴 Haute | Données | Pas de service centralisé, memory leak |
| 🟠 Moyenne | Structure | Pas de standalone, pas de lazy loading |
| 🟠 Moyenne | UI | Pas de gestion des états (loading/error/empty) |
| 🟡 Basse | Syntaxe | `*ngIf`/`*ngFor` → `@if`/`@for` Angular 17 |

---

## 3. Architecture proposée

```
src/
├── styles/
│   └── _mixins.scss          # Mixins SCSS réutilisables
├── styles.scss               # Design tokens globaux
└── app/
    ├── models/
    │   ├── olympic.model.ts       # interface Olympic
    │   └── participation.model.ts # interface Participation
    ├── services/
    │   └── olympic.service.ts     # Source unique de données
    ├── components/
    │   ├── header/                # Composant réutilisable titre + KPIs
    │   └── error/                 # Composant réutilisable message d'erreur
    ├── pages/
    │   ├── home/                  # Route /
    │   ├── country/               # Route /country/:id
    │   └── not-found/             # Route ** / /not-found
    ├── app.component.ts
    ├── app.config.ts              # provideRouter + provideHttpClient
    └── app.routes.ts              # Lazy loading via loadComponent
```

### Design patterns choisis

- **Singleton** : `OlympicService` avec `providedIn: 'root'` — une seule instance partagée
- **Observer** : `Observable` RxJS + `shareReplay(1)` — les composants s'abonnent via `| async`
- **Smart / Dumb components** : pages (smart) transmettent les données aux composants réutilisables (dumb) via `@Input()`

---

## 4. Solutions appliquées

| Problème | Solution |
|----------|----------|
| `any` partout | Interfaces `Olympic` et `Participation` typées, `strict: true` |
| Memory leak | `| async` pipe — unsubscribe automatique |
| HTTP appelé plusieurs fois | `shareReplay(1)` dans le service |
| Pas de gestion d'erreur | `catchError` + `ErrorComponent` réutilisable |
| Pas d'états UI | `@if` loading / error / empty dans chaque page |
| NgModule | Standalone components + `bootstrapApplication` |
| Pas de lazy loading | `loadComponent()` dans `app.routes.ts` |
