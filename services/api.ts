// const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
// const options = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZTk4MGIyN2E3MWUzNjE3YjJiMDkzYjczMDQ5ODM4OSIsIm5iZiI6MTc1OTgyMTU0OC40MDMsInN1YiI6IjY4ZTRiZWVjYWYwNmI5N2IzMjk2MWNmYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vNFfhEy5PL3Gr7_Nl1SH31zpkLJDoliQIGr8utd91OM'
//   }
// };

import { MediaItem, Movie, Tv } from "@/interface/interfaces";

// fetch(url, options)
//   .then(res => res.json())
//   .then(json => console.log(json))
//   .catch(err => console.error(err));

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?include_adult=true&sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};
export const fetchSeries = async ({
  query,
}: {
  query: string;
}): Promise<Tv[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

export const fetchMovieDetails = async ({
  id,
}: {
  id: number;
}): Promise<MediaItem> => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${id}?language=en-US`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movie: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
export const fetchTvDetails = async ({
  id,
}: {
  id: number;
}): Promise<MediaItem> => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/tv/${id}?language=en-US`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movie: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const fetchSimilar = async ({
  contentType = "movie",

  id,
}: {
  contentType?: "movie" | "tv";
  id: number;
}): Promise<MediaItem[]> => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/${contentType}/${id}/similar?language=en-US&sort_by=popularity.desc&page=1`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};
