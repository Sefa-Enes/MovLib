// helpers/libraryFilter.ts
import { VOTE_MAX, VOTE_MIN, YEAR_MAX, YEAR_MIN } from "@/constants/Genre";
import {
  LibraryItem,
  LibrarySortKey,
  SortDirection,
  isFullyWatched,
  sortLibrary,
  yearOf,
} from "@/helpers/librarySort";

export interface LibraryFilters {
  sortKey?: LibrarySortKey; // undefined = server order
  sortDir: SortDirection;
  watched: "all" | "watched" | "unwatched";
  favoritesOnly: boolean;
  voteGte: number;
  voteLte: number;
  yearGte: number;
  yearLte: number;
  include: number[]; // item must have ALL of these genres
  exclude: number[]; // item must have NONE of these genres
}

export const defaultLibraryFilters = (): LibraryFilters => ({
  sortKey: undefined,
  sortDir: "desc",
  watched: "all",
  favoritesOnly: false,
  voteGte: VOTE_MIN,
  voteLte: VOTE_MAX,
  yearGte: YEAR_MIN,
  yearLte: YEAR_MAX,
  include: [],
  exclude: [],
});

export const hasActiveLibraryFilters = (f: LibraryFilters): boolean =>
  f.sortKey !== undefined ||
  f.watched !== "all" ||
  f.favoritesOnly ||
  f.voteGte > VOTE_MIN ||
  f.voteLte < VOTE_MAX ||
  f.yearGte > YEAR_MIN ||
  f.yearLte < YEAR_MAX ||
  f.include.length > 0 ||
  f.exclude.length > 0;

export function applyLibraryFilters<T extends LibraryItem>(
  items: T[],
  f: LibraryFilters,
): T[] {
  const yearActive = f.yearGte > YEAR_MIN || f.yearLte < YEAR_MAX;
  const voteActive = f.voteGte > VOTE_MIN || f.voteLte < VOTE_MAX;

  const out = items.filter((i) => {
    if (f.favoritesOnly && !i.is_favorite) return false;

    if (f.watched !== "all") {
      const w = isFullyWatched(i);
      if (f.watched === "watched" && !w) return false;
      if (f.watched === "unwatched" && w) return false;
    }

    if (voteActive) {
      const v = i.vote_average ?? 0;
      if (v < f.voteGte || v > f.voteLte) return false;
    }

    if (yearActive) {
      const y = yearOf(i);
      if (y === null || y < f.yearGte || y > f.yearLte) return false;
    }

    if (f.include.length || f.exclude.length) {
      const ids = (i.genre_ids ?? []).map(Number);
      if (!f.include.every((g) => ids.includes(g))) return false;
      if (f.exclude.some((g) => ids.includes(g))) return false;
    }
    return true;
  });

  return f.sortKey ? sortLibrary(out, f.sortKey, f.sortDir) : out;
}

// helpers/libraryFilter.ts — add at the end. Keep the rest.
// Builds the server query string. Defaults are omitted, as the old client logic did.
export function toLibraryQuery(f: LibraryFilters): string {
  const p: string[] = [];
  const add = (k: string, v: string | number) =>
    p.push(`${k}=${encodeURIComponent(String(v))}`);

  if (f.sortKey) {
    add("sort", f.sortKey);
    add("dir", f.sortDir);
  }
  if (f.watched !== "all")
    add("watched", f.watched === "watched" ? "true" : "false");
  if (f.favoritesOnly) add("favorite", "true");
  if (f.voteGte > VOTE_MIN) add("vote_gte", f.voteGte);
  if (f.voteLte < VOTE_MAX) add("vote_lte", f.voteLte);
  if (f.yearGte > YEAR_MIN) add("year_gte", f.yearGte);
  if (f.yearLte < YEAR_MAX) add("year_lte", f.yearLte);
  if (f.include.length) add("genres_in", f.include.join(","));
  if (f.exclude.length) add("genres_out", f.exclude.join(","));
  return p.join("&");
}
