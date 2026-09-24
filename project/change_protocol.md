# MovLib — AI Change Protocol

## Before editing code

1. Read the current target file.
2. Check whether Expo resolves `.native.ts`, `.web.ts`, or plain `.ts`.
3. Inspect the existing public helper exports.
4. Compare API response types with database types.
5. Preserve user-owned fields during metadata refresh.
6. For backend changes: read the relevant `internal/store` and `internal/httpapi` file first. The rules below are enforced in SQL, not by caller discipline — keep them that way.

## Rules

- Do not use `Movie & Tv` as the general detail type.
- Keep movie watched state separate from TV episode tracking.
- Do not add a show-level Watched button for TV shows.
- Always distinguish TMDB, TVDB, and IMDb IDs.
- Use `air_date` to determine whether an episode has aired.
- Future or unknown-date episodes must not be marked watched.
- Use one `ensureSeasonEpisodes` function for both season expansion and collapsed-season actions.
- Do not duplicate episode functions across files without matching exports.
- Keep web and native helper APIs identical.
- Remove unused imports, state variables, and abandoned handlers.
- Do not overwrite `isWatched`, `watched_at`, or `rewatch_count` during TMDB upserts.
- Keep responsive layouts based on flex sizing rather than fixed widths.

## Backend rules (Go / PostgreSQL)

- The app reaches TMDB **only** through the backend (`GET /tmdb/{path...}`). The TMDB API key lives in the backend environment (`TMDB_API_KEY`), never in the app.
- Upserts are metadata-only: `ON CONFLICT` clauses may update title/poster/dates/rating/episode metadata, never `is_watched`, `watched_at`, `rewatch_count`, `is_favorite`, or `added_at`.
- Deletion is soft: `is_deleted = TRUE` on `movies` / `tv_shows`. All reads filter `is_deleted = FALSE`. Upserting a soft-deleted id resurrects the row.
- `is_deleted` exists on every domain table for symmetry, but is only ever queried on `movies` and `tv_shows`.
- Mark Season Watched (`watched = true`) touches aired episodes only — enforced in SQL (`air_date IS NOT NULL AND air_date <= CURRENT_DATE`). Un-marking is unrestricted.
- `rewatch_count` increments when an item is marked watched while currently unwatched; unwatching never decrements.
- `watched_at` is stamped `now()` on watch, `NULL` on unwatch.
- TMDB ids are primary keys everywhere — no synthetic serial ids.
- BOOLEAN, not 0/1 integers; TIMESTAMPTZ for instants; DATE for calendar dates.

## Testing

TypeScript check:

```powershell
npx tsc --noEmit
```

Start with a clean Metro cache:

```powershell
npx expo start -c
```

Backend check:

```powershell
go build ./...
go vet ./...
```

Backend smoke test (stack running via `docker compose up -d --build`):

```powershell
curl.exe http://localhost:8080/healthz
curl.exe http://localhost:8080/tmdb/search/movie?query=fight+club
```

## TV episode test checklist

- TV detail request is made even when a summary `mediaObject` already exists.
- `detailData.seasons` is used for season rendering.
- Opening a season calls `/tv/{id}/season/{season}`.
- Season data is stored locally.
- Previously watched episodes remain watched after upsert.
- The collapsed season indicator reads local progress.
- Pressing the collapsed season circle fetches episodes if needed.
- Mark Season Watched affects aired episodes only.
- Future episodes show `Not Released` and are disabled.
- Episode still images are rendered when `still_path` exists.
- Episodes are read/written through the backend API (`GET`/`PUT /tv/{id}/season/{s}/episodes`), not platform storage.

## UI test checklist

- Movie cards may show Watched.
- TV cards must not show a show-level Watched button.
- Movie details may show Watched.
- TV details show watchlist and episode progress instead.
- Selected tab fills its tab slot.
- Tab items use equal flex widths.
- No fixed `width: "100%"` on every tab item.
- No excessive tab item margins.
