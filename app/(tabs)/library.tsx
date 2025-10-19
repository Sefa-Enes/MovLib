import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import SegmentedControl from "@/components/ui/SegmentedButton";
import { getAllMoviesWithGenres } from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, Text } from "react-native";

import { Image, ScrollView, View } from "react-native";
export default function library() {
  const router = useRouter();

  const {
    data: WlData,
    loading: WlLoading,
    error: WlError,
    refetch: refetchWl,
  } = useFetch(() => getAllMoviesWithGenres(false));

  const [contentType, setContentType] = useState<"movie" | "tv">("movie");

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    console.log("onrefresh");
    setRefreshing(true);
    try {
      await refetchWl(); // 👈 veriyi yeniden getir
    } catch (e) {
      console.error("Refetch error:", e);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWl]);

  return (
    <View className="flex-1 bg-dark-200 ">
      <Image
        source={require("@/assets/images/bg-image.png")}
        className="absolute w-full z-0 opacity-15"
        resizeMode="cover"
      />
      <ScrollView
        className="flex-1 px-5 w-full mt-10"
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
        <View className="mb-20">
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Watchlist
            </Text>
            <GridList
              contentType={contentType}
              data={WlData}
              loading={WlLoading}
              error={WlError}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
