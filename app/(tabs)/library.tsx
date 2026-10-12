import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import { LibraryFilterModal } from "@/components/LibraryFilterModal";
import SegmentedControl from "@/components/ui/SegmentedButton";
import {
  getAllMoviesWithGenres,
  getTvShowsWithGenres,
} from "@/helpers/databaseHelper";
import {
  LibraryFilters,
  applyLibraryFilters,
  defaultLibraryFilters,
} from "@/helpers/libraryFilter";
import { LibraryItem } from "@/helpers/librarySort";
import useFetch from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";

export default function LibraryScreen() {
  const router = useRouter();

  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [refreshing, setRefreshing] = useState(false);

  const dbFns = useMemo(() => {
    return contentType === "movie"
      ? { getAll: getAllMoviesWithGenres }
      : { getAll: getTvShowsWithGenres };
  }, [contentType]);
  const [filtersByType, setFiltersByType] = useState<
    Record<"movie" | "tv", LibraryFilters>
  >({ movie: defaultLibraryFilters(), tv: defaultLibraryFilters() });
  const {
    data: WlData,
    loading: WlLoading,
    error: WlError,
    refetch: refetchWl,
  } = useFetch(async () => {
    return await dbFns.getAll(false);
  }, false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWl();
    } catch (e) {
      console.error("Refetch error:", e);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWl]);

  useEffect(() => {
    refetchWl();
  }, [contentType]);
  const visibleData = useMemo(
    () =>
      WlData
        ? applyLibraryFilters(
            WlData as LibraryItem[],
            filtersByType[contentType],
          )
        : WlData,
    [WlData, filtersByType, contentType],
  );
  return (
    <View className="flex-1 bg-dark-200">
      <Image
        source={require("@/assets/images/bgimage.png")}
        className="absolute w-full z-0 opacity-15"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5 w-full mt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <SegmentedControl
          segments={[
            { key: "movie", label: "Movie" },
            { key: "tv", label: "TV" },
          ]}
          value={contentType}
          width={300}
          onChange={(key) => setContentType(key as "movie" | "tv")}
        />

        <View className="mb-20 mt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg text-accent font-bold">Watchlist</Text>
            <LibraryFilterModal
              contentType={contentType}
              filters={filtersByType[contentType]}
              setFilters={(f) =>
                setFiltersByType((prev) => ({ ...prev, [contentType]: f }))
              }
            />
          </View>

          <GridList
            contentType={contentType}
            data={visibleData}
            loading={WlLoading}
            error={WlError}
          />
        </View>
      </ScrollView>
    </View>
  );
}
