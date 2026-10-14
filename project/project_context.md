# MovLib — AI Agent Project Context

## Project overview

MovLib is a React Native + Expo Router personal media tracking application for movies, TV shows, anime, and similar content. It started as a personal alternative to TV Time.

The app is a **thin client**: it talks only to its own backend (`MovLibBack`, Go + PostgreSQL, deployed via Docker Compose). The backend provides both the unified storage layer and a TMDB proxy — the app never calls `api.themoviedb.org` directly and never holds a TMDB keyikuha.

User-owned data (watchlist membership, watched status, episode progress, watch timestamps, favorites, rewatch count, future notes/ratings) lives in PostgreSQL, one source of truth for every platform — replacing the old fragmented SQLite (native) / localStorage (web) storage.

## Main goals

- Discover movies and TV shows
- Search and filter TMDB content
- Open movie and TV detail pages
- Add/remove movies and shows from the watchlist (backend)
- Track movie watched status
- Track TV shows by season and episode
- Mark aired episodes as watched/unwatched
- Show season and overall TV progress
- Work on native and web platforms against one unified backend
- ~~Import TV Time JSON data~~ — dropped: no data in the old dev server (2026-09). TV Time JSON / CSV import can be added later against the same schema.

## Architecture

```text
Expo app (MovLib/)  ──HTTP──▶  Go backend (MovLibBack/)  ──▶  PostgreSQL
                                  │
                                  └──TMDB proxy──▶  api.themoviedb.org
```

- The app calls the backend for **everything**: storage CRUD, progress, and catalog data (`/tmdb/*`).
- The backend injects the TMDB API key server-side; the app never sees it.
- Poster/still images still load directly from `image.tmdb.org` (only the TMDB *API* is proxied).

## Technology

Frontend:

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- NativeWind / Tailwind
- lucide-react-native
- ~~expo-sqlite (native) / localStorage (web)~~ — being replaced by the backend API client

Backend:

- Go 1.26 (module `movlib-back`, plain module name — no `github.com/...` path)
- PostgreSQL 17 (pgx/v5 driver)
- Docker Compose (db + api services, named volume, healthcheck-gated startup)
- Migrations embedded in the binary (`go:embed`), auto-applied at startup

Known frontend versions:

```text
expo 54.0.36
expo-router 6.0.24
babel-preset-expo 54.0.12
```

## Project tree

```text
MovLib/                        ← Expo app
app/
├── _layout.tsx
├── globals.css
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── search.tsx
│   ├── library.tsx
│   └── profile.tsx
├── movies/
│   └── [id].tsx
└── tv/
    └── [id].tsx

components/
├── CategoryClickable.tsx
├── ContentCard.tsx
├── FilterModal.tsx
├── GridList.tsx
├── SearchBox.tsx
├── SideScrollList.tsx
├── VideoPlayer.tsx
├── Page/
│   └── DetailsPage.tsx
├── Episodes/
│   ├── EpisodeRow.tsx
│   └── SeasonEpisodeList.tsx
└── ui/
    ├── Divider.tsx
    ├── ExpandableView.tsx
    └── SegmentedButton.tsx

constants/Genre.ts
context/GlobalContext.tsx

db/                            ← legacy platform storage (being removed)
├── database.ts
├── database.native.ts
└── database.web.ts

helpers/                       ← legacy platform helpers (being replaced by API client)
├── GeneralHelpers.ts
├── databaseHelper.ts
├── databaseHelper.native.ts
└── databaseHelper.web.ts

hooks/
├── useChoseFetch.ts
└── useFetch.ts

interface/interfaces.d.ts
services/api.ts                ← TMDB client (will point at backend /tmdb/*)
utils/
├── episodeHelpers.ts
└── queryBuilder.ts
```

```text
MovLibBack/                    ← Go backend
├── Dockerfile                 (multi-stage: static binary, alpine runtime, non-root)
├── docker-compose.yml         (db + api, healthcheck-gated, named volume)
├── .env.example               (POSTGRES_PASSWORD, TMDB_API_KEY)
├── .dockerignore
├── go.mod                     (module movlib-back, pgx/v5)
├── cmd/server/main.go         (config → connect → migrate → serve)
├── internal/
│   ├── config/config.go       (DATABASE_URL, HTTP_ADDR, TMDB_API_KEY)
│   ├── migrate/migrate.go     (applies embedded migrations in order)
│   ├── store/
│   │   ├── store.go           (pgxpool setup)
│   │   ├── movies.go
│   │   ├── tv_shows.go
│   │   └── tv_episodes.go
│   ├── httpapi/
│   │   ├── httpapi.go         (router + shared helpers)
│   │   ├── movies.go
│   │   ├── tvshows.go
│   │   ├── episodes.go
│   │   └── tmdbproxy.go       (GET /tmdb/{path...} allowlisted proxy)
│   └── tmdb/client.go         (minimal TMDB v3 client, key injected server-side)
└── migrations/
    ├── 001_init.up.sql        (schema + genre seed)
    ├── 002_soft_delete.up.sql (is_deleted on all tables)
    └── embed.go
```

