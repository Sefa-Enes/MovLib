// utils/tmdbQueryBuilder.ts
export interface Sort {
  sort_by?:
    | "popularity.asc"
    | "popularity.desc"
    | "revenue.asc"
    | "revenue.desc"
    | "primary_release_date.asc"
    | "primary_release_date.desc"
    | "original_title.asc"
    | "original_title.desc"
    | "title.asc"
    | "title.desc"
    | "vote_average.asc"
    | "vote_average.desc"
    | "vote_count.asc"
    | "vote_count.desc";
}
export interface DiscoverMovieFilters extends Sort {
  certification?: string;
  certification_gte?: string;
  certification_lte?: string;
  certification_country?: string;
  include_adult?: boolean;
  include_video?: boolean;
  language?: string;
  page?: number;
  primary_release_year?: number;
  primary_release_date_gte?: string; // YYYY-MM-DD
  primary_release_date_lte?: string; // YYYY-MM-DD
  region?: string;
  release_date_gte?: string;
  release_date_lte?: string;

  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  vote_count_lte?: number;
  watch_region?: string;
  with_cast?: string | string[];
  with_companies?: string | string[] | undefined;
  with_crew?: string | string[];
  with_genres?: number | number[];
  with_keywords?: string | string[];
  with_origin_country?: string;
  with_original_language?: string;
  with_people?: string | string[];
  with_release_type?: number | number[];
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  with_watch_providers?: string | string[];
  without_companies?: string | string[];
  without_genres?: string | number | (string | number)[];
  without_keywords?: string | string[];
  without_watch_providers?: string | string[];
  year?: number;
}

/**
 * Converts DiscoverMovieFilters object into valid TMDB query params
 */
export const buildDiscoverMovieParams = (
  filters: DiscoverMovieFilters = {}
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    // TMDB query params contain dots (e.g. "vote_average.gte")
    const paramKey = key;

    if (Array.isArray(value)) {
      params.append(paramKey, value.join(","));
    } else if (typeof value === "boolean") {
      params.append(paramKey, value ? "true" : "false");
    } else {
      params.append(paramKey, String(value));
    }
  }

  return params.toString();
};
