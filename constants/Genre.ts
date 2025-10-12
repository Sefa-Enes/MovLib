// constants/genre.ts

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
