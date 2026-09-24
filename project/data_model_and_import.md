# MovLib — Data Model & Import

## Purpose

This document describes the unified PostgreSQL data model behind MovLib, the API that exposes it, and the import story. It is the single source of truth for storage — replacing the old fragmented SQLite (native) / localStorage (web) schemas.

Source of truth: `MovLibBack/migrations/001_init.up.sql` + `002_soft_delete.up.sql`. Migrations are embedded in the Go binary and auto-applied at startup, in filename order, tracked in `schema_migrations`.

## Design conventions

- **TMDB ids are primary keys** — no synthetic serial ids. A movie/show is identified by its TMDB id everywhere.
- **Metadata vs user-owned columns.** Metadata (title, poster_path, dates, vote_average, episode names/overview/air_date/still_path) may be refreshed at any time. User-owned columns (`is_watched`, `watched_at`, `rewatch_count`, `is_favorite`, `added_at`) must never be touched by metadata refreshes — the backend only writes them on explicit user actions. This is enforced structurally: upserts use `ON CONFLICT` clauses that list metadata columns only.
- **BOOLEAN, not 0/1 integers; TIMESTAMPTZ for instants; DATE for calendar dates.** The API serializes DATE as `'YYYY-MM-DD'` and TIMESTAMPTZ as ISO-8601, so existing app comparisons (e.g. `isEpisodeAired`) keep working unchanged.
- **Soft delete.** `is_deleted BOOLEAN NOT NULL DEFAULT FALSE` exists on every domain table for systematic consistency, but is actively used (filtered/written) only on `movies` and `tv_shows`. "Deleting" = `UPDATE is_deleted = TRUE`; all reads filter `is_deleted = FALSE`; upserting a soft-deleted id resurrects the row with all user state intact.

## Schema

### genres

One table for both media types (TMDB movie and TV genre ids share the same numeric space). Seeded from TMDB's official genre lists (28 movie + 19 TV genres, unioned) — the app no longer seeds anything.

```text
id   INTEGER PRIMARY KEY   -- TMDB genre id
name TEXT NOT NULL
```

### movies

Previously `MovieWL` (SQLite) / `movies_watchlist` (localStorage).

```text
id            BIGINT PRIMARY KEY   -- TMDB movie id
title         TEXT NOT NULL
poster_path   TEXT
release_date  DATE
vote_average  REAL

-- user-owned state
is_watched    BOOLEAN NOT NULL DEFAULT FALSE
watched_at    TIMESTAMPTZ          -- when it was (last) marked watched
rewatch_count INTEGER NOT NULL DEFAULT 0
is_favorite   BOOLEAN NOT NULL DEFAULT FALSE

added_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
is_deleted    BOOLEAN NOT NULL DEFAULT FALSE   -- 002, active
```

### tv_shows

Previously `TvWL`. **Show-level `isWatched` is intentionally dropped** — TV progress is episode-derived only (project rule).

```text
id             BIGINT PRIMARY KEY   -- TMDB tv id
name           TEXT NOT NULL
poster_path    TEXT
first_air_date DATE
vote_average   REAL

-- user-owned state
is_favorite    BOOLEAN NOT NULL DEFAULT FALSE

added_at       TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
is_deleted     BOOLEAN NOT NULL DEFAULT FALSE   -- 002, active
```

### movie_genres / tv_genres

Replaces the old four-table genre setup (`MovieGenre` + `GenresMovie`, `TvGenre` + `GenresTv`). A metadata refresh may delete + re-insert these rows freely — they carry no user state.

```text
movie_genres: (movie_id BIGINT → movies.id ON DELETE CASCADE,
               genre_id INTEGER → genres.id ON DELETE CASCADE,
               PRIMARY KEY (movie_id, genre_id))
tv_genres:    (tv_id    BIGINT → tv_shows.id ON DELETE CASCADE,
               genre_id INTEGER → genres.id ON DELETE CASCADE,
               PRIMARY KEY (tv_id, genre_id))
```

### tv_episodes

Previously `TvEpisodes` (SQLite) / `tv_episodes` (localStorage). Composite PK replaces the old auto-increment rowid — nothing in the app referenced that local id (clients use `tmdb_episode_id`).

```text
tv_id           BIGINT NOT NULL → tv_shows.id ON DELETE CASCADE
season_number   INTEGER NOT NULL
episode_number  INTEGER NOT NULL
tmdb_episode_id BIGINT            -- TMDB's own episode id (the 'id' the app renders)
name            TEXT NOT NULL
overview        TEXT
air_date        DATE              -- 'YYYY-MM-DD' or NULL (never aired / unknown)
still_path      TEXT

-- user-owned state
is_watched      BOOLEAN NOT NULL DEFAULT FALSE
watched_at      TIMESTAMPTZ
rewatch_count   INTEGER NOT NULL DEFAULT 0

updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
is_deleted      BOOLEAN NOT NULL DEFAULT FALSE   -- 002, present but never queried

PRIMARY KEY (tv_id, season_number, episode_number)
```

The composite PK covers the queries the app runs: `WHERE tv_id = ?` (show progress / all episodes) and `WHERE tv_id = ? AND season_number = ?` (season list / season progress).

## State semantics

- **`rewatch_count`** increments when an item is marked watched while currently unwatched; unwatching never decrements. Each fresh watch session counts once.
- **`watched_at`** is stamped `now()` on watch, `NULL` on unwatch (unwatch = mistake correction, not a new state).
- **Mark Season Watched** (`watched = true`) touches aired episodes only — enforced in SQL (`air_date IS NOT NULL AND air_date <= CURRENT_DATE`). Un-marking is unrestricted so mistakes can be undone. A season with no stored aired episodes returns 404 (the client must fetch the season first).
- **Single-episode toggle** trusts the client (the app checks `isEpisodeAired` before allowing it).

## API surface

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

Conventions: TMDB ids in the URL path; bodies carry metadata or an explicit state change; errors are `{"error": "..."}` (400 bad input / 404 not found / 500 internal, logged); mutations return 204 No Content; empty arrays serialize as `[]`, never `null`.

Response shapes (JSON, camelCase to match the app):

- **Movie**: `id, title, poster_path, release_date, vote_average, isWatched, watched_at, rewatch_count, is_favorite, genre_ids, genre_names`
- **TvShow**: `id, name, poster_path, first_air_date, vote_average, is_favorite, genre_ids, genre_names`
- **Episode**: `tv_id, season_number, episode_number, id (TMDB), name, overview, air_date, still_path, isWatched, watched_at, rewatch_count`
- **SeasonProgress / TvProgress**: `seasonNumber, totalEpisodes, watchedEpisodes, percentage` / `totalEpisodes, watchedEpisodes, percentage`

## Import

**Status: dropped (2026-09).** The old development server held no data, so no export/import path was built)Skip. The schema is ready for it: TV Time JSON (and later CSV) import can be added as a backend endpoint that maps external records onto `movies` / `tv_shows` / `tv_episodes` using TMDB ids, respecting the metadata-only upsert rule (imported watched state would be written via the explicit state paths, never via upsert).
