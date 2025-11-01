// import { serializeGenres } from "@/helpers/GeneralHelpers";
// import { Movie } from "@/interface/interfaces";
// import * as SQLite from "expo-sqlite";

// const db = SQLite.openDatabaseSync("mydb.db");

// export const initDB = async () => {
//   try {
//     await db.execAsync(`
//       CREATE TABLE IF NOT EXISTS MovieWL (
//         id INTEGER PRIMARY KEY,            -- TMDB id (her zaman integer)
//         title TEXT NOT NULL,               -- TMDB'deki 'title'
//         poster_path TEXT,                  -- TMDB'deki 'poster_path'
//         genre_ids TEXT,                  -- TMDB'deki 'genre_ids'
//         release_date TEXT,                 -- TMDB'deki 'release_date' (ISO date string)
//         vote_average REAL,                 -- TMDB'deki 'vote_average' (float)
//         isWatched INTEGER DEFAULT 0        -- senin özel alanın (0 = false, 1 = true)
//       );
//     `);

//     console.log("✅ Movies table created successfully");
//   } catch (error) {
//     console.error("❌ Error creating movies table:", error);
//   }
// };

// export const insertMovie = async (movie: Movie, isWatched: boolean) => {
//   try {
//     await db.runAsync(
//       `
//       INSERT OR REPLACE INTO movies
//       (id, title,  poster_path,genre_ids,  release_date, vote_average,   isWatched)
//       VALUES (?, ?, ?, ?,?, ?, ?);
//       `,
//       [
//         movie.id,
//         movie.title,
//         movie.poster_path,
//         serializeGenres(movie.genre_ids),
//         movie.release_date,
//         movie.vote_average,
//         isWatched ? 1 : 0,
//       ]
//     );
//     console.log(`✅ Movie inserted: ${movie.title}`);
//   } catch (error) {
//     console.error("❌ Insert movie error:", error);
//   }
// };

// export const getAllMovies = async () => {
//   try {
//     const rows = await db.getAllAsync("SELECT * FROM movies");
//     return rows;
//   } catch (error) {
//     console.error("❌ Query movies error:", error);
//   }
// };

// export const getWatchedMovies = async () => {
//   try {
//     const rows = await db.getAllAsync(
//       "SELECT * FROM movies WHERE isWatched = 1"
//     );
//     return rows;
//   } catch (error) {
//     console.error("❌ Query watched movies error:", error);
//   }
// };

// export const toggleWatched = async (id: number, watched: boolean) => {
//   try {
//     await db.runAsync("UPDATE movies SET isWatched = ? WHERE id = ?", [
//       watched ? 1 : 0,
//       id,
//     ]);
//     console.log(`🔁 Movie ${id} isWatched = ${watched}`);
//   } catch (error) {
//     console.error("❌ Toggle watched error:", error);
//   }
// };import { MovieGenreId, TvGenreId } from "@/constants/Genre";

import { Platform } from "react-native";

// Type import (doesn't cause runtime errors)
import { MovieGenreId, TvGenreId } from "@/constants/Genre";
import type { SQLiteDatabase } from "expo-sqlite";

// SQLite sadece native platformlarda import edilir
let SQLite: any = null;
let dbInstance: SQLiteDatabase | null = null;

if (Platform.OS !== "web") {
  // Dynamic import - only loaded on native platforms
  SQLite = require("expo-sqlite");
  dbInstance = SQLite.openDatabaseSync("mydb.db");
}

export const db = dbInstance;

export const initDB = async () => {
  if (Platform.OS === "web") {
    // Web için initialization gerekmez, localStorage otomatik hazır
    console.log("✅ Web storage ready");
    return;
  }

  // Native platformlar için SQLite
  if (!dbInstance) {
    throw new Error("Database instance not available");
  }

  try {
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS MovieWL (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        poster_path TEXT,
        release_date TEXT,
        vote_average REAL,
        isWatched INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS GenresMovie (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS MovieGenre (
        movie_id INTEGER,
        genre_id INTEGER,
        PRIMARY KEY (movie_id, genre_id),
        FOREIGN KEY (movie_id) REFERENCES MovieWL(id) ON DELETE CASCADE,
        FOREIGN KEY (genre_id) REFERENCES GenresMovie(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS TvWL (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        poster_path TEXT,
        first_air_date TEXT,
        vote_average REAL,
        isWatched INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS GenresTv (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS TvGenre (
        tv_id INTEGER,
        genre_id INTEGER,
        PRIMARY KEY (tv_id, genre_id),
        FOREIGN KEY (tv_id) REFERENCES TvWL(id) ON DELETE CASCADE,
        FOREIGN KEY (genre_id) REFERENCES GenresTv(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ All tables created successfully");

    // Genre tablolarını populate et
    await seedGenres();
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

const seedGenres = async () => {
  if (Platform.OS === "web" || !dbInstance) return;

  try {
    // Movie genres
    for (const [id, name] of Object.entries(MovieGenreId)) {
      await dbInstance.runAsync(
        `INSERT OR IGNORE INTO GenresMovie (id, name) VALUES (?, ?)`,
        [Number(id), name]
      );
    }

    // TV genres
    for (const [id, name] of Object.entries(TvGenreId)) {
      await dbInstance.runAsync(
        `INSERT OR IGNORE INTO GenresTv (id, name) VALUES (?, ?)`,
        [Number(id), name]
      );
    }

    console.log("✅ Genre tables populated successfully");
  } catch (error) {
    console.error("❌ Error seeding genres:", error);
  }
};
