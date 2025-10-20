import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import SegmentedControl from "@/components/ui/SegmentedButton";
import {
  getAllMoviesWithGenres,
  getTvShowsWithGenres,
} from "@/helpers/databaseHelper";
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

  return (
    <View className="flex-1 bg-dark-200">
      <Image
        source={require("@/assets/images/bg_image.png")}
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
          <Text className="text-lg text-accent font-bold mb-2">Watchlist</Text>

          <GridList
            contentType={contentType}
            data={WlData}
            loading={WlLoading}
            error={WlError}
          />
        </View>
      </ScrollView>
    </View>
  );
}
