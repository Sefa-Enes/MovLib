import { MovieGenreId, TvGenreId } from "@/constants/Genre";
import * as SQLite from "expo-sqlite";

// Native platforms: Use SQLite
const dbInstance = SQLite.openDatabaseSync("mydb.db");

export const db = dbInstance;

export const initDB = async () => {
  try {
    await dbInstance.execAsync(`
        PRAGMA foreign_keys = ON;

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
      CREATE TABLE IF NOT EXISTS TvEpisodes (
        id INTEGER PRIMARY KEY,
        tv_id INTEGER NOT NULL,
        season_number INTEGER NOT NULL,
        episode_number INTEGER NOT NULL,
        name TEXT NOT NULL,
        overview TEXT,
        air_date TEXT,
        still_path TEXT,
        tmdb_episode_id INTEGER,
        isWatched INTEGER DEFAULT 0,
        watched_at TEXT,
        rewatch_count INTEGER DEFAULT 0,

        UNIQUE (tv_id, season_number, episode_number),
        FOREIGN KEY (tv_id) REFERENCES TvWL(id) ON DELETE CASCADE
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
  try {
    // Movie genres
    for (const [id, name] of Object.entries(MovieGenreId)) {
      await dbInstance.runAsync(
        `INSERT OR IGNORE INTO GenresMovie (id, name) VALUES (?, ?)`,
        [Number(id), name],
      );
    }

    // TV genres
    for (const [id, name] of Object.entries(TvGenreId)) {
      await dbInstance.runAsync(
        `INSERT OR IGNORE INTO GenresTv (id, name) VALUES (?, ?)`,
        [Number(id), name],
      );
    }

    console.log("✅ Genre tables populated successfully");
  } catch (error) {
    console.error("❌ Error seeding genres:", error);
  }
};
