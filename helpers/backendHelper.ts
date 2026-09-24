// helpers/backendHelper.ts
//
// Drop-in backend replacement for the old databaseHelper.
//
// Exports every function that databaseHelper exported, with identical
// signatures, so no screen files need to change. The three
// databaseHelper.ts / .native.ts / .web.ts variants are replaced by thin
// re-exports of this file (see those files).
//
// What changed vs. the old implementation:
//  - SQLite (native) and localStorage (web) are gone. Every call is a plain
//    fetch to the Go backend.
//  - The file is platform-agnostic — no Platform.OS branches, no expo-sqlite.
//  - toggleTvWatched is a no-op: TV shows have no show-level watched state
//    (project rule). The signature is kept so call sites compile unchanged.
//  - getTvShowsWithGenres ignores the onlyWatched parameter for the same
//    reason — the backend has no is_watched column on tv_shows.
//  - upsertTvEpisodes groups episodes by season_number and fires one PUT per
//    season (rare that a caller mixes seasons, but safe).

import { API_URL } from "@/services/api";
import {
  Movie,
  SeasonProgress,
  Tv,
  TvEpisode,
  WatchedTvEpisode,
} from "@/interface/interfaces";

// ---------------------------------------------------------------------------
// Shared fetch helpers
// ---------------------------------------------------------------------------

async function apiFetch(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  // 204 No Content is success; anything else non-2xx is an error.
  if (!res.ok && res.status !== 204) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(
      `Backend ${options?.method ?? "GET"} ${path} → ${res.status}: ${body}`,
    );
  }
  return res;
}

async function apiJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(path, options);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Movie helpers
// ---------------------------------------------------------------------------

export const insertMovieWithGenres = async (
  movie: Movie,
  isWatched: boolean = false,
): Promise<void> => {
  // Step 1: upsert metadata (never touches user state).
  await apiFetch(`/movies/${movie.id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: movie.title,
      poster_path: movie.poster_path ?? null,
      release_date: movie.release_date ?? null,
      vote_average: movie.vote_average ?? 0,
      genre_ids: movie.genre_ids ?? [],
    }),
  });
  // Step 2: set watched state only when explicitly requested.
  if (isWatched) {
    await apiFetch(`/movies/${movie.id}/watched`, {
      method: "PATCH",
      body: JSON.stringify({ watched: true }),
    });
  }
};

export const insertTvWithGenres = async (
  tv: Tv,
  // TV shows have no show-level watched state — the parameter is accepted so
  // call sites compile unchanged, but it is intentionally ignored.
  _isWatched: boolean = false,
): Promise<void> => {
  await apiFetch(`/tv/${tv.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: tv.name,
      poster_path: tv.poster_path ?? null,
      first_air_date: tv.first_air_date ?? null,
      vote_average: tv.vote_average ?? 0,
      genre_ids: tv.genre_ids ?? [],
    }),
  });
};

export const getAllMoviesWithGenres = async (
  onlyWatched: boolean = false,
): Promise<any[]> => {
  const qs = onlyWatched ? "?watched=true" : "";
  return apiJSON<any[]>(`/movies${qs}`);
};

// Alias kept for callers that used getMoviesWithGenres (same backend call).
export const getMoviesWithGenres = (
  onlyWatched: boolean = false,
): Promise<any[]> => getAllMoviesWithGenres(onlyWatched);

export const getTvShowsWithGenres = async (
  // TV has no show-level is_watched column; onlyWatched is ignored and all
  // shows are returned. Call sites that depended on this filter need no
  // changes — they just receive the full list.
  _onlyWatched: boolean = false,
): Promise<any[]> => apiJSON<any[]>("/tv");

export const toggleMovieWatched = async (
  id: number,
  watched: boolean,
): Promise<void> => {
  await apiFetch(`/movies/${id}/watched`, {
    method: "PATCH",
    body: JSON.stringify({ watched }),
  });
};

// No-op — TV shows have no show-level watched state per project rules.
// The signature is preserved so existing call sites compile unchanged.
export const toggleTvWatched = async (
  _id: number,
  _watched: boolean,
): Promise<void> => {
  console.warn(
    "[backendHelper] toggleTvWatched: TV has no show-level watched state — call ignored.",
  );
};

export const deleteMovie = async (id: number): Promise<void> => {
  await apiFetch(`/movies/${id}`, { method: "DELETE" });
};

export const deleteTvShow = async (id: number): Promise<void> => {
  await apiFetch(`/tv/${id}`, { method: "DELETE" });
};

