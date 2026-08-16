# MovLib — AI Change Protocol

## Before editing code

1. Read the current target file.
2. Check whether Expo resolves `.native.ts`, `.web.ts`, or plain `.ts`.
3. Inspect the existing public helper exports.
4. Compare API response types with database types.
5. Preserve user-owned fields during metadata refresh.

## Rules

- Do not use `Movie & Tv` as the general detail type.
- Keep movie watched state separate from TV episode tracking.
- Do not add a show-level Watched button for TV shows.
- Always distinguish TMDB, TVDB, and IMDb IDs.
- Use `air_date` to determine whether an episode has aired.
- Future or unknown-date episodes must not be marked watched.
- Use one `ensureSeasonEpisodes` function for both season expansion and collapsed-season actions.
- Do not duplicate episode functions across files without matching exports.
- Keep web and native helper APIs identical.
- Remove unused imports, state variables, and abandoned handlers.
- Do not overwrite `isWatched`, `watched_at`, or `rewatch_count` during TMDB upserts.
- Keep responsive layouts based on flex sizing rather than fixed widths.

## Testing

TypeScript check:

```powershell
npx tsc --noEmit
```

Start with a clean Metro cache:

```powershell
npx expo start -c
```

## TV episode test checklist

- TV detail request is made even when a summary `mediaObject` already exists.
- `detailData.seasons` is used for season rendering.
- Opening a season calls `/tv/{id}/season/{season}`.
- Season data is stored locally.
- Previously watched episodes remain watched after upsert.
- The collapsed season indicator reads local progress.
- Pressing the collapsed season circle fetches episodes if needed.
- Mark Season Watched affects aired episodes only.
- Future episodes show `Not Released` and are disabled.
- Episode still images are rendered when `still_path` exists.
- Web uses `tv_episodes` localStorage.
- Native uses `TvEpisodes` SQLite table.

## UI test checklist

- Movie cards may show Watched.
- TV cards must not show a show-level Watched button.
- Movie details may show Watched.
- TV details show watchlist and episode progress instead.
- Selected tab fills its tab slot.
- Tab items use equal flex widths.
- No fixed `width: "100%"` on every tab item.
- No excessive tab item margins.
