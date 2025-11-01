import { Movie, Tv } from "@/interface/interfaces";

// Web storage helpers
const getWebStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("localStorage not available");
  }
  return window.localStorage;
};

const getWebMovies = async (): Promise<any[]> => {
  const data = getWebStorage().getItem("movies_watchlist");
  return data ? JSON.parse(data) : [];
};

const setWebMovies = async (movies: any[]): Promise<void> => {
  getWebStorage().setItem("movies_watchlist", JSON.stringify(movies));
};

const getWebTvShows = async (): Promise<any[]> => {
  const data = getWebStorage().getItem("tv_watchlist");
  return data ? JSON.parse(data) : [];
};

const setWebTvShows = async (tvShows: any[]): Promise<void> => {
  getWebStorage().setItem("tv_watchlist", JSON.stringify(tvShows));
};

// ============= WEB IMPLEMENTATIONS =============

export const insertMovieWithGenres = async (
  movie: Movie,
  isWatched: boolean = false
) => {
  const movies = await getWebMovies();
  const existingIndex = movies.findIndex((m) => m.id === movie.id);

  const movieData = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path || null,
    release_date: movie.release_date || null,
    vote_average: movie.vote_average || 0,
    isWatched,
    genre_ids: movie.genre_ids || [],
  };

  if (existingIndex >= 0) {
    movies[existingIndex] = movieData;
  } else {
    movies.push(movieData);
  }

  await setWebMovies(movies);
  console.log(`✅ Movie inserted with genres: ${movie.title}`);
};

export const insertTvWithGenres = async (
  tv: Tv,
  isWatched: boolean = false
) => {
  const tvShows = await getWebTvShows();
  const existingIndex = tvShows.findIndex((t) => t.id === tv.id);

  const tvData = {
    id: tv.id,
    name: tv.name,
    poster_path: tv.poster_path || null,
    first_air_date: tv.first_air_date || null,
    vote_average: tv.vote_average || 0,
    isWatched,
    genre_ids: tv.genre_ids || [],
  };

  if (existingIndex >= 0) {
    tvShows[existingIndex] = tvData;
  } else {
    tvShows.push(tvData);
  }

  await setWebTvShows(tvShows);
  console.log(`✅ TV show inserted with genres: ${tv.name}`);
};

export const getAllMoviesWithGenres = async (onlyWatched: boolean = false) => {
  let movies = await getWebMovies();
  if (onlyWatched) {
    movies = movies.filter((m) => m.isWatched);
  }
  return movies;
};

export const getMoviesWithGenres = async (onlyWatched: boolean = false) => {
  let movies = await getWebMovies();
  if (onlyWatched) {
    movies = movies.filter((m) => m.isWatched);
  }

  return movies.map((movie) => ({
    ...movie,
    genre_names: [],
  }));
};

export const getTvShowsWithGenres = async (onlyWatched: boolean = false) => {
  let tvShows = await getWebTvShows();
  if (onlyWatched) {
    tvShows = tvShows.filter((t) => t.isWatched);
  }
  return tvShows;
};

export const toggleMovieWatched = async (id: number, watched: boolean) => {
  const movies = await getWebMovies();
  const movie = movies.find((m) => m.id === id);
  if (movie) {
    movie.isWatched = watched;
    await setWebMovies(movies);
    console.log(`🔁 Movie ${id} isWatched = ${watched}`);
  }
};

export const toggleTvWatched = async (id: number, watched: boolean) => {
  const tvShows = await getWebTvShows();
  const tv = tvShows.find((t) => t.id === id);
  if (tv) {
    tv.isWatched = watched;
    await setWebTvShows(tvShows);
    console.log(`🔁 TV show ${id} isWatched = ${watched}`);
  }
};

export const deleteMovie = async (id: number) => {
  const movies = await getWebMovies();
  const filtered = movies.filter((m) => m.id !== id);
  await setWebMovies(filtered);
  console.log(`🗑️ Movie ${id} deleted`);
};

export const deleteTvShow = async (id: number) => {
  const tvShows = await getWebTvShows();
  const filtered = tvShows.filter((t) => t.id !== id);
  await setWebTvShows(filtered);
  console.log(`🗑️ TV show ${id} deleted`);
};

export const getMovieById = async (id: number) => {
  const movies = await getWebMovies();
  return movies.find((m) => m.id === id) || null;
};

export const getTvShowById = async (id: number) => {
  const tvShows = await getWebTvShows();
  return tvShows.find((t) => t.id === id) || null;
};