## Routes

```text
app/(tabs)/index.tsx     → Home
app/(tabs)/search.tsx    → Search
app/(tabs)/library.tsx   → Library
app/(tabs)/profile.tsx   → Profile
app/movies/[id].tsx      → Movie details
app/tv/[id].tsx          → TV details
```

`app/(tabs)/_layout.tsx` owns the bottom tab navigation. The screen content is implemented in the corresponding route files.

## Backend

### Run

```powershell
# one command starts everything (db + api); migrations auto-apply
docker compose up -d --build

# local dev without Docker (needs a Postgres on :5432)
go run ./cmd/server
```

Environment (via `.env` next to `docker-compose.yml`):

```env
POSTGRES_PASSWORD=movlib
TMDB_API_KEY=your_key_here        # blank disables /tmdb/* (503)
```

### API surface

```text
GET    /healthz

GET    /tmdb/{path...}                    TMDB proxy (key injected server-side)

PUT    /movies/{id}                       upsert metadata (never user state)
GET    /movies                            list; ?watched=true&favorite=true
GET    /movies/{id}
PATCH  /movies/{id}/watched               body {"watched": bool}
PATCH  /movies/{id}/favorite              body {"favorite": bool}
DELETE /movies/{id}                       soft delete

PUT    /tv/{id}                           upsert metadata
GET    /tv                                list; ?favorite=true
GET    /tv/{id}
PATCH  /tv/{id}/favorite                  body {"favorite": bool}
DELETE /tv/{id}                           soft delete

PUT    /tv/{id}/season/{s}/episodes       batch upsert metadata (TMDB season shape)
GET    /tv/{id}/season/{s}/episodes       list season episodes
PATCH  /tv/{id}/season/{s}/episodes/{e}/watched   body {"watched": bool}
PATCH  /tv/{id}/season/{s}/watched        body {"watched": bool} (aired-only when true)
GET    /tv/{id}/season/{s}/progress
GET    /tv/{id}/progress
```

Conventions: TMDB ids in the URL path; bodies carry metadata or an explicit state change; errors are `{"error": "..."}` (400/404/500); mutations return 204. Full schema and design rules: see `data_model_and_import.md`.

## Platform storage

**Replaced by the backend.** All storage is PostgreSQL behind the Go API. The old `db/` (SQLite native / localStorage web) and `helpers/databaseHelper.*` layers are being removed; the app will call the backend endpoints above instead.

Until the cutover is complete, the legacy note still applies: Expo/Metro may resolve `@/helpers/databaseHelper` to the platform-specific file, so all exported episode functions must exist in the helper file actually selected by the platform — otherwise runtime errors such as `upsertTvEpisodes is not a function` can occur.

## Global context

`context/GlobalContext.tsx` stores:

```ts
mediaObject: MediaItem | undefined
filters: DiscoverMovieFilters | undefined
```

A card usually passes a summary object to the detail route. A summary TV object may not contain seasons. The detail API result must be preferred for TV details:

```tsx
<DetailsPage
  mediaObject={data || mediaObject}
  detailData={data}
  contentType="tv"
  ...
/>
```

Do not skip the TV detail request merely because `mediaObject` already exists. The card object may only be a summary.

## TMDB API

The app no longer calls TMDB directly. It calls the backend proxy:

```text
GET {BACKEND}/tmdb/{path}?{query}
```

which forwards verbatim to `https://api.themoviedb.org/3/{path}?{query}` with the server-side key injected. Responses are identical in shape to TMDB's, so the frontend cutover is a base-URL swap, not a parser rewrite.

Allowlisted top-level paths: `search`, `movie`, `tv`, `genre`, `configuration`, `discover`, `trending`.

Endpoints the app uses (now via the proxy):

```text
/discover/movie
/search/movie
/movie/{movie_id}?language=en-US
/discover/tv
/search/tv
/tv/{tv_id}?language=en-US
/{movie|tv}/{id}/similar?language=en-US&page=1
/company/{company_id}
/tv/{tv_id}/season/{season_number}?language=en-US
```

The season endpoint is called by `fetchTvSeasonEpisodes`. It requires a TMDB TV ID, not a TVDB or IMDb ID.

Episode fields used by the app:

