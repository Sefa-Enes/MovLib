// utils/tmdbQueryBuilder.ts
export interface SortTv {
  sort_by?:
    | "popularity.asc"
    | "popularity.desc"
    | "first_air_date.asc"
    | "first_air_date.desc"
    | "name.asc"
    | "name.desc"
    | "original_name.asc"
    | "original_name.desc"
    | "vote_average.asc"
    | "vote_average.desc"
    | "vote_count.asc"
    | "vote_count.desc";
}
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
/**
 * TV Discovery Filters — https://developer.themoviedb.org/reference/discover-tv
 */
export interface DiscoverTvFilters extends SortTv {
  air_date_gte?: string; // YYYY-MM-DD
  air_date_lte?: string; // YYYY-MM-DD
  first_air_date_year?: number;
  first_air_date_gte?: string;
  first_air_date_lte?: string;
  include_adult?: boolean; // default: false
  include_null_first_air_dates?: boolean; // default: false
  language?: string; // default: en-US
  page?: number; // default: 1
  screened_theatrically?: boolean;
  timezone?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  vote_count_lte?: number;
  watch_region?: string;

  // Relationship filters
  with_companies?: string | string[];
  with_genres?: string | string[] | number | number[];
  with_keywords?: string | string[];
  with_networks?: string | number | (string | number)[];
  with_origin_country?: string;
  with_original_language?: string;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  with_status?: string | number | (string | number)[];
  with_watch_monetization_types?:
    | "flatrate"
    | "free"
    | "ads"
    | "rent"
    | "buy"
    | ("flatrate" | "free" | "ads" | "rent" | "buy")[];
  with_watch_providers?: string | string[];
  with_type?: string | number | (string | number)[];
  without_companies?: string | string[];
  without_genres?: string | number | (string | number)[];
  without_keywords?: string | string[];
  without_watch_providers?: string | string[];
}

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
export const buildDiscoverTvParams = (filters: DiscoverTvFilters = {}) => {
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
