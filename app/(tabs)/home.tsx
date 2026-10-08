import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import {
  getAllMoviesWithGenres,
  getAllSeriesWithGenres,
} from "@/helpers/databaseHelper";
import { useChoseFetch } from "@/hooks/useChoseFetch";
import useFetch from "@/hooks/useFetch";
import { DiscoverMovieFilters } from "@/utils/queryBuilder";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, Text } from "react-native";

import { Image, ScrollView, View } from "react-native";
export default function Home() {
  const router = useRouter();

  const {
    data: movieData,
    loading: movieLoading,
    error: movieError,
  } = useChoseFetch("movie");

  const fantasyFilters = useMemo(
    () => ({
      with_genres: 14,
      sort_by: "popularity.desc",
    }),
    [],
  );

  const {
    data: fantasyMovieData,
    loading: fantasyMovieLoading,
    error: fantasyMovieError,
  } = useChoseFetch("movie", undefined, fantasyFilters as DiscoverMovieFilters);

  const horrorFilters = useMemo(
    () => ({
      with_genres: 27,
      sort_by: "popularity.desc",
    }),
    [],
  );
  const {
    data: horrorMovieData,
    loading: horrorMovieLoading,
    error: horrorMovieError,
  } = useChoseFetch("movie", undefined, horrorFilters as DiscoverMovieFilters);

  const scifiFilters = useMemo(
    () => ({
      with_genres: 878,
      sort_by: "popularity.desc",
    }),
    [],
  );
  const {
    data: scifiMovieData,
    loading: scifiMovieLoading,
    error: scifiMovieError,
  } = useChoseFetch("movie", undefined, scifiFilters as DiscoverMovieFilters);

  const animationFilters = useMemo(
    () => ({
      with_genres: 16,
      sort_by: "popularity.desc",
    }),
    [],
  );

  const {
    data: animationMovieData,
    loading: animationMovieLoading,
    error: animationMovieError,
  } = useChoseFetch(
    "movie",
    undefined,
    useMemo(
      () => ({
        with_genres: 16,
        sort_by: "popularity.desc",
      }),
      [],
    ),
  );

  const {
    data: WlData,
    loading: WlLoading,
    error: WlError,
    refetch: refetchWl,
  } = useFetch(() => getAllMoviesWithGenres(false, true));
  const {
    data: TvWlData,
    loading: TvWlLoading,
    error: TvWlError,
    refetch: refetchTvWl,
  } = useFetch(() => getAllSeriesWithGenres(false));

  const {
    data: tvData,
    loading: tvLoading,
    error: tvError,
  } = useChoseFetch("tv");
  const {
    data: animationTVData,
    loading: animationTVLoading,
    error: animationTVError,
  } = useChoseFetch(
    "tv",
    undefined,
    useMemo(
      () => ({
        with_genres: 16,
        sort_by: "popularity.desc",
      }),
      [],
    ),
  );
  const {
    data: FantasyTVData,
    loading: FantasyTVLoading,
    error: FantasyTVError,
  } = useChoseFetch(
    "tv",
    undefined,
    useMemo(
      () => ({
        with_genres: 10765,
        sort_by: "popularity.desc",
      }),
      [],
    ),
  );
  const {
    data: ComedyTVData,
    loading: ComedyTVLoading,
    error: ComedyTVError,
  } = useChoseFetch(
    "tv",
    undefined,
    useMemo(
      () => ({
        with_genres: 35,
        sort_by: "popularity.desc",
      }),
      [],
    ),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    console.log("onrefresh");
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 500);
  }, []);

  return (
    <View className="flex-1 bg-dark-200 ">
      <Image
        source={require("@/assets/images/bgimage.png")}
        className="absolute w-full z-0 opacity-15"
        resizeMode="cover"
      />
      <ScrollView
        className="flex-1 px-5 w-full"
        key={refreshKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent} // iOS spinner rengi
            colors={[colors.accent]} // Android spinner rengi
          />
        }
      >
        {/* <Image
          source={require("@/assets/images/logo.png")}
          className="mx-auto mt-20 mb-5"
          resizeMode="contain"
          tintColor={colors.secondary}
          style={{ width: 200, height: 100 }}
        />
        <SearchBox
          onPress={() => router.push("/search")}
          placeholder="Search a movie or series"
          onChangeText={function (text: string): void {}}
        /> */}
        <View className="mb-20">
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Series Watchlist
            </Text>
            <GridList
              contentType="tv"
              data={TvWlData}
              loading={TvWlLoading}
              error={TvWlError}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
