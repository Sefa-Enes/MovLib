// constants/genre.ts
export interface TmdbGenre {
  id: number;
  name: string;
}

// US certifications. TMDB's discover endpoints filter by certification code
// with certification_country = US by default. include_adult exists only on
// the search endpoints, so the "adult" bucket is covered by R / NC-17 /
// TV-MA here.
export const MOVIE_CERTIFICATIONS = ["G", "PG", "PG-13", "R", "NC-17"] as const;
export const TV_CERTIFICATIONS = [
  "TV-Y",
  "TV-Y7",
  "TV-G",
  "TV-PG",
  "TV-14",
  "TV-MA",
] as const;

export const CERTIFICATION_COUNTRY = "US";

export const MOVIE_SORT_OPTIONS = [
  { key: "popularity.desc", label: "Popularity" },
  { key: "vote_average.desc", label: "Rating" },
  { key: "primary_release_date.desc", label: "Newest first" },
  { key: "primary_release_date.asc", label: "Oldest first" },
  { key: "title.asc", label: "Title A-Z" },
  { key: "revenue.desc", label: "Revenue" },
] as const;

export const TV_SORT_OPTIONS = [
  { key: "popularity.desc", label: "Popularity" },
  { key: "vote_average.desc", label: "Rating" },
  { key: "first_air_date.desc", label: "Newest first" },
  { key: "first_air_date.asc", label: "Oldest first" },
  { key: "name.asc", label: "Name A-Z" },
] as const;

export const VOTE_MIN = 0;
export const VOTE_MAX = 10;
export const YEAR_MIN = 1900;
export const YEAR_MAX = new Date().getFullYear();

export const MovieGenreId: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// 2️⃣ Genre ID'sine göre ismi döndüren yardımcı fonksiyon
export const getMovieGenreName = (id: number): string => {
  return MovieGenreId[id] || "Unknown";
};

export const getMovieGenresAsString = (ids?: number[]): string => {
  if (!ids || ids.length === 0) return "Unknown";

  return ids
    .map((id) => MovieGenreId[id])
    .filter((name): name is string => !!name) // undefined olanları at
    .join(", ");
};

// (Opsiyonel) Tüm genre listesini dizi olarak döndüren yardımcı fonksiyon
// export const getAllGenres = (): { id: number; name: string }[] => {
//   return Object.entries(MovieGenreId).map(([id, name]) => ({
//     id: Number(id),
//     name,
//   }));
// };

export const TvGenreId: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export const getTvGenreName = (id: number): string => {
  return TvGenreId[id] || "Unknown";
};

export const getTvGenresAsString = (ids?: number[]): string => {
  if (!ids || ids.length === 0) return "Unknown";

  return ids
    .map((id) => TvGenreId[id])
    .filter((name): name is string => !!name) // undefined olanları at
    .join(", ");
};