export const getMovieById = async (id: number): Promise<any | null> => {
  try {
    return await apiJSON<any>(`/movies/${id}`);
  } catch (e: any) {
    if (String(e?.message).includes("404")) return null;
    throw e;
  }
};

export const getTvShowById = async (id: number): Promise<any | null> => {
  try {
    return await apiJSON<any>(`/tv/${id}`);
  } catch (e: any) {
    if (String(e?.message).includes("404")) return null;
    throw e;
  }
};

// ---------------------------------------------------------------------------
// Episode helpers
// ---------------------------------------------------------------------------

export const upsertTvEpisodes = async (
  tvId: number,
  episodes: TvEpisode[],
): Promise<void> => {
  if (episodes.length === 0) return;

  // Group by season_number. In practice every call comes from a single season
  // fetch so there is one group, but grouping keeps the code correct regardless.
  const bySeason = new Map<number, TvEpisode[]>();
  for (const ep of episodes) {
    const s = ep.season_number;
    if (!bySeason.has(s)) bySeason.set(s, []);
    bySeason.get(s)!.push(ep);
  }

  await Promise.all(
    [...bySeason.entries()].map(([seasonNum, eps]) =>
      apiFetch(`/tv/${tvId}/season/${seasonNum}/episodes`, {
        method: "PUT",
        body: JSON.stringify(
          eps.map((ep) => ({
            id: ep.id ?? null, // TMDB episode id
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview ?? null,
            air_date: ep.air_date ?? null,
            still_path: ep.still_path ?? null,
          })),
        ),
      }),
    ),
  );
};

// Shape returned by GET /tv/{id}/season/{s}/episodes (matches store.Episode).
interface BackendEpisode {
  tv_id: number;
  season_number: number;
  episode_number: number;
  id: number | null; // TMDB episode id; null if never stored
  name: string;
  overview: string | null;
  air_date: string | null;
  still_path: string | null;
  isWatched: boolean;
  watched_at: string | null;
  rewatch_count: number;
}

function toWatchedTvEpisode(ep: BackendEpisode): WatchedTvEpisode {
  // Fall back to episode_number when tmdb_episode_id was never stored,
  // matching the old localStorage/SQLite behaviour.
  const tmdbId = ep.id ?? ep.episode_number;
  return {
    // TvEpisode base fields
    id: tmdbId,
    name: ep.name,
    overview: ep.overview ?? "",
    air_date: ep.air_date,
    episode_number: ep.episode_number,
    episode_type: "standard", // not stored by backend; default matches old code
    runtime: null, // not stored by backend
    season_number: ep.season_number,
    show_id: ep.tv_id,
    still_path: ep.still_path,
    vote_average: 0, // not stored by backend
    vote_count: 0, // not stored by backend
    // WatchedTvEpisode extensions
    tv_id: ep.tv_id,
    tmdb_episode_id: tmdbId,
    isWatched: ep.isWatched,
    watched_at: ep.watched_at,
    rewatch_count: ep.rewatch_count,
  };
}

export const getEpisodesBySeason = async (
  tvId: number,
  seasonNumber: number,
): Promise<WatchedTvEpisode[]> => {
  const eps = await apiJSON<BackendEpisode[]>(
    `/tv/${tvId}/season/${seasonNumber}/episodes`,
  );
  return eps.map(toWatchedTvEpisode);
};

export const toggleEpisodeWatched = async ({
  tvId,
  seasonNumber,
  episodeNumber,
  watched,
}: {
  tvId: number;
  seasonNumber: number;
  episodeNumber: number;
  watched: boolean;
}): Promise<void> => {
  await apiFetch(
    `/tv/${tvId}/season/${seasonNumber}/episodes/${episodeNumber}/watched`,
    {
      method: "PATCH",
      body: JSON.stringify({ watched }),
    },
  );
};

export const markSeasonWatched = async ({
  tvId,
  seasonNumber,
  watched,
}: {
  tvId: number;
  seasonNumber: number;
  watched: boolean;
}): Promise<void> => {
  await apiFetch(`/tv/${tvId}/season/${seasonNumber}/watched`, {
    method: "PATCH",
    body: JSON.stringify({ watched }),
  });
};

export const getTvProgress = async (
  tvId: number,
): Promise<{
  totalEpisodes: number;
  watchedEpisodes: number;
  percentage: number;
}> => apiJSON(`/tv/${tvId}/progress`);

export const getSeasonProgress = async (
  tvId: number,
  seasonNumber: number,
): Promise<SeasonProgress> =>
  apiJSON(`/tv/${tvId}/season/${seasonNumber}/progress`);
