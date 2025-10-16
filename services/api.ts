import { Company, MediaItem, Movie, Tv } from "@/interface/interfaces";
import {
  buildDiscoverMovieParams,
  buildDiscoverTvParams,
  DiscoverMovieFilters,
  DiscoverTvFilters,
} from "@/utils/queryBuilder";

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
  filters,
}: {
  query: string;
  filters?: DiscoverMovieFilters;
}): Promise<Movie[]> => {
  const queryParams = buildDiscoverMovieParams(filters);
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?${
        queryParams || "sort_by=popularity.desc"
      }`;

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
  filters,
}: {
  query: string;
  filters?: DiscoverTvFilters;
}): Promise<Tv[]> => {
  const queryParams = buildDiscoverTvParams(filters);

  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?${
        queryParams || "sort_by=popularity.desc"
      }`;

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
export const addToWatchList = async ({
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

export const fetchCompany = async ({
  id = 0,
}: {
  id?: number;
}): Promise<Company> => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/company/${id}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
