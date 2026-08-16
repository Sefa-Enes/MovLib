# MovLib — AI Agent Project Context

## Project overview

MovLib is a React Native + Expo Router personal media tracking application for movies, TV shows, anime, and similar content. It started as a personal alternative to TV Time.

TMDB is used for catalog data and metadata. User-owned data must remain local: watchlist membership, watched status, episode progress, watch timestamps, favorites, rewatch count, and future user notes/ratings.

## Main goals

- Discover movies and TV shows
- Search and filter TMDB content
- Open movie and TV detail pages
- Add/remove movies and shows from a local watchlist
- Track movie watched status
- Track TV shows by season and episode
- Mark aired episodes as watched/unwatched
- Show season and overall TV progress
- Import TV Time JSON data
- Later support CSV as a complementary import source
- Work on native and web platforms

## Technology

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- NativeWind / Tailwind
- lucide-react-native
- TMDB API
- Native: expo-sqlite
- Web: localStorage

Known versions:

```text
expo 54.0.36
expo-router 6.0.24
babel-preset-expo 54.0.12
```

## Project tree

```text
app/
├── _layout.tsx
├── globals.css
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── search.tsx
│   ├── library.tsx
│   └── profile.tsx
├── movies/
│   └── [id].tsx
└── tv/
    └── [id].tsx

components/
├── CategoryClickable.tsx
├── ContentCard.tsx
├── FilterModal.tsx
├── GridList.tsx
├── SearchBox.tsx
├── SideScrollList.tsx
├── VideoPlayer.tsx
├── Page/
│   └── DetailsPage.tsx
├── Episodes/
│   ├── EpisodeRow.tsx
│   └── SeasonEpisodeList.tsx
└── ui/
    ├── Divider.tsx
    ├── ExpandableView.tsx
    └── SegmentedButton.tsx

constants/Genre.ts
context/GlobalContext.tsx

db/
├── database.ts
├── database.native.ts
└── database.web.ts

helpers/
├── GeneralHelpers.ts
├── databaseHelper.ts
├── databaseHelper.native.ts
└── databaseHelper.web.ts

hooks/
├── useChoseFetch.ts
└── useFetch.ts

interface/interfaces.d.ts
services/api.ts
utils/
├── episodeHelpers.ts
└── queryBuilder.ts
```

## Routes

```text
app/(tabs)/index.tsx     → Home
app/(tabs)/search.tsx    → Search
app/(tabs)/library.tsx   → Library
app/(tabs)/profile.tsx   → Profile
app/movies/[id].tsx      → Movie details
app/tv/[id].tsx          → TV details
```

`app/(tabs)/_layout.tsx` owns the bottom tab navigation. The screen content is implemented in the corresponding route files.

## Platform storage

Native uses SQLite through:

```text
db/database.native.ts
```

Web uses localStorage through:

```text
db/database.web.ts
```

There is also a platform-agnostic helper:

```text
helpers/databaseHelper.ts
```

Important: Expo/Metro may resolve this import to the platform-specific file:

```ts
import { getEpisodesBySeason } from "@/helpers/databaseHelper";
```

Therefore all exported episode functions must exist in the helper file actually selected by the platform:

```text
helpers/databaseHelper.web.ts
helpers/databaseHelper.native.ts
```

Otherwise runtime errors such as `upsertTvEpisodes is not a function` can occur.

## Global context

`context/GlobalContext.tsx` stores:

```ts
mediaObject: MediaItem | undefined
filters: DiscoverMovieFilters | undefined
```

A card usually passes a summary object to the detail route. A summary TV object may not contain seasons. The detail API result must be preferred for TV details:

```tsx
<DetailsPage
  mediaObject={data || mediaObject}
  detailData={data}
  contentType="tv"
  ...
/>
```

Do not skip the TV detail request merely because `mediaObject` already exists. The card object may only be a summary.

## TMDB API

Base URL:

```text
https://api.themoviedb.org/3
```

Environment variable:

```env
EXPO_PUBLIC_MOVIE_API_KEY=YOUR_KEY
```

Important endpoints:

