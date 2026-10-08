import { colors } from "@/components/colors";
import {
  CERTIFICATION_COUNTRY,
  MOVIE_CERTIFICATIONS,
  MOVIE_SORT_OPTIONS,
  TV_CERTIFICATIONS,
  TV_SORT_OPTIONS,
  TmdbGenre,
  VOTE_MAX,
  VOTE_MIN,
  YEAR_MAX,
  YEAR_MIN,
} from "@/constants/Genre";
import useFetch from "@/hooks/useFetch";
import { fetchGenres } from "@/services/api";
import { DiscoverMovieFilters, DiscoverTvFilters } from "@/utils/queryBuilder";
import Slider from "@react-native-community/slider";
import { Filter, Minus, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Filters = DiscoverMovieFilters | DiscoverTvFilters | undefined;

interface Props {
  contentType: "movie" | "tv";
  filters?: Filters;
  setFilters: (filters: Filters) => void;
}

// 3-state genre toggle, as requested: tap → include (+), tap → exclude (−),
// tap → neutral. Maps to with_genres / without_genres in the TMDB discover
// query.
type GenreState = "include" | "exclude" | "neutral";

const nextGenreState: Record<GenreState, GenreState> = {
  neutral: "include",
  include: "exclude",
  exclude: "neutral",
};

interface Draft {
  sortBy: string | undefined;
  voteGte: number; // TMDB vote_average.gte (their rating, not IMDB)
  voteLte: number; // TMDB vote_average.lte
  certification: string | undefined; // age rating (country US)
  yearGte: number; // movie: primary_release_date.gte / tv: first_air_date.gte
  yearLte: number;
  genreStates: Record<number, GenreState>;
}

const emptyDraft = (): Draft => ({
  sortBy: undefined,
  voteGte: VOTE_MIN,
  voteLte: VOTE_MAX,
  certification: undefined,
  yearGte: YEAR_MIN,
  yearLte: YEAR_MAX,
  genreStates: {},
});

const toNumArr = (
  v: string | number | (string | number)[] | undefined,
): number[] => {
  if (v === undefined) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map(Number);
};

export const FilterModal = ({ contentType, filters, setFilters }: Props) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  // Genres come from the database (GET /genres, seeded from TMDB) — one list
  // for both media types. Fetch once; the modal stays mounted for the screen
  // lifetime, so this fires once.
  const {
    data: genres,
    loading: genresLoading,
    error: genresError,
  } = useFetch<TmdbGenre[]>(fetchGenres, true);

  const certifications =
    contentType === "movie" ? MOVIE_CERTIFICATIONS : TV_CERTIFICATIONS;
  const sortOptions =
    contentType === "movie" ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS;
  const yearKey =
    contentType === "movie" ? "primary_release_date" : "first_air_date";

  // Seed the draft from the currently applied filters every time the modal
  // opens, so switching movie/tv picks up the right fields.
  const openModal = () => {
    const f = filters as DiscoverMovieFilters | DiscoverTvFilters | undefined;
    setDraft({
      sortBy: f?.sort_by ?? undefined,
      voteGte: f?.vote_average_gte ?? VOTE_MIN,
      voteLte: f?.vote_average_lte ?? VOTE_MAX,
      certification: f?.certification ?? undefined,
      yearGte: Number((f as any)?.[`${yearKey}_gte`]?.slice(0, 4)) || YEAR_MIN,
      yearLte: Number((f as any)?.[`${yearKey}_lte`]?.slice(0, 4)) || YEAR_MAX,
      genreStates: Object.fromEntries([
        ...toNumArr(f?.with_genres).map((id): [number, GenreState] => [
          id,
          "include",
        ]),
        ...toNumArr(
          Array.isArray((f as any)?.without_genres)
            ? ((f as any)?.without_genres as (string | number)[]).map(Number)
            : (f as any)?.without_genres !== undefined
              ? [Number((f as any)?.without_genres)]
              : [],
        ).map((id): [number, GenreState] => [id, "exclude"]),
      ]),
    });
    setModalOpen(true);
  };

  const toggleGenre = (id: number) => {
    setDraft((d) => {
      const current = d.genreStates[id] ?? "neutral";
      const next = nextGenreState[current];
      const genreStates = { ...d.genreStates };
      if (next === "neutral") {
        delete genreStates[id];
      } else {
        genreStates[id] = next;
      }
      return { ...d, genreStates };
    });
  };

  const applyFilters = () => {
    const inc = Object.entries(draft.genreStates)
      .filter(([, s]) => s === "include")
      .map(([id]) => Number(id));
    const exc = Object.entries(draft.genreStates)
      .filter(([, s]) => s === "exclude")
      .map(([id]) => Number(id));

    const out: {
      [key: string]: string | number | number[] | undefined;
      sort_by?: string;
      vote_average_gte?: number;
      vote_average_lte?: number;
      certification?: string;
      certification_country?: string;
      with_genres?: number[];
      without_genres?: number[];
      primary_release_date_gte?: string;
      primary_release_date_lte?: string;
      first_air_date_gte?: string;
      first_air_date_lte?: string;
    } = {};

    if (draft.sortBy) out.sort_by = draft.sortBy;
    if (draft.voteGte > VOTE_MIN) out.vote_average_gte = draft.voteGte;
    if (draft.voteLte < VOTE_MAX) out.vote_average_lte = draft.voteLte;
    if (draft.certification) {
      out.certification = draft.certification;
      out.certification_country = CERTIFICATION_COUNTRY;
    }
    if (inc.length) out.with_genres = inc;
    if (exc.length) out.without_genres = exc;
    if (draft.yearGte > YEAR_MIN)
      out[`${yearKey}.gte`] = `${draft.yearGte}-01-01`;
    if (draft.yearLte < YEAR_MAX)
      out[`${yearKey}.lte`] = `${draft.yearLte}-12-31`;

    // No active filters -> undefined so the caller sees "no filter".
    setFilters(Object.keys(out).length ? (out as Filters) : undefined);
    setModalOpen(false);
  };

  const clearAll = () => {
    setDraft(emptyDraft());
  };

  const hasActiveFilters =
    filters !== undefined && Object.keys(filters ?? {}).length > 0;

  const genreChip = (id: number, name: string) => {
    const state: GenreState = draft.genreStates[id] ?? "neutral";
    const base =
      "px-3 py-2 rounded-full border flex-row items-center gap-x-1.5";
    const style =
      state === "include"
        ? "bg-primary border-primary"
        : state === "exclude"
          ? "bg-red-900/60 border-red-500"
          : "bg-dark-200 border-dark-100";

    return (
      <TouchableOpacity
        key={id}
        onPress={() => toggleGenre(id)}
        className={`${base} ${style}`}
      >
        {state !== "neutral" && (
          <>
            {state === "include" ? (
              <Plus size={14} color="white" />
            ) : (
              <Minus size={14} color="white" />
            )}
          </>
        )}
        <Text
          className={`text-xs font-semibold ${
            state === "exclude" ? "text-red-300" : "text-white"
          }`}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="w-16 h-16">
      <TouchableOpacity
        onPress={openModal}
        className="w-16 h-16 rounded-full bg-primary items-center justify-center relative"
      >
        <Filter size={20} className="text-white" />
        {hasActiveFilters && (
          <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent border-2 border-dark-200" />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalOpen}
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View className="flex-1 bg-dark-100">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-dark-200">
            <Text className="text-white text-lg font-bold">
              Filters · {contentType === "movie" ? "Movie" : "TV"}
            </Text>
            <TouchableOpacity
              onPress={() => setModalOpen(false)}
              className="p-1"
            >
              <X className="text-white" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
          >
            {/* Sort */}
            <Text className="text-white text-sm font-semibold mt-5 mb-2">
              Sort by
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {sortOptions.map((opt) => {
                const active = draft.sortBy === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() =>
                      setDraft((d) => ({
                        ...d,
                        sortBy: active ? undefined : (opt.key as string),
                      }))
                    }
                    className={`px-3 py-2 rounded-full border ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-dark-200 border-dark-100"
                    }`}
                  >
                    <Text className="text-white text-xs font-semibold">
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Vote rating (TMDB) */}
            <Text className="text-white text-sm font-semibold mt-6 mb-1">
              Rating (TMDB vote)
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              From {draft.voteGte.toFixed(1)} to {draft.voteLte.toFixed(1)}
            </Text>
            <View className="bg-dark-200 rounded-xl px-4 py-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400 text-xs">Min</Text>
                <Text className="text-gray-400 text-xs">Max</Text>
              </View>
              <Slider
                style={{ height: 32 }}
                minimumValue={VOTE_MIN}
                maximumValue={VOTE_MAX}
                step={0.5}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                onValueChange={(v) => setDraft((d) => ({ ...d, voteGte: v }))}
                value={draft.voteGte}
              />
              <Slider
                style={{ height: 32 }}
                minimumValue={VOTE_MIN}
                maximumValue={VOTE_MAX}
                step={0.5}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                onValueChange={(v) => setDraft((d) => ({ ...d, voteLte: v }))}
                value={draft.voteLte}
              />
            </View>

            {/* Age rating / certification */}
            <Text className="text-white text-sm font-semibold mt-6 mb-2">
              Age rating
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {certifications.map((cert) => {
                const active = draft.certification === cert;
                return (
                  <TouchableOpacity
                    key={cert}
                    onPress={() =>
                      setDraft((d) => ({
                        ...d,
                        certification: active ? undefined : (cert as string),
                      }))
                    }
                    className={`px-3 py-2 rounded-full border ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-dark-200 border-dark-100"
                    }`}
                  >
                    <Text className="text-white text-xs font-semibold">
                      {cert}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text className="text-gray-400 text-xs mt-2">
              Certification country: {CERTIFICATION_COUNTRY}. R/NC-17 (movies)
              and TV-MA (TV) cover adult content.
            </Text>

            {/* Genres — 3-state */}
            <Text className="text-white text-sm font-semibold mt-6 mb-1">
              Categories
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              Tap: include (+) → exclude (−) → clear
            </Text>
            {/* {genres === undefined ? (
              <View className="flex-row items-center gap-2 py-2">
                <ActivityIndicator size="small" color={colors.accent} />
                <Text className="text-gray-400 text-xs">
                  Loading categories…
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2 pb-1">
                {genres.map((g) => genreChip(g.id, g.name))}
              </View>
            )} */}
            {genresLoading ? (
              <View className="flex-row items-center gap-2 py-2">
                <ActivityIndicator size="small" color={colors.accent} />
                <Text className="text-gray-400 text-xs">
                  Loading categories…
                </Text>
              </View>
            ) : genresError ? (
              <Text className="text-red-400 text-xs py-2">
                {genresError.message}
              </Text>
            ) : !genres?.length ? (
              <Text className="text-gray-400 text-xs py-2">
                No categories found
              </Text>
            ) : (
              <View className="flex-row flex-wrap gap-2 pb-1">
                {genres.map((g) => genreChip(g.id, g.name))}
              </View>
            )}
            {/* Year range */}
            <Text className="text-white text-sm font-semibold mt-6 mb-1">
              Year range
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              From {draft.yearGte} to {draft.yearLte}
            </Text>
            <View className="bg-dark-200 rounded-xl px-4 py-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400 text-xs">From</Text>
                <Text className="text-gray-400 text-xs">To</Text>
              </View>
              <Slider
                style={{ height: 32 }}
                minimumValue={YEAR_MIN}
                maximumValue={YEAR_MAX}
                step={1}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, yearGte: Math.round(v) }))
                }
                value={draft.yearGte}
              />
              <Slider
                style={{ height: 32 }}
                minimumValue={YEAR_MIN}
                maximumValue={YEAR_MAX}
                step={1}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, yearLte: Math.round(v) }))
                }
                value={draft.yearLte}
              />
            </View>

            {/* Actions */}
            <View className="flex-row gap-x-3 my-8">
              <TouchableOpacity
                onPress={clearAll}
                className="flex-1 py-3 rounded-xl bg-dark-200 border border-dark-100 items-center"
              >
                <Text className="text-white text-sm font-semibold">
                  Clear all
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
              >
                <Text className="text-white text-sm font-bold">Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
