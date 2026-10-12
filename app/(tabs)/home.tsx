import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import { getAllSeriesWithGenres } from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, Text } from "react-native";

import { Image, ScrollView, View } from "react-native";
export default function Home() {
  const router = useRouter();

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