```text
/discover/movie
/search/movie
/movie/{movie_id}?language=en-US
/discover/tv
/search/tv
/tv/{tv_id}?language=en-US
/{movie|tv}/{id}/similar?language=en-US&page=1
/company/{company_id}
/tv/{tv_id}/season/{season_number}?language=en-US
```

The season endpoint is called by `fetchTvSeasonEpisodes`. It requires a TMDB TV ID, not a TVDB or IMDb ID.

Episode fields used by the app:

```ts
id
episode_number
season_number
name
overview
air_date
still_path
vote_average
vote_count
```

## Type rules

Important types live in `interface/interfaces.d.ts`:

```text
BaseContent
Movie
Tv
TvSeason
TvEpisode
WatchedTvEpisode
MediaItem
UnitedWithDb
Company
```

Do not model details with `Movie & Tv`; that requires movie and TV-only fields at the same time and causes TypeScript errors. `MediaItem` should be a flexible detail type with optional movie/TV-specific fields.

## TV tracking rules

Movies may have a single watched state:

```text
movie → watched / not watched
```

TV shows must not have a single show-level Watched button. TV tracking is episode based:

```text
show
 └── seasons
      └── episodes
           ├── isWatched
           ├── watched_at
           └── rewatch_count
```

Movie cards/details may show Watched. TV cards/details should show watchlist membership and season/episode progress only.

## Episode components

`components/Episodes/EpisodeRow.tsx` renders one episode:

- still preview image
- watched check
- episode title
- air date
- Not Released label
- disabled interaction for unaired episodes

Preview URL:

```ts
https://image.tmdb.org/t/p/w300${episode.still_path}
```

`components/Episodes/SeasonEpisodeList.tsx` renders season accordion rows and delegates individual rows to `EpisodeRow`.

A collapsed season should still show:

```text
✓ Season 1
8/8 aired watched
Completed
progress bar
```

The season circle is clickable. It must load the season episodes first if they are not loaded, then mark only aired episodes.

## Aired episode rules

TMDB generally provides `air_date`, not a reliable boolean `is_aired` field. Use `utils/episodeHelpers.ts`:

```ts
export const isEpisodeAired = (airDate: string | null): boolean => {
  if (!airDate) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(`${airDate}T00:00:00`) <= today;
};
```

Unaired episodes:

- cannot be toggled
- show `Not Released`
- are skipped by Mark Season Watched
- should not reduce aired progress

## Responsive tab navigation

`app/(tabs)/_layout.tsx` owns the bottom bar. Use equal-width flex items:

```tsx
tabBarItemStyle: {
  flex: 1,
  height: "100%",
  margin: 0,
  padding: 0,
}
```

To make the selected tab fill its entire slot, use:

```tsx
tabBarIconStyle: {
  width: "100%",
  height: "100%",
  margin: 0,
  padding: 0,
}
```

Avoid `width: "100%"` on every item, `margin: 10`, and fixed active widths such as `w-28`.

## Theme

Current neon-blue palette:

```js
colors: {
  primary: "#00BFFF",
  secondary: "#16324F",
  accent: "#E6F7FF",
  dark: {
    100: "#102A43",
    200: "#050B14",
  },
}
```

Also check `components/colors.tsx`, because the tab bar reads colors from that file rather than directly from Tailwind.

## AI agent rules

1. Read the target file before editing it.
2. Check `.native.ts` and `.web.ts` resolution.
3. Keep native and web helper exports consistent.
4. Never overwrite user-owned watched fields during metadata refresh.
5. Do not add show-level watched logic for TV.
6. Distinguish TMDB, TVDB, and IMDb IDs.
7. Do not mark future episodes watched.
8. Use one shared `ensureSeasonEpisodes` flow instead of duplicating season fetch logic.
9. Remove unused imports and state after refactoring.
10. Test TypeScript before Expo bundling.

## Test commands

```powershell
npx tsc --noEmit
npx expo start -c
```

Test flow:

1. Open a TV detail route.
2. Confirm `/tv/{id}` is requested.
3. Open a season and confirm `/tv/{id}/season/{season}` is requested.
4. Toggle an aired episode.
5. Confirm an unaired episode cannot be toggled.
6. Press the collapsed season circle.
7. Confirm the season fetches and marks aired episodes.
8. Reload and confirm local state persists.
