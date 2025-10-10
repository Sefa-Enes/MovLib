interface BaseContent {
  id: number;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}

export interface Movie extends BaseContent {
  title: string;
  original_title: string;
  release_date: string;
  video: boolean;
}

export interface Tv extends BaseContent {
  name: string;
  original_name: string;
  origin_country: string[];
  first_air_date: string;
}

export interface MediaItem extends Movie, Tv {}
