export interface BaseContent {
  id: number;
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;

  // Backend proxy annotation (GET /tmdb/*): present on every catalog item.
  // in_library — true when the item is saved in the user's library.
  in_library?: boolean;

  // Detay endpointten gelen opsiyonel ek alanlar
  genres?: { id: number; name: string }[];
  production_companies?: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries?: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages?: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  homepage?: string | null;
  status?: string;
  tagline?: string | null;
}

export interface Movie extends BaseContent {
  title: string;
  original_title: string;
  release_date: string;
  video: boolean;

  // Backend proxy annotation: watched state for movies (TV has no
  // show-level watched state — see Tv).
  is_watched?: boolean;

  // Detay endpoint ekleri
  budget?: number;
  revenue?: number;
  runtime?: number;
  imdb_id?: string | null;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
}

export interface Tv extends BaseContent {
  name: string;
  original_name: string;
  origin_country: string[];
  first_air_date: string;

  // Backend library response (GET /tv): episode progress counts, used by
  // ContentCard to render the watched-ratio fade on library cards.
  episode_count?: number;
  watched_episode_count?: number;

  // Detay endpoint ekleri
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  type?: string;
  in_production?: boolean;
  created_by?: {
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string | null;
  }[];
  networks?: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  seasons?: {
    air_date: string | null;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }[];
  last_episode_to_air?: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  };
}

// Movie ve Tv tiplerini birleştiren MediaItem

export interface MediaItem extends BaseContent {
  // Backend proxy annotation: watched state for movies (TV has no
  // show-level watched state).
  is_watched?: boolean;

  // Film alanları
  title?: string;
  original_title?: string;
  release_date?: string;
  video?: boolean;
  budget?: number;
  revenue?: number;
  runtime?: number;
  imdb_id?: string | null;

  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;

  // Dizi alanları
  name?: string;
  original_name?: string;
  origin_country?: string[];

  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  type?: string;
  in_production?: boolean;

  // Backend library response (GET /tv): episode progress counts, used by
  // ContentCard to render the watched-ratio fade on library cards.
  episode_count?: number;
  watched_episode_count?: number;

  created_by?: {
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string | null;
  }[];

  networks?: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];

  seasons?: TvSeason[];

  last_episode_to_air?: TvEpisode | null;
}
export interface SeasonProgress {
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  percentage: number;
}
export interface Company {
  description?: string;
  headquarters?: string;
  homepage: string;
  id?: number;
  logo_path?: string;
  name?: string;
  origin_country?: string;
  parent_company?: string;
}

export interface UnitedWithDb extends MediaItem {
  isWatched: boolean;
}
export interface TvSeason {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}
export interface TvEpisode {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_number: number;
  episode_type: string;
  runtime: number | null;
  season_number: number;
  show_id?: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  production_code?: string;
}
export interface WatchedTvEpisode extends TvEpisode {
  tv_id: number;
  tmdb_episode_id: number;
  isWatched: boolean;
  watched_at: string | null;
  rewatch_count: number;
}
