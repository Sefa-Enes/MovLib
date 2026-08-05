import { db } from "@/db/database";
import {
  Movie,
  SeasonProgress,
  Tv,
  TvEpisode,
  WatchedTvEpisode,
} from "@/interface/interfaces";
import { Platform } from "react-native";

// Helper to get non-null db for native platforms
const getDB = () => {
  if (!db) {
    throw new Error(
      "Database not initialized - this should only be called on native platforms",
    );
  }
  return db;
};

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
const getWebEpisodes = async (): Promise<any[]> => {
  const data = getWebStorage().getItem("tv_episodes");

  return data ? JSON.parse(data) : [];
};

const setWebEpisodes = async (episodes: any[]): Promise<void> => {
  getWebStorage().setItem("tv_episodes", JSON.stringify(episodes));
};
// ============= EXISTING FUNCTIONS - NOW PLATFORM AGNOSTIC =============

export const insertMovieWithGenres = async (
  movie: Movie,
  isWatched: boolean = false,
) => {
  if (Platform.OS === "web") {
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
  } else {
    const database = getDB();

    try {
      // @ts-ignore - database is guaranteed to be SQLiteDatabase on native platforms
      await database.withTransactionAsync(async () => {
        await database.runAsync(
          `INSERT OR REPLACE INTO MovieWL 
           (id, title, poster_path, release_date, vote_average, isWatched)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            movie.id,
            movie.title,
            movie.poster_path || null,
            movie.release_date || null,
            movie.vote_average || 0,
            isWatched ? 1 : 0,
          ],
        );

        await database.runAsync(`DELETE FROM MovieGenre WHERE movie_id = ?`, [
          movie.id,
        ]);

        if (movie.genre_ids && movie.genre_ids.length > 0) {
          for (const genreId of movie.genre_ids) {
            await database.runAsync(
              `INSERT INTO MovieGenre (movie_id, genre_id) VALUES (?, ?)`,
              [movie.id, genreId],
            );
          }
        }
      });

      console.log(`✅ Movie inserted with genres: ${movie.title}`);
    } catch (error) {
      console.error("❌ Insert movie with genres error:", error);
      throw error;
    }
  }
};

export const insertTvWithGenres = async (
  tv: Tv,
  isWatched: boolean = false,
) => {
  if (Platform.OS === "web") {
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
  } else {
    const database = getDB();

    try {
      await database.withTransactionAsync(async () => {
        await database.runAsync(
          `INSERT OR REPLACE INTO TvWL 
           (id, name, poster_path, first_air_date, vote_average, isWatched)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            tv.id,
            tv.name,
            tv.poster_path || null,
            tv.first_air_date || null,
            tv.vote_average || 0,
            isWatched ? 1 : 0,
          ],
        );

        await database.runAsync(`DELETE FROM TvGenre WHERE tv_id = ?`, [tv.id]);

        if (tv.genre_ids && tv.genre_ids.length > 0) {
          for (const genreId of tv.genre_ids) {
            await database.runAsync(
              `INSERT INTO TvGenre (tv_id, genre_id) VALUES (?, ?)`,
              [tv.id, genreId],
            );
          }
        }
      });

      console.log(`✅ TV show inserted with genres: ${tv.name}`);
    } catch (error) {
      console.error("❌ Insert TV show with genres error:", error);
      throw error;
    }
  }
};

export const getAllMoviesWithGenres = async (onlyWatched: boolean = false) => {
  if (Platform.OS === "web") {
    let movies = await getWebMovies();
    if (onlyWatched) {
      movies = movies.filter((m) => m.isWatched);
    }
    return movies;
  } else {
    const database = getDB();

    try {
      const whereClause = onlyWatched ? "WHERE m.isWatched = 1" : "";

      const movies = await database.getAllAsync<{
        id: number;
        title: string;
        poster_path: string | null;
        release_date: string | null;
        vote_average: number;
        isWatched: number;
      }>(`
        SELECT 
          m.*
        FROM MovieWL m
        ${whereClause}
        GROUP BY m.id
      `);

      return movies.map((movie) => ({
        ...movie,
        isWatched: movie.isWatched === 1,
      }));
    } catch (error) {
      console.error("❌ Get movies with genres error:", error);
      return [];
    }
  }
};

