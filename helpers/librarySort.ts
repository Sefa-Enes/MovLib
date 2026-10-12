// helpers/librarySort.ts
import type { MediaItem } from "@/interface/interfaces";

export type LibrarySortKey =
  | "dateAdded"
  | "isWatched"
  | "watchedDate"
  | "category"
  | "year"
  | "title"
  | "rating";

export type SortDirection = "asc" | "desc";

// Library item = MediaItem + fields from the Go backend.
export type LibraryItem = MediaItem & {
  added_at?: string | null;
  watched_at?: string | null; // movie
  last_watched_at?: string | null; // TV
  genre_names?: string[];
  is_favorite?: boolean;
};

const titleOf = (i: LibraryItem) => i.title ?? i.name ?? "";

const time = (v?: string | null): number | null => {
  if (!v) return null;
  // Go sends microseconds. Cut the fraction to 3 digits for the Hermes parser.
  const t = Date.parse(v.replace(/(\.\d{3})\d+/, "$1"));
  return Number.isNaN(t) ? null : t;
};

export const yearOf = (i: LibraryItem): number | null => {
  const d = i.release_date || i.first_air_date;
  const y = d ? parseInt(d.slice(0, 4), 10) : NaN;
  return Number.isNaN(y) ? null : y;
};

// Movie: is_watched. TV: all stored episodes are watched.
export const isFullyWatched = (i: LibraryItem): boolean => watchedScore(i) >= 1;
// Movie: 0 or 1. TV: watched episodes / total episodes.
const watchedScore = (i: LibraryItem): number => {
  if (i.title !== undefined) return i.is_watched ? 1 : 0;
  const total = i.episode_count ?? 0;
  return total > 0 ? (i.watched_episode_count ?? 0) / total : 0;
};

// Alphabetically first genre name. Backend array order is not guaranteed.
const categoryOf = (i: LibraryItem): string | null => {
  const names = i.genre_names;
  if (!names || names.length === 0) return null;
  return [...names].sort((a, b) => a.localeCompare(b))[0];
};

const keyValue = (
  i: LibraryItem,
  key: LibrarySortKey,
): number | string | null => {
  switch (key) {
    case "dateAdded":
      return time(i.added_at);
    case "isWatched":
      return watchedScore(i);
    case "watchedDate":
      return time(i.title !== undefined ? i.watched_at : i.last_watched_at);
    case "category":
      return categoryOf(i);
    case "year":
      return yearOf(i);
    case "title":
      return titleOf(i);
    case "rating":
      return i.vote_average ?? 0;
  }
};

export function sortLibrary<T extends LibraryItem>(
  items: T[],
  key: LibrarySortKey,
  dir: SortDirection,
): T[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = keyValue(a, key);
    const vb = keyValue(b, key);
    // Null values always go last, in both directions.
    if (va === null && vb === null) return titleOf(a).localeCompare(titleOf(b));
    if (va === null) return 1;
    if (vb === null) return -1;
    let cmp =
      typeof va === "string" && typeof vb === "string"
        ? va.localeCompare(vb)
        : (va as number) - (vb as number);
    if (cmp === 0) return titleOf(a).localeCompare(titleOf(b));
    return cmp * sign;
  });
}