```ts
id
episode_number
season_number
name
overview
air_date
still_path
vote_average
vote_count
```

## Type rules

Important types live in `interface/interfaces.d.ts`:

```text
BaseContent
Movie
Tv
TvSeason
TvEpisode
WatchedTvEpisode
MediaItem
UnitedWithDb
Company
```

Do not model details with `Movie & Tv`; that requires movie and TV-only fields at the same time and causes TypeScript errors. `MediaItem` should be a flexible detail type with optional movie/TV-specific fields.

## TV tracking rules

Movies may have a single watched state:

```text
movie → watched / not watched
```

TV shows must not have a single show-level Watched button. TV tracking is episode based:

```text
show
 └── seasons
      └── episodes
           ├── isWatched
           ├── watched_at
           └── rewatch_count
```

Movie cards/details may show Watched. TV cards/details should show watchlist membership and season/episode progress only.

## Episode components

`components/Episodes/EpisodeRow.tsx` renders one episode:

- still preview image
- watched check
- episode title
- air date
- Not Released label
- disabled interaction for unaired episodes

Preview URL:

```ts
https://lh7-rt.googleusercontent.com/docsz/AD_4nXd6nN12O9luHVxR0J-HLEft4MjsWcFsOyY52f9qprx2Pj0Xp-HZPC8X3bdVWpA-bfO-vg8d97oVgU661UKUkEetyaWafgXFBGT5X4PYgO9hGHBIT3lLY2dGwd0IltmRjvOit9uA3w?key=krxKnBk4WoUAG4IBGluaVA
```

`components/Episodes/SeasonEpisodeList.tsx` renders season accordion rows and delegates individual rows to `EpisodeRow`.

A collapsed season should still show:

```text
✓ Season 1
8/8 aired watched
Completed
progress bar
```

The season circle is clickable. It must load the season episodes first if they are not loaded, then mark only aired episodes.

## Aired episode rules

TMDB generally provides `air_date`, not a reliable boolean `is_aired` field. Use `utils/episodeHelpers.ts`:

```ts
export const isEpisodeAired = (airDate: string | null): boolean => {
  if (!airDate) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(`${airDate}T00:00:00`) <= today;
};
```

Unaired episodes:

- cannot be toggled
- show `Not Released`
- are skipped by Mark Season Watched
- should not reduce aired progress

The backend enforces the same rule structurally: `PATCH /tv/{id}/season/{s}/watched` with `watched: true` only touches episodes with `air_date <= CURRENT_DATE`.

## Responsive tab navigation

`app/(tabs)/_layout.tsx` owns the bottom bar. Use equal-width flex items:

```tsx
tabBarItemStyle: {
  flex: 1,
  height: "100%",
  margin: 0,
  padding: 0,
}
```

To make the selected tab fill its entire slot, use:

```tsx
tabBarIconStyle: {
  width: "100%",
  height: "100%",
  margin: 0,
  padding: 0,
}
```

Avoid `width: "100%"` on every item, `margin: 10`, and fixed active widths such as `w-28`.

## Theme

Current neon-blue palette:

```js
colors: {
  primary: "#00BFFF",
  secondary: "#16324F",
  accent: "#E6F7FF",
  dark: {
    100: "#102A43",
    200: "#050B14",
  },
}
```

Also check `components/colors.tsx`, because the tab bar reads colors from that file rather than directly from Tailwind.

## AI agent rules

1. Read the target file before editing it.
2. Check `.native.ts` and `.web.ts` resolution.
3. Keep native and web helper exports consistent.
4. Never overwrite user-owned watched fields during metadata refresh.
5. Do not add show-level watched logic for TV.
6. Distinguish TMDB, TVDB, and IMDb IDs.
7. Do not mark future episodes watched.
8. Use one shared `ensureSeasonEpisodes` flow instead of duplicating season fetch logic.
9. Remove unused imports and state after refactoring.
10. Test TypeScript before Expo bundling.
11. The app reaches TMDB only through the backend proxy; never reintroduce a direct TMDB call or an app-side API key.
12. Backend upserts are metadata-only; user-owned columns are written only by explicit state endpoints.

## Test commands

```powershell
npx tsc --noEmit
npx expo start -c
go build ./...
go vet ./...
```

Test flow:

1. Open a TV detail route.
2. Confirm `/tv/{id}` is requested.
3. Open a season and confirm `/tv/{id}/season/{season}` is requested.
4. Toggle an aired episode.
5. Confirm an unaired episode cannot be toggled.
6. Press the collapsed season circle.
7. Confirm the season fetches and marks aired episodes.
8. Reload and confirm state persists (now via the backend).