export const getMoviesWithGenres = async (onlyWatched: boolean = false) => {
  if (Platform.OS === "web") {
    let movies = await getWebMovies();
    if (onlyWatched) {
      movies = movies.filter((m) => m.isWatched);
    }

    return movies.map((movie) => ({
      ...movie,
      genre_names: [],
    }));
  } else {
    const database = getDB();

    try {
      const whereClause = onlyWatched ? "WHERE m.isWatched = 1" : "";

      const movies = await database.getAllAsync<{
        id: number;
        title: string;
        poster_path: string | null;
        release_date: string | null;
        vote_average: number;
        isWatched: number;
        genre_ids: string | null;
        genre_names: string | null;
      }>(`
        SELECT 
          m.*,
          GROUP_CONCAT(mg.genre_id) as genre_ids,
          GROUP_CONCAT(g.name) as genre_names
        FROM MovieWL m
        LEFT JOIN MovieGenre mg ON m.id = mg.movie_id
        LEFT JOIN GenresMovie g ON mg.genre_id = g.id
        ${whereClause}
        GROUP BY m.id
      `);

      return movies.map((movie) => ({
        ...movie,
        isWatched: movie.isWatched === 1,
        genre_ids: movie.genre_ids
          ? movie.genre_ids.split(",").map(Number)
          : [],
        genre_names: movie.genre_names ? movie.genre_names.split(",") : [],
      }));
    } catch (error) {
      console.error("❌ Get movies with genres error:", error);
      return [];
    }
  }
};

export const getTvShowsWithGenres = async (onlyWatched: boolean = false) => {
  if (Platform.OS === "web") {
    let tvShows = await getWebTvShows();
    if (onlyWatched) {
      tvShows = tvShows.filter((t) => t.isWatched);
    }
    return tvShows;
  } else {
    const database = getDB();

    try {
      const whereClause = onlyWatched ? "WHERE t.isWatched = 1" : "";

      const tvShows = await database.getAllAsync<{
        id: number;
        name: string;
        poster_path: string | null;
        first_air_date: string | null;
        vote_average: number;
        isWatched: number;
      }>(`
        SELECT 
          t.*
        FROM TvWL t
        ${whereClause}
        GROUP BY t.id
      `);

      return tvShows.map((tv) => ({
        ...tv,
        isWatched: tv.isWatched === 1,
      }));
    } catch (error) {
      console.error("❌ Get TV shows with genres error:", error);
      return [];
    }
  }
};

export const toggleMovieWatched = async (id: number, watched: boolean) => {
  if (Platform.OS === "web") {
    const movies = await getWebMovies();
    const movie = movies.find((m) => m.id === id);
    if (movie) {
      movie.isWatched = watched;
      await setWebMovies(movies);
      console.log(`🔁 Movie ${id} isWatched = ${watched}`);
    }
  } else {
    const database = getDB();

    try {
      await database.runAsync("UPDATE MovieWL SET isWatched = ? WHERE id = ?", [
        watched ? 1 : 0,
        id,
      ]);
      console.log(`🔁 Movie ${id} isWatched = ${watched}`);
    } catch (error) {
      console.error("❌ Toggle movie watched error:", error);
      throw error;
    }
  }
};

export const toggleTvWatched = async (id: number, watched: boolean) => {
  if (Platform.OS === "web") {
    const tvShows = await getWebTvShows();
    const tv = tvShows.find((t) => t.id === id);
    if (tv) {
      tv.isWatched = watched;
      await setWebTvShows(tvShows);
      console.log(`🔁 TV show ${id} isWatched = ${watched}`);
    }
  } else {
    const database = getDB();

    try {
      await database.runAsync("UPDATE TvWL SET isWatched = ? WHERE id = ?", [
        watched ? 1 : 0,
        id,
      ]);
      console.log(`🔁 TV show ${id} isWatched = ${watched}`);
    } catch (error) {
      console.error("❌ Toggle TV watched error:", error);
      throw error;
    }
  }
};

export const deleteMovie = async (id: number) => {
  if (Platform.OS === "web") {
    const movies = await getWebMovies();
    const filtered = movies.filter((m) => m.id !== id);
    await setWebMovies(filtered);
    console.log(`🗑️ Movie ${id} deleted`);
  } else {
    const database = getDB();

    try {
      await database.runAsync("DELETE FROM MovieWL WHERE id = ?", [id]);
      console.log(`🗑️ Movie ${id} deleted`);
    } catch (error) {
      console.error("❌ Delete movie error:", error);
      throw error;
    }
  }
};

export const deleteTvShow = async (id: number) => {
  if (Platform.OS === "web") {
    const tvShows = await getWebTvShows();
    const filtered = tvShows.filter((t) => t.id !== id);
    await setWebTvShows(filtered);
    console.log(`🗑️ TV show ${id} deleted`);
  } else {
    const database = getDB();

    try {
      await database.runAsync("DELETE FROM TvWL WHERE id = ?", [id]);
      console.log(`🗑️ TV show ${id} deleted`);
    } catch (error) {
      console.error("❌ Delete TV show error:", error);
      throw error;
    }
  }
};

