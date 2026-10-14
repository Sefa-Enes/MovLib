import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import { LibraryFilterModal } from "@/components/LibraryFilterModal";
import SegmentedControl from "@/components/ui/SegmentedButton";
import { getLibraryPage } from "@/helpers/databaseHelper";
import { LibraryFilters, defaultLibraryFilters } from "@/helpers/libraryFilter";
import useInfiniteFetch from "@/hooks/useInfiniteFetch";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function LibraryScreen() {
  const router = useRouter();

  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [refreshing, setRefreshing] = useState(false);

  const [filtersByType, setFiltersByType] = useState<
    Record<"movie" | "tv", LibraryFilters>
  >({ movie: defaultLibraryFilters(), tv: defaultLibraryFilters() });
  const filters = filtersByType[contentType];

  const fetchPage = useCallback(
    (page: number) => getLibraryPage(contentType, page, filters),
    [contentType, filters],
  );

  const { data, loading, loadingMore, error, hasMore, loadMore, refetch } =
    useInfiniteFetch<any>(fetchPage, [contentType, JSON.stringify(filters)]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error("Refetch error:", e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Load the next page within ~300px of the bottom.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 300;
    if (nearBottom && hasMore && !loadingMore && !loading) loadMore();
  };
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
        onScroll={onScroll}
        scrollEventThrottle={200}
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
          // library.tsx — GridList and footer
          <GridList
            contentType={contentType}
            data={data}
            loading={loading}
            error={error}
          />
          {loadingMore && (
            <View className="py-6 items-center">
              <ActivityIndicator color={colors.accent} />
            </View>
          )}
          {!hasMore && !loading && data.length > 0 && (
            <Text className="text-center text-gray-500 py-6">
              End of results
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
