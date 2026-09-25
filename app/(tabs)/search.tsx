import { colors } from "@/components/colors";
import { FilterModal } from "@/components/FilterModal";
import GridList from "@/components/GridList";
import SearchBox from "@/components/SearchBox";
import SegmentedControl from "@/components/ui/SegmentedButton";
import { getMovieGenresAsString } from "@/constants/Genre";
import { useMediaContext } from "@/context/GlobalContext";
import useFetch from "@/hooks/useFetch";
import useInfiniteFetch, { PageResult } from "@/hooks/useInfiniteFetch";
import { MediaItem } from "@/interface/interfaces";
import {
  fetchCompany,
  fetchMoviesPage,
  fetchSeriesPage,
} from "@/services/api";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const search = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");

  const { filters, setFilters } = useMediaContext();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Debounce the query so each keystroke doesn't fire a page-1 fetch
  // (same 500ms behavior the old useChoseFetch had).
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Infinite scroll ──────────────────────────────────────────────────────
  // Fetches one TMDB page at a time through the backend proxy. The proxy
  // passes `page` through untouched and returns the standard TMDB envelope
  // { page, results, total_pages, total_results }.
  const fetchPage = useCallback(
    async (page: number): Promise<PageResult<MediaItem>> => {
      if (contentType === "movie") {
        return fetchMoviesPage({ query: debouncedQuery, filters, page });
      }
      return fetchSeriesPage({ query: debouncedQuery, page });
    },
    [contentType, debouncedQuery, filters],
  );

  const { data, loading, loadingMore, error, hasMore, loadMore } =
    useInfiniteFetch<MediaItem>(fetchPage, [
      contentType,
      debouncedQuery,
      JSON.stringify(filters),
    ]);

  // Fire loadMore when the user scrolls within ~300px of the bottom.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 300;
    if (nearBottom && hasMore && !loadingMore && !loading) {
      loadMore();
    }
  };

  const {
    data: companyData,
    loading: companyLoading,
    error: companyError,
    refetch: refetchCompany,
  } = useFetch(
    () => fetchCompany({ id: Number(filters?.with_companies) }),
    false
  );
  useEffect(() => {
    if (filters?.with_companies && !companyData) {
      refetchCompany();
    }
  }, [filters?.with_companies]); // Number() kullanmadan, sadece ilgili state'leri ekle

  return (
    <View className="flex-1 bg-dark-200">
      <Image
        source={require("@/assets/images/bgimage.png")}
        className="absolute w-full z-0 opacity-15"
        resizeMode="cover"
      />
      <ScrollView
        className="flex-1 px-5 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          className="mx-auto mt-20 mb-5"
          resizeMode="contain"
          tintColor={colors.secondary}
          style={{ height: 50 }}
        />
        {
          <View className="flex-1 mt-5">
            <View className="flex-row w-full items-center gap-2">
              {/* 🔹 Search Box */}
              <SearchBox
                placeholder="Search a movie or series"
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
                className="flex-1" // genişliği kalan alana yay
              />

              {/* 🔹 Filter Button */}
              <FilterModal setFilters={setFilters} />
            </View>

            <SegmentedControl
              segments={[
                { key: "movie", label: "Movie" },
                { key: "tv", label: "Tv" },
              ]}
              value={contentType}
              width={300}
              initialIndex={1}
              onChange={(key) => setContentType(key as "movie" | "tv")}
            />
            {data &&
              !loading &&
              !error &&
              debouncedQuery.trim() &&
              data.length > 0 && (
                <>
                  <View className="flex-row items-center w-dull gap-x-1 justify-evenly">
                    <Text className="text-xl text-white mt-3">
                      Search Results for:
                      <Text className="text-accent font-bold">
                        {" " + debouncedQuery}
                      </Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      className="flex-row items-center justify-center gap-x-2 h-10 w-10 rounded-full"
                    >
                      <X className="text-accent font-bold" size={36} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            {data &&
              !loading &&
              !error &&
              filters?.with_genres &&
              data.length > 0 && (
                <View className="flex-row items-center w-dull gap-x-1 mt-3 justify-between">
                  <Text className="text-xl text-white ">
                    Showing
                    <Text className="text-accent font-bold">
                      {" " +
                        getMovieGenresAsString(
                          Array.isArray(filters.with_genres)
                            ? filters.with_genres
                            : [filters.with_genres].filter(Boolean)
                        ) +
                        " Genre"}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setFilters(undefined)}
                    className="flex-row items-center justify-center gap-x-2 h-8 w-8 rounded-full"
                  >
                    <X className="text-accent font-bold" size={24} />
                  </TouchableOpacity>
                </View>
              )}
            {data &&
              !loading &&
              !error &&
              filters?.with_companies &&
              data.length > 0 && (
                <View className="flex-row items-center w-dull gap-x-1 mt-3 justify-between">
                  <Text className="text-xl text-white mt-3">
                    Showing
                    <Text className="text-accent font-bold">
                      {" " + companyData?.name + " Company"}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setFilters(undefined)}
                    className="flex-row items-center justify-center gap-x-2 h-8 w-8 rounded-full"
                  >
                    <X className="text-accent font-bold" size={24} />
                  </TouchableOpacity>
                </View>
              )}
            <View className="flex-1">
              <GridList
                contentType={contentType}
                data={data}
                loading={loading}
                error={error}
              />
            </View>

            {/* ── Infinite scroll footer ── */}
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
        }
      </ScrollView>
    </View>
  );
};

export default search;

const styles = StyleSheet.create({});
