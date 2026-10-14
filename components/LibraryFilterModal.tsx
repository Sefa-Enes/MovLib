// components/LibraryFilterModal.tsx
import { colors } from "@/components/colors";
import {
  TmdbGenre,
  VOTE_MAX,
  VOTE_MIN,
  YEAR_MAX,
  YEAR_MIN,
} from "@/constants/Genre";
import {
  LibraryFilters,
  defaultLibraryFilters,
  hasActiveLibraryFilters,
} from "@/helpers/libraryFilter";
import { LibrarySortKey } from "@/helpers/librarySort";
import useFetch from "@/hooks/useFetch";
import { fetchGenres } from "@/services/api";
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

interface Props {
  contentType: "movie" | "tv";
  filters: LibraryFilters;
  setFilters: (f: LibraryFilters) => void;
}

const SORT_OPTIONS: { key: LibrarySortKey; label: string }[] = [
  { key: "dateAdded", label: "Date added" },
  { key: "isWatched", label: "Watched" },
  { key: "watchedDate", label: "Watched date" },
  { key: "category", label: "Category" },
  { key: "year", label: "Year" },
  { key: "rating", label: "Rating" },
  { key: "title", label: "Title" },
];

const chip = (active: boolean) =>
  `px-3 py-2 rounded-full border ${
    active ? "bg-primary border-primary" : "bg-dark-200 border-dark-100"
  }`;

export const LibraryFilterModal = ({
  contentType,
  filters,
  setFilters,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LibraryFilters>(filters);

  const {
    data: genres,
    loading: genresLoading,
    error: genresError,
  } = useFetch<TmdbGenre[]>(fetchGenres, true);

  const openModal = () => {
    setDraft(filters); // seed from the applied filters of the current type
    setOpen(true);
  };

  // 3-state genre toggle: neutral -> include -> exclude -> neutral
  const toggleGenre = (id: number) =>
    setDraft((d) => {
      if (d.include.includes(id))
        return {
          ...d,
          include: d.include.filter((g) => g !== id),
          exclude: [...d.exclude, id],
        };
      if (d.exclude.includes(id))
        return { ...d, exclude: d.exclude.filter((g) => g !== id) };
      return { ...d, include: [...d.include, id] };
    });

  const apply = () => {
    setFilters(draft);
    setOpen(false);
  };

  const watchedLabel =
    contentType === "tv"
      ? { watched: "Started", unwatched: "Not started" }
      : { watched: "Watched", unwatched: "Not watched" };

  return (
    <View>
      <TouchableOpacity
        onPress={openModal}
        className="w-12 h-12 rounded-full bg-primary items-center justify-center"
      >
        <Filter size={18} color="white" />
        {hasActiveLibraryFilters(filters) && (
          <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent border-2 border-dark-200" />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 bg-dark-100">
          <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-dark-200">
            <Text className="text-white text-lg font-bold">
              Library · {contentType === "movie" ? "Movie" : "TV"}
            </Text>
            <TouchableOpacity onPress={() => setOpen(false)} className="p-1">
              <X color="white" size={24} />
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
              {SORT_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.key}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      sortKey: d.sortKey === o.key ? undefined : o.key,
                    }))
                  }
                  className={chip(draft.sortKey === o.key)}
                >
                  <Text className="text-white text-xs font-semibold">
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-2 mt-2">
              {(["asc", "desc"] as const).map((dir) => (
                <TouchableOpacity
                  key={dir}
                  onPress={() => setDraft((d) => ({ ...d, sortDir: dir }))}
                  className={chip(draft.sortDir === dir)}
                >
                  <Text className="text-white text-xs font-semibold">
                    {dir === "asc" ? "Ascending" : "Descending"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Watched + favorite */}
            <Text className="text-white text-sm font-semibold mt-6 mb-2">
              Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {(["all", "watched", "unwatched"] as const).map((w) => (
                <TouchableOpacity
                  key={w}
                  onPress={() => setDraft((d) => ({ ...d, watched: w }))}
                  className={chip(draft.watched === w)}
                >
                  <Text className="text-white text-xs font-semibold">
                    {w === "all" ? "All" : watchedLabel[w]}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() =>
                  setDraft((d) => ({ ...d, favoritesOnly: !d.favoritesOnly }))
                }
                className={chip(draft.favoritesOnly)}
              >
                <Text className="text-white text-xs font-semibold">
                  Favorites only
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rating */}
            <Text className="text-white text-sm font-semibold mt-6 mb-1">
              Rating (TMDB vote)
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              From {draft.voteGte.toFixed(1)} to {draft.voteLte.toFixed(1)}
            </Text>
            <View className="bg-dark-200 rounded-xl px-4 py-3">
              <Slider
                style={{ height: 32 }}
                minimumValue={VOTE_MIN}
                maximumValue={VOTE_MAX}
                step={0.5}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                value={draft.voteGte}
                onValueChange={(v) => setDraft((d) => ({ ...d, voteGte: v }))}
              />
              <Slider
                style={{ height: 32 }}
                minimumValue={VOTE_MIN}
                maximumValue={VOTE_MAX}
                step={0.5}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                value={draft.voteLte}
                onValueChange={(v) => setDraft((d) => ({ ...d, voteLte: v }))}
              />
            </View>

            {/* Genres */}
            <Text className="text-white text-sm font-semibold mt-6 mb-1">
              Categories
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              Tap: include (+) → exclude (−) → clear
            </Text>
            {genresLoading ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : genresError ? (
              <Text className="text-red-400 text-xs py-2">
                {genresError.message}
              </Text>
            ) : (
              <View className="flex-row flex-wrap gap-2 pb-1">
                {(genres ?? []).map((g) => {
                  const inc = draft.include.includes(g.id);
                  const exc = draft.exclude.includes(g.id);
                  return (
                    <TouchableOpacity
                      key={g.id}
                      onPress={() => toggleGenre(g.id)}
                      className={`px-3 py-2 rounded-full border flex-row items-center gap-x-1.5 ${
                        inc
                          ? "bg-primary border-primary"
                          : exc
                            ? "bg-red-900/60 border-red-500"
                            : "bg-dark-200 border-dark-100"
                      }`}
                    >
                      {inc && <Plus size={14} color="white" />}
                      {exc && <Minus size={14} color="white" />}
                      <Text
                        className={`text-xs font-semibold ${
                          exc ? "text-red-300" : "text-white"
                        }`}
                      >
                        {g.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Year */}
            <Text className="text-white text-sm font-semibold mt-6 mb-1">
              Year range
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              From {draft.yearGte} to {draft.yearLte}
            </Text>
            <View className="bg-dark-200 rounded-xl px-4 py-3">
              <Slider
                style={{ height: 32 }}
                minimumValue={YEAR_MIN}
                maximumValue={YEAR_MAX}
                step={1}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                value={draft.yearGte}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, yearGte: Math.round(v) }))
                }
              />
              <Slider
                style={{ height: 32 }}
                minimumValue={YEAR_MIN}
                maximumValue={YEAR_MAX}
                step={1}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.secondary}
                thumbTintColor={colors.accent}
                value={draft.yearLte}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, yearLte: Math.round(v) }))
                }
              />
            </View>

            <View className="flex-row gap-x-3 my-8">
              <TouchableOpacity
                onPress={() => setDraft(defaultLibraryFilters())}
                className="flex-1 py-3 rounded-xl bg-dark-200 border border-dark-100 items-center"
              >
                <Text className="text-white text-sm font-semibold">
                  Clear all
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={apply}
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
