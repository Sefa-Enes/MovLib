// config/settings.ts
import { initApiUrl } from "@/services/api"; // api.ts dosyanızın gerçek yolunu yazın
import twColors from "tailwindcss/colors";
import { createPersistedSetting } from "./persistedSettings";

// Yeni ayar eklenince sadece bu listeye ekleyin.
export const initSettings = async (): Promise<void> => {
  await Promise.all([initApiUrl(), tvFadeOpacitySetting.init()]);
};

const COLOR_NAMES = [
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;
type ColorName = (typeof COLOR_NAMES)[number];

export const COLOR_OPTIONS = COLOR_NAMES.map((n) => ({
  value: n,
  label: n.charAt(0).toUpperCase() + n.slice(1),
  color: twColors[n][500],
}));

const normalizeColor = (input: string): string | null =>
  (COLOR_NAMES as readonly string[]).includes(input) ? input : null;

//_ Library Tv Opacity
export const tvFadeOpacitySetting = createPersistedSetting({
  storageKey: "dim_tv_ratio_override",
  defaultValue: "0.8",
  normalize: (input) => {
    // Bazı klavyeler ondalık ayraç olarak virgül gönderir.
    const n = Number(input.trim().replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= 1 ? String(n) : null;
  },
});

export const getTvFadeOpacity = (): number =>
  Number(tvFadeOpacitySetting.get());

//_ Library Movie Opacity
export const movieFadeOpacitySetting = createPersistedSetting({
  storageKey: "dim_movie_ratio_override",
  defaultValue: "0.5",
  normalize: (input) => {
    // Bazı klavyeler ondalık ayraç olarak virgül gönderir.
    const n = Number(input.trim().replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= 1 ? String(n) : null;
  },
});

export const getMovieFadeOpacity = (): number =>
  Number(movieFadeOpacitySetting.get());

//_ Not Library Soft Fade Opacity
export const softFadeOpacitySetting = createPersistedSetting({
  storageKey: "dim_movie_ratio_override",
  defaultValue: "0.2",
  normalize: (input) => {
    // Bazı klavyeler ondalık ayraç olarak virgül gönderir.
    const n = Number(input.trim().replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= 1 ? String(n) : null;
  },
});

export const getSoftFadeOpacity = (): number =>
  Number(softFadeOpacitySetting.get());

// //_ Watched Movie Color
// export const watchedMovieColorSetting = createPersistedSetting({
//   storageKey: "color_watched_movie",
//   defaultValue: "purple",
//   normalize: normalizeColor,
// });
// export const getMovieWatchedColor = (): string =>
//   twColors[watchedMovieColorSetting.get() as ColorName][500];

// //_ In Watchlist Movie color Not Applied id Library
// export const inLibraryMovieColorSetting = createPersistedSetting({
//   storageKey: "color_in_watchlist_Movie",
//   defaultValue: "yellow",
//   normalize: normalizeColor,
// });
// export const getMovieInLibraryColor = (): string =>
//   twColors[inLibraryMovieColorSetting.get() as ColorName][500];

// //_ In Watchlist TV color Not Applied id Library
// export const inWatchListTvColorSetting = createPersistedSetting({
//   storageKey: "color_in_watchlist_tv",
//   defaultValue: "yellow",
//   normalize: normalizeColor,
// });
// export const getTvInLibraryColor = (): string =>
//   twColors[inWatchListTvColorSetting.get() as ColorName][500];

// //_ In Production TV color
// export const inProductionTvColorSetting = createPersistedSetting({
//   storageKey: "color_in_production_tv",
//   defaultValue: "blue",
//   normalize: normalizeColor,
// });
// export const getTvInProductionColor = (): string =>
//   twColors[inProductionTvColorSetting.get() as ColorName][500];

// //_ Ended TV color
// export const endedTvColorSetting = createPersistedSetting({
//   storageKey: "color_ended_tv",
//   defaultValue: "purple",
//   normalize: normalizeColor,
// });
// export const getTvEndedColor = (): string =>
//   twColors[endedTvColorSetting.get() as ColorName][500];

// //_ Cancelled TV color
// export const canceledTvColorSetting = createPersistedSetting({
//   storageKey: "color_canceled_tv",
//   defaultValue: "rose",
//   normalize: normalizeColor,
// });
// export const getTvCandeledColor = (): string =>
//   twColors[canceledTvColorSetting.get() as ColorName][500];

// //_ Returning (StillWatching) TV color
// export const returningTvColorSetting = createPersistedSetting({
//   storageKey: "color_returning_tv",
//   defaultValue: "yellow",
//   normalize: normalizeColor,
// });
// export const getTvReturningColor = (): string =>
//   twColors[returningTvColorSetting.get() as ColorName][500];

const colorEntry = (
  storageKey: string,
  label: string,
  defaultColor: ColorName,
) => {
  const setting = createPersistedSetting({
    storageKey,
    defaultValue: defaultColor,
    normalize: normalizeColor,
  });
  return {
    label, // Ayar sayfasında gösterilir
    setting,
    get: (): string => twColors[setting.get() as ColorName][500],
  };
};

export const colorSettings = {
  watchedMovie: colorEntry(
    "color_watched_movie",
    "Watched movie color",
    "purple",
  ),
  inWatchlistMovie: colorEntry(
    "color_in_watchlist_Movie",
    "Movie in watchlist color",
    "yellow",
  ),
  inWatchlistTv: colorEntry(
    "color_in_watchlist_tv",
    "TV in watchlist color",
    "yellow",
  ),
  inProductionTv: colorEntry(
    "color_in_production_tv",
    "In production TV color",
    "blue",
  ),
  endedTv: colorEntry("color_ended_tv", "Ended TV color", "purple"),
  canceledTv: colorEntry("color_canceled_tv", "Canceled TV color", "rose"),
  returningTv: colorEntry("color_returning_tv", "Returning TV color", "yellow"),
};
