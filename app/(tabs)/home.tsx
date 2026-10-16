import { colors } from "@/components/colors";
import NextEpisodeCard from "@/components/NextEpisodeCard";
import {
  getAllSeriesWithGenres,
  getWatchingShows,
  toggleEpisodeWatched,
} from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import { WatchingShow } from "@/interface/interfaces";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  useWindowDimensions,
} from "react-native";

import { Image, ScrollView, View } from "react-native";
export default function Home() {
  const COLUMN_GAP = 8;
  const { width } = useWindowDimensions();

  const CARD_WIDTH = 240;
  const CARD_HORIZONTAL_MARGIN = 8;
  const LIST_HORIZONTAL_PADDING = 20;
  const router = useRouter();
  const columnCount = useMemo(() => {
    const availableWidth = width - LIST_HORIZONTAL_PADDING * 2;

    const itemWidth = CARD_WIDTH + CARD_HORIZONTAL_MARGIN * 2 + COLUMN_GAP;

    return Math.max(1, Math.floor((availableWidth + COLUMN_GAP) / itemWidth));
  }, [width]);
  const {
    data: TvWlData,
    loading: TvWlLoading,
    error: TvWlError,
    refetch: refetchTvWl,
  } = useFetch(() => getAllSeriesWithGenres(false));

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    console.log("onrefresh");
    setRefreshing(true);
    refetch();
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 500);
  }, []);

  const {
    data: watching,
    loading,
    error,
    refetch,
  } = useFetch(getWatchingShows);
  const [busyId, setBusyId] = useState<number | null>(null);

  const onMarkWatched = useCallback(
    async (show: WatchingShow) => {
      const ep = show.next_episode;
      setBusyId(show.id);
      try {
        await toggleEpisodeWatched({
          tvId: show.id,
          seasonNumber: ep.season_number,
          episodeNumber: ep.episode_number,
          watched: true,
        });
        await refetch(); // server returns the next episode (or drops the show)
      } catch (e) {
        console.error("Mark watched error:", e);
      } finally {
        setBusyId(null);
      }
    },
    [refetch],
  );

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
        {/* <View className="mb-20">
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
        </View> */}
        <Text className="text-lg text-accent font-bold mt-5">Watching</Text>
        {loading && !watching ? (
          <ActivityIndicator
            size="large"
            color="white"
            className="mt-10 self-center"
          />
        ) : error ? (
          <Text className="text-white mt-5">Error: {error.message}</Text>
        ) : !watching?.length ? (
          <Text className="text-gray-50 mt-5">Nothing to watch right now.</Text>
        ) : (
          // <View className="flex-1 mt-5">
          //   <FlatList
          //     horizontal
          //     showsHorizontalScrollIndicator={false}
          //     data={watching}
          //     keyExtractor={(s) => String(s.id)}
          //     renderItem={({ item }) => (
          //       <NextEpisodeCard
          //         item={item}
          //         busy={busyId === item.id}
          //         onMarkWatched={onMarkWatched}
          //       />
          //     )}
          //     contentContainerStyle={{
          //       paddingBottom: 120,
          //     }}
          //     scrollEnabled={false}
          //   />
          // </View>
          <View className="flex-1 mt-5">
            <FlatList
              data={watching}
              key={columnCount}
              renderItem={({ item }) => (
                <NextEpisodeCard
                  item={item}
                  busy={busyId === item.id}
                  onMarkWatched={onMarkWatched}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              numColumns={columnCount}
              columnWrapperStyle={{
                justifyContent: "center",
                gap: COLUMN_GAP,
              }}
              contentContainerStyle={{
                paddingBottom: 120,
              }}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