export const getMovieById = async (id: number) => {
  if (Platform.OS === "web") {
    const movies = await getWebMovies();
    return movies.find((m) => m.id === id) || null;
  } else {
    const database = getDB();

    try {
      const dbMovie = await database.getFirstAsync<{
        id: number;
        title: string;
        poster_path: string | null;
        release_date: string | null;
        vote_average: number;
        isWatched: number;
      }>(
        `
        SELECT 
          m.*
        FROM MovieWL m
        WHERE m.id = ?
        GROUP BY m.id
      `,
        [id],
      );

      if (!dbMovie) return null;

      return {
        ...dbMovie,
        isWatched: dbMovie.isWatched === 1,
      };
    } catch (error) {
      console.error("❌ Get movie by id error:", error);
      return null;
    }
  }
};

export const getTvShowById = async (id: number) => {
  if (Platform.OS === "web") {
    const tvShows = await getWebTvShows();
    return tvShows.find((t) => t.id === id) || null;
  } else {
    const database = getDB();

    try {
      const tvShow = await database.getFirstAsync<{
        id: number;
        name: string;
        poster_path: string | null;
        first_air_date: string | null;
        vote_average: number;
        isWatched: number;
      }>(
        `
        SELECT 
          t.*
        FROM TvWL t
        WHERE t.id = ?
        GROUP BY t.id
      `,
        [id],
      );

      if (!tvShow) return null;

      return {
        ...tvShow,
        isWatched: tvShow.isWatched === 1,
      };
    } catch (error) {
      console.error("❌ Get TV show by id error:", error);
      return null;
    }
  }
};
export const upsertTvEpisodes = async (
  tvId: number,
  episodes: TvEpisode[],
): Promise<void> => {
  if (Platform.OS === "web") {
    const storedEpisodes = await getWebEpisodes();

    for (const episode of episodes) {
      const existingIndex = storedEpisodes.findIndex(
        (item) =>
          item.tv_id === tvId &&
          item.season_number === episode.season_number &&
          item.episode_number === episode.episode_number,
      );

      const existingEpisode =
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

        // Kullanıcı verilerini koruyoruz
        isWatched: existingEpisode?.isWatched ?? false,
        watched_at: existingEpisode?.watched_at ?? null,
        rewatch_count: existingEpisode?.rewatch_count ?? 0,
      };

      if (existingIndex >= 0) {
        storedEpisodes[existingIndex] = episodeData;
      } else {
        storedEpisodes.push(episodeData);
      }
    }

    await setWebEpisodes(storedEpisodes);
    return;
  }

  const database = getDB();

  await database.withTransactionAsync(async () => {
    for (const episode of episodes) {
      await database.runAsync(
        `
        INSERT INTO TvEpisodes (
          tv_id,
          season_number,
          episode_number,
          name,
          overview,
          air_date,
          still_path,
          tmdb_episode_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (
          tv_id,
          season_number,
          episode_number
        )
        DO UPDATE SET
          name = excluded.name,
          overview = excluded.overview,
          air_date = excluded.air_date,
          still_path = excluded.still_path,
          tmdb_episode_id = excluded.tmdb_episode_id
        `,
        [
          tvId,
          episode.season_number,
          episode.episode_number,
          episode.name,
          episode.overview || null,
          episode.air_date || null,
          episode.still_path || null,
          episode.id,
        ],
      );
    }
  });
};
export const getEpisodesBySeason = async (
  tvId: number,
  seasonNumber: number,
): Promise<WatchedTvEpisode[]> => {
  if (Platform.OS === "web") {
    const storedEpisodes = await getWebEpisodes();

    return storedEpisodes
      .filter(
        (episode) =>
          episode.tv_id === tvId && episode.season_number === seasonNumber,
      )
      .sort((a, b) => a.episode_number - b.episode_number)
      .map((episode) => ({
        ...episode,
        id: episode.tmdb_episode_id,
        tmdb_episode_id: episode.tmdb_episode_id,
        episode_type: "standard",
        runtime: null,
        vote_average: 0,
        vote_count: 0,
        isWatched: Boolean(episode.isWatched),
      }));
  }

  const database = getDB();

  const episodes = await database.getAllAsync<{
    id: number;
    tv_id: number;
    season_number: number;
    episode_number: number;
    name: string;
    overview: string | null;
    air_date: string | null;
    still_path: string | null;
    tmdb_episode_id: number | null;
    isWatched: number;
    watched_at: string | null;
    rewatch_count: number;
  }>(
    `
    SELECT *
    FROM TvEpisodes
    WHERE tv_id = ?
      AND season_number = ?
    ORDER BY episode_number ASC
    `,
    [tvId, seasonNumber],
  );

  return episodes.map((episode) => ({
    id: episode.tmdb_episode_id ?? episode.id,
    tmdb_episode_id: episode.tmdb_episode_id ?? episode.id,
    tv_id: episode.tv_id,
    season_number: episode.season_number,
    episode_number: episode.episode_number,
    name: episode.name,
    overview: episode.overview ?? "",
    air_date: episode.air_date,
    still_path: episode.still_path,
    episode_type: "standard",
    runtime: null,
    vote_average: 0,
    vote_count: 0,
    isWatched: episode.isWatched === 1,
    watched_at: episode.watched_at,
    rewatch_count: episode.rewatch_count,
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
  const watchedAt = watched ? new Date().toISOString() : null;

  if (Platform.OS === "web") {
    const storedEpisodes = await getWebEpisodes();

    const episode = storedEpisodes.find(
      (item) =>
        item.tv_id === tvId &&
        item.season_number === seasonNumber &&
        item.episode_number === episodeNumber,
    );

    if (episode) {
      episode.isWatched = watched;
      episode.watched_at = watchedAt;

      await setWebEpisodes(storedEpisodes);
    }

    return;
  }

  const database = getDB();

  await database.runAsync(
    `
    UPDATE TvEpisodes
    SET
      isWatched = ?,
      watched_at = ?
    WHERE tv_id = ?
      AND season_number = ?
      AND episode_number = ?
    `,
    [watched ? 1 : 0, watchedAt, tvId, seasonNumber, episodeNumber],
  );
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
  const watchedAt = watched ? new Date().toISOString() : null;

  if (Platform.OS === "web") {
    const storedEpisodes = await getWebEpisodes();

    storedEpisodes.forEach((episode) => {
      if (episode.tv_id === tvId && episode.season_number === seasonNumber) {
        episode.isWatched = watched;
        episode.watched_at = watchedAt;
      }
    });

    await setWebEpisodes(storedEpisodes);
    return;
  }

  const database = getDB();

  await database.runAsync(
    `
    UPDATE TvEpisodes
    SET
      isWatched = ?,
      watched_at = ?
    WHERE tv_id = ?
      AND season_number = ?
    `,
    [watched ? 1 : 0, watchedAt, tvId, seasonNumber],
  );
};
export const getTvProgress = async (
  tvId: number,
): Promise<{
  totalEpisodes: number;
  watchedEpisodes: number;
  percentage: number;
}> => {
  if (Platform.OS === "web") {
    const storedEpisodes = await getWebEpisodes();

    const tvEpisodes = storedEpisodes.filter(
      (episode) => episode.tv_id === tvId,
    );

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
  }

  const database = getDB();

  const result = await database.getFirstAsync<{
    totalEpisodes: number;
    watchedEpisodes: number;
  }>(
    `
    SELECT
      COUNT(*) AS totalEpisodes,
      COALESCE(
        SUM(
          CASE
            WHEN isWatched = 1 THEN 1
            ELSE 0
          END
        ),
        0
      ) AS watchedEpisodes
    FROM TvEpisodes
    WHERE tv_id = ?
    `,
    [tvId],
  );

  const totalEpisodes = result?.totalEpisodes ?? 0;
  const watchedEpisodes = result?.watchedEpisodes ?? 0;

  return {
    totalEpisodes,
    watchedEpisodes,
    percentage:
      totalEpisodes === 0
        ? 0
        : Math.round((watchedEpisodes / totalEpisodes) * 100),
  };
};
export const getSeasonProgress = async (
  tvId: number,
  seasonNumber: number,
): Promise<SeasonProgress> => {
  if (Platform.OS === "web") {
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
  }

  const database = getDB();

  const result = await database.getFirstAsync<{
    totalEpisodes: number;
    watchedEpisodes: number;
  }>(
    `
    SELECT
      COUNT(*) AS totalEpisodes,
      COALESCE(
        SUM(
          CASE
            WHEN isWatched = 1 THEN 1
            ELSE 0
          END
        ),
        0
      ) AS watchedEpisodes
    FROM TvEpisodes
    WHERE tv_id = ?
      AND season_number = ?
    `,
    [tvId, seasonNumber],
  );

  const totalEpisodes = result?.totalEpisodes ?? 0;
  const watchedEpisodes = result?.watchedEpisodes ?? 0;

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
