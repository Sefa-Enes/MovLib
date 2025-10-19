import { db } from "@/db/database";
import { Movie, Tv } from "@/interface/interfaces";

export const insertMovieWithGenres = async (
  movie: Movie,
  isWatched: boolean = false
) => {
  try {
    // Use withTransactionAsync for proper transaction handling
    await db.withTransactionAsync(async () => {
      // Insert the movie
      await db.runAsync(
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

      // Delete existing genre associations (for update case)
      await db.runAsync(`DELETE FROM MovieGenre WHERE movie_id = ?`, [
        movie.id,
      ]);

      // Insert genre associations if genre_ids exist
      if (movie.genre_ids && movie.genre_ids.length > 0) {
        for (const genreId of movie.genre_ids) {
          await db.runAsync(
            `INSERT INTO MovieGenre (movie_id, genre_id) VALUES (?, ?)`,
            [movie.id, genreId]
          );
        }
      }
    });

    console.log(`✅ Movie inserted with genres: ${movie.title}`);
  } catch (error) {
    console.error("❌ Insert movie with genres error:", error);
    throw error; // Re-throw to handle in calling code
  }
};

export const insertTvWithGenres = async (
  tv: Tv,
  isWatched: boolean = false
) => {
  try {
    await db.withTransactionAsync(async () => {
      // Insert the TV show
      await db.runAsync(
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

      // Delete existing genre associations (for update case)
      await db.runAsync(`DELETE FROM TvGenre WHERE tv_id = ?`, [tv.id]);

      // Insert genre associations if genre_ids exist
      if (tv.genre_ids && tv.genre_ids.length > 0) {
        for (const genreId of tv.genre_ids) {
          await db.runAsync(
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
};

export const getAllMoviesWithGenres = async (onlyWatched: boolean = false) => {
  try {
    const whereClause = onlyWatched ? "WHERE m.isWatched = 1" : "";

    const movies = await db.getAllAsync<{
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

    // Transform the results to match your interface
    return movies.map((movie) => ({
      ...movie,
      isWatched: movie.isWatched === 1,
      genre_ids: movie.genre_ids ? movie.genre_ids.split(",").map(Number) : [],
      genre_names: movie.genre_names ? movie.genre_names.split(",") : [],
    }));
  } catch (error) {
    console.error("❌ Get movies with genres error:", error);
    return [];
  }
};
export const getMoviesWithGenres = async (onlyWatched: boolean = false) => {
  try {
    const whereClause = onlyWatched ? "WHERE m.isWatched = 1" : "";

    const movies = await db.getAllAsync<{
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

    // Transform the results to match your interface
    return movies.map((movie) => ({
      ...movie,
      isWatched: movie.isWatched === 1,
      genre_ids: movie.genre_ids ? movie.genre_ids.split(",").map(Number) : [],
      genre_names: movie.genre_names ? movie.genre_names.split(",") : [],
    }));
  } catch (error) {
    console.error("❌ Get movies with genres error:", error);
    return [];
  }
};

export const getTvShowsWithGenres = async (onlyWatched: boolean = false) => {
  try {
    const whereClause = onlyWatched ? "WHERE t.isWatched = 1" : "";

    const tvShows = await db.getAllAsync<{
      id: number;
      name: string;
      poster_path: string | null;
      first_air_date: string | null;
      vote_average: number;
      isWatched: number;
      genre_ids: string | null;
      genre_names: string | null;
    }>(`
      SELECT 
        t.*,
        GROUP_CONCAT(tg.genre_id) as genre_ids,
        GROUP_CONCAT(g.name) as genre_names
      FROM TvWL t
      LEFT JOIN TvGenre tg ON t.id = tg.tv_id
      LEFT JOIN GenresTv g ON tg.genre_id = g.id
      ${whereClause}
      GROUP BY t.id
    `);

    // Transform the results
    return tvShows.map((tv) => ({
      ...tv,
      isWatched: tv.isWatched === 1,
      genre_ids: tv.genre_ids ? tv.genre_ids.split(",").map(Number) : [],
      genre_names: tv.genre_names ? tv.genre_names.split(",") : [],
    }));
  } catch (error) {
    console.error("❌ Get TV shows with genres error:", error);
    return [];
  }
};

export const toggleMovieWatched = async (id: number, watched: boolean) => {
  try {
    await db.runAsync("UPDATE MovieWL SET isWatched = ? WHERE id = ?", [
      watched ? 1 : 0,
      id,
    ]);
    console.log(`🔁 Movie ${id} isWatched = ${watched}`);
  } catch (error) {
    console.error("❌ Toggle movie watched error:", error);
    throw error;
  }
};

export const toggleTvWatched = async (id: number, watched: boolean) => {
  try {
    await db.runAsync("UPDATE TvWL SET isWatched = ? WHERE id = ?", [
      watched ? 1 : 0,
      id,
    ]);
    console.log(`🔁 TV show ${id} isWatched = ${watched}`);
  } catch (error) {
    console.error("❌ Toggle TV watched error:", error);
    throw error;
  }
};

export const deleteMovie = async (id: number) => {
  try {
    await db.runAsync("DELETE FROM MovieWL WHERE id = ?", [id]);
    console.log(`🗑️ Movie ${id} deleted`);
  } catch (error) {
    console.error("❌ Delete movie error:", error);
    throw error;
  }
};

export const deleteTvShow = async (id: number) => {
  try {
    await db.runAsync("DELETE FROM TvWL WHERE id = ?", [id]);
    console.log(`🗑️ TV show ${id} deleted`);
  } catch (error) {
    console.error("❌ Delete TV show error:", error);
    throw error;
  }
};

export const getMovieById = async (id: number) => {
  try {
    const dbMovie = await db.getFirstAsync<{
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
};

export const getTvShowById = async (id: number) => {
  try {
    const tvShow = await db.getFirstAsync<{
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
};
