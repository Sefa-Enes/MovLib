import {
  Movie,
  SeasonProgress,
  Tv,
  TvEpisode,
  WatchedTvEpisode,
} from "@/interface/interfaces";

// Web storage helperss
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

const getWebEpisodes = async (): Promise<any[]> => {
  const data = getWebStorage().getItem("tv_episodes");
  return data ? JSON.parse(data) : [];
};

const setWebEpisodes = async (episodes: any[]): Promise<void> => {
  getWebStorage().setItem("tv_episodes", JSON.stringify(episodes));
};
// ============= WEB IMPLEMENTATIONS =============
export const getSeasonProgress = async (
  tvId: number,
  seasonNumber: number,
): Promise<SeasonProgress> => {
  const episodes = await getWebEpisodes();

  const seasonEpisodes = episodes.filter(
    (episode) =>
      episode.tv_id === tvId && episode.season_number === seasonNumber,
  );

  const totalEpisodes = seasonEpisodes.length;

  const watchedEpisodes = seasonEpisodes.filter(
    (episode) => episode.isWatched,
  ).length;

  return {
    seasonNumber,
    totalEpisodes,
    watchedEpisodes,
    percentage:
      totalEpisodes === 0
        ? 0
        : Math.round((watchedEpisodes / totalEpisodes) * 100),
  };
};
export const insertMovieWithGenres = async (
  movie: Movie,
  isWatched: boolean = false,
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
  isWatched: boolean = false,
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
export const upsertTvEpisodes = async (
  tvId: number,
  episodes: TvEpisode[],
): Promise<void> => {
  const storedEpisodes = await getWebEpisodes();

  for (const episode of episodes) {
    const existingIndex = storedEpisodes.findIndex(
      (item) =>
        item.tv_id === tvId &&
        item.season_number === episode.season_number &&
        item.episode_number === episode.episode_number,
    );

    const existing =
      existingIndex >= 0 ? storedEpisodes[existingIndex] : undefined;

    const episodeData = {
      tv_id: tvId,
      season_number: episode.season_number,
      episode_number: episode.episode_number,
      name: episode.name,
      overview: episode.overview || "",
      air_date: episode.air_date || null,
      still_path: episode.still_path || null,
      tmdb_episode_id: episode.id,
      isWatched: existing?.isWatched ?? false,
      watched_at: existing?.watched_at ?? null,
      rewatch_count: existing?.rewatch_count ?? 0,
    };

    if (existingIndex >= 0) {
      storedEpisodes[existingIndex] = episodeData;
    } else {
      storedEpisodes.push(episodeData);
    }
  }

  await setWebEpisodes(storedEpisodes);
};

export const getEpisodesBySeason = async (
  tvId: number,
  seasonNumber: number,
): Promise<WatchedTvEpisode[]> => {
  const episodes = await getWebEpisodes();

  return episodes
    .filter(
      (episode) =>
        episode.tv_id === tvId && episode.season_number === seasonNumber,
    )
    .sort((a, b) => a.episode_number - b.episode_number)
    .map((episode) => ({
      ...episode,
      id: episode.tmdb_episode_id,
      episode_type: "standard",
      runtime: null,
      vote_average: 0,
      vote_count: 0,
      isWatched: Boolean(episode.isWatched),
    }));
};

export const toggleEpisodeWatched = async ({
  tvId,
  seasonNumber,
  episodeNumber,
  watched,
}: {
  tvId: number;
  seasonNumber: number;
  episodeNumber: number;
  watched: boolean;
}): Promise<void> => {
  const episodes = await getWebEpisodes();

  const episode = episodes.find(
    (item) =>
      item.tv_id === tvId &&
      item.season_number === seasonNumber &&
      item.episode_number === episodeNumber,
  );

  if (!episode) {
    return;
  }

  episode.isWatched = watched;
  episode.watched_at = watched ? new Date().toISOString() : null;

  await setWebEpisodes(episodes);
};

export const markSeasonWatched = async ({
  tvId,
  seasonNumber,
  watched,
}: {
  tvId: number;
  seasonNumber: number;
  watched: boolean;
}): Promise<void> => {
  const episodes = await getWebEpisodes();

  episodes.forEach((episode) => {
    if (episode.tv_id === tvId && episode.season_number === seasonNumber) {
      episode.isWatched = watched;
      episode.watched_at = watched ? new Date().toISOString() : null;
    }
  });

  await setWebEpisodes(episodes);
};

export const getTvProgress = async (tvId: number) => {
  const episodes = await getWebEpisodes();

  const tvEpisodes = episodes.filter((episode) => episode.tv_id === tvId);

  const totalEpisodes = tvEpisodes.length;

  const watchedEpisodes = tvEpisodes.filter(
    (episode) => episode.isWatched,
  ).length;

  return {
    totalEpisodes,
    watchedEpisodes,
    percentage:
      totalEpisodes === 0
        ? 0
        : Math.round((watchedEpisodes / totalEpisodes) * 100),
  };
};
