import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("mydb.db");

export const initDB = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS MovieWL (
        id INTEGER PRIMARY KEY,            -- TMDB id (her zaman integer)
        title TEXT NOT NULL,               -- TMDB'deki 'title'
        poster_path TEXT,                  -- TMDB'deki 'poster_path'
        release_date TEXT,                 -- TMDB'deki 'release_date' (ISO date string)
        vote_average REAL,                 -- TMDB'deki 'vote_average' (float)
        isWatched INTEGER DEFAULT 0        -- senin özel alanın (0 = false, 1 = true)
      );
    `);

    console.log("✅ Movies table created successfully");
  } catch (error) {
    console.error("❌ Error creating movies table:", error);
  }
};

export const insertMovie = async (movie: any) => {
  try {
    await db.runAsync(
      `
      INSERT OR REPLACE INTO movies
      (id, title,  poster_path,  release_date, vote_average,   isWatched)
      VALUES (?, ?, ?, ?, ?, ?);
      `,
      [
        movie.id,
        movie.title,
        movie.poster_path,
        movie.release_date,
        movie.vote_average,
        movie.isWatched ? 1 : 0,
      ]
    );
    console.log(`✅ Movie inserted: ${movie.title}`);
  } catch (error) {
    console.error("❌ Insert movie error:", error);
  }
};

export const getAllMovies = async () => {
  try {
    const rows = await db.getAllAsync("SELECT * FROM movies");
    return rows;
  } catch (error) {
    console.error("❌ Query movies error:", error);
  }
};

export const getWatchedMovies = async () => {
  try {
    const rows = await db.getAllAsync(
      "SELECT * FROM movies WHERE isWatched = 1"
    );
    return rows;
  } catch (error) {
    console.error("❌ Query watched movies error:", error);
  }
};

export const toggleWatched = async (id: number, watched: boolean) => {
  try {
    await db.runAsync("UPDATE movies SET isWatched = ? WHERE id = ?", [
      watched ? 1 : 0,
      id,
    ]);
    console.log(`🔁 Movie ${id} isWatched = ${watched}`);
  } catch (error) {
    console.error("❌ Toggle watched error:", error);
  }
};
