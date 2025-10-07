interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
interface Tv {
  id: number;
  name: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_name: string;
  origin_country: strings[];
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
}
