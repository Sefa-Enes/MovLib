// app/(tabs)/index.tsx
import { colors } from "@/components/colors";
import NextEpisodeCard, { COLUMN_GAP } from "@/components/NextEpisodeCard";
import {
  getWatchingAwhileShows,
  getWatchingShows,
  setEpisodesWatched,
} from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import { WatchingShow } from "@/interface/interfaces";
import { useRouter } from "expo-router";
import { Tv } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// app/(tabs)/index.tsx  — imports
import SectionHeader from "@/components/Home/SectionHeader";
import { Image, ScrollView, View } from "react-native";

const ROW_GAP = COLUMN_GAP; // vertical space between rows

// Same grid for both lists. Gap comes from NextEpisodeCard.
const gridStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  columnGap: COLUMN_GAP,
  rowGap: ROW_GAP,
} as const;

const ErrorBox = ({ message }: { message: string }) => (
  <View className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
    <Text className="text-red-300">{`Error: ${message}`}</Text>
  </View>
);

const EmptyBox = ({ text }: { text: string }) => (
  <View className="mt-3 items-center rounded-xl border border-white/10 bg-dark-100/60 py-6">
    <Tv size={28} color="#6b7280" />
    <Text className="text-gray-300 mt-2">{text}</Text>
  </View>
);

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
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
    console.log(width);
    console.log("onrefresh");
    setRefreshing(true);
    refetchWatching();
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
    refetch: refetchWatching,
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
        await Promise.all([refetchWatching(), refetchAwhile()]);
      } catch (e) {
        console.error("Mark watched error:", e);
      } finally {
        setBusyId(null);
      }
    },
    [refetchWatching, refetchAwhile],
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
        contentContainerStyle={{
          minHeight: "100%",
          paddingTop: insets.top + 16,
          paddingBottom: 120, // space for the tab bar
        }}
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
          <SectionHeader title="Watching" />
          {loading && !watching ? (
            <ActivityIndicator
              size="large"
              color={colors.accent}
              className="mt-10 self-center"
            />
          ) : error ? (
            <ErrorBox message={error.message} />
          ) : !watching?.length ? (
            <EmptyBox text="Nothing to watch right now." />
          ) : (
            <View className="mt-3" style={gridStyle}>
              {watching.map((item) => (
                <NextEpisodeCard
                  key={item.id}
                  item={item}
                  busy={busyId === item.id}
                  onMarkWatched={onMarkWatched}
                />
              ))}
            </View>
          )}
        </View>
        <View id="watchedAwhile" className="mt-8">
          <SectionHeader title="Not Watched For Awhile" />
          {loadingAwhile && !watchingAwhile ? (
            <ActivityIndicator
              size="large"
              color={colors.accent}
              className="mt-10 self-center"
            />
          ) : errorAwhile ? (
            <ErrorBox message={errorAwhile.message} />
          ) : !watchingAwhile?.length ? (
            <EmptyBox text="You really never leave anything behind!" />
          ) : (
            <View className="mt-3" style={gridStyle}>
              {watchingAwhile.map((item) => (
                <NextEpisodeCard
                  key={item.id}
                  item={item}
                  muted
                  busy={busyId === item.id}
                  onMarkWatched={onMarkWatched}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
