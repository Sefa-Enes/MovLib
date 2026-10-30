import { colors } from "@/components/colors";
import NextEpisodeCard from "@/components/NextEpisodeCard";
import {
  getWatchingAwhileShows,
  getWatchingShows,
  setEpisodesWatched,
} from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import { WatchingShow } from "@/interface/interfaces";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, Text } from "react-native";
// app/(tabs)/index.tsx  — imports
import { Image, ScrollView, View } from "react-native";
export default function Home() {
  const COLUMN_GAP = 12; // horizontal space between cards
  const ROW_GAP = 12; // vertical space between rows
  const router = useRouter();

  // n * CARD_WIDTH + (n - 1) * COLUMN_GAP <= availableWidth

  // const {
  //   data: TvWlData,
  //   loading: TvWlLoading,
  //   error: TvWlError,
  //   refetch: refetchTvWl,
  // } = useFetch(() => getAllSeriesWithGenres(false));

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    console.log("onrefresh");
    setRefreshing(true);
    refetch();
    refetchAwhile();
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
  const {
    data: watchingAwhile,
    loading: loadingAwhile,
    error: errorAwhile,
    refetch: refetchAwhile,
  } = useFetch(getWatchingAwhileShows);

  const onMarkWatched = useCallback(
    async (show: WatchingShow) => {
      const ep = show.next_episode;
      if (!ep) return;
      // Batch endpoint validates by TMDB episode id. Legacy rows may lack it.
      if (ep.id == null) {
        console.warn(
          `Mark watched skipped: no TMDB episode id (tv ${show.id} S${ep.season_number}E${ep.episode_number})`,
        );
        return;
      }
      setBusyId(show.id);
      try {
        // Backend marks the episode, upserts the next one as unwatched and
        // bumps watched_at, so the show moves Awhile -> Watching.
        await setEpisodesWatched(show.id, [
          { id: ep.id, season_number: ep.season_number, watched: true },
        ]);
        // Both lists can change (show leaves Awhile, enters Watching).
        await Promise.all([refetch(), refetchAwhile()]);
      } catch (e) {
        console.error("Mark watched error:", e);
      } finally {
        setBusyId(null);
      }
    },
    [refetch, refetchAwhile],
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
        <View id="watching">
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
            <Text className="text-gray-50 mt-5">
              Nothing to watch right now.
            </Text>
          ) : (
            <View
              className="mt-5"
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: COLUMN_GAP,
                rowGap: ROW_GAP,
                paddingBottom: 120,
              }}
            >
              {watching.map((item) => (
                <NextEpisodeCard
                  key={item.id}
                  item={item}
                  busy={busyId === item.id}
                  onMarkWatched={onMarkWatched}
                />
              ))}
            </View>
          )}{" "}
        </View>
        <View id="watchedAwhile">
          <Text className="text-lg text-accent font-bold">
            Not Watched For Awhile
          </Text>
          {loadingAwhile && !watchingAwhile ? (
            <ActivityIndicator
              size="large"
              color="white"
              className="mt-10 self-center"
            />
          ) : errorAwhile ? (
            <Text className="text-white mt-5">
              Error: {errorAwhile.message}
            </Text>
          ) : !watchingAwhile?.length ? (
            <Text className="text-gray-50 mt-5">
              You really never leave anything behind!
            </Text>
          ) : (
            <View
              className="mt-5"
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: COLUMN_GAP,
                rowGap: ROW_GAP,
                paddingBottom: 120,
              }}
            >
              {watchingAwhile.map((item) => (
                <NextEpisodeCard
                  key={item.id}
                  item={item}
                  busy={busyId === item.id}
                  onMarkWatched={onMarkWatched}
                />
              ))}
            </View>
          )}{" "}
        </View>
      </ScrollView>
    </View>
  );
}
