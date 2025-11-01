import { db } from "@/db/database";
import { Movie, Tv } from "@/interface/interfaces";
import { Platform } from "react-native";

// Helper to get non-null db for native platforms
const getDB = () => {
  if (!db) {
    throw new Error(
      "Database not initialized - this should only be called on native platforms"
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

// ============= EXISTING FUNCTIONS - NOW PLATFORM AGNOSTIC =============

export const insertMovieWithGenres = async (
  movie: Movie,
  isWatched: boolean = false
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
          ]
        );

        await database.runAsync(`DELETE FROM MovieGenre WHERE movie_id = ?`, [
          movie.id,
        ]);

        if (movie.genre_ids && movie.genre_ids.length > 0) {
          for (const genreId of movie.genre_ids) {
            await database.runAsync(
              `INSERT INTO MovieGenre (movie_id, genre_id) VALUES (?, ?)`,
              [movie.id, genreId]
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
  isWatched: boolean = false
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
          ]
        );

        await database.runAsync(`DELETE FROM TvGenre WHERE tv_id = ?`, [tv.id]);

        if (tv.genre_ids && tv.genre_ids.length > 0) {
          for (const genreId of tv.genre_ids) {
            await database.runAsync(
              `INSERT INTO TvGenre (tv_id, genre_id) VALUES (?, ?)`,
              [tv.id, genreId]
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
        [id]
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
        [id]
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
