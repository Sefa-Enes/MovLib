import { colors } from "@/components/colors";
import SearchBox from "@/components/SearchBox";
import SideScrollList from "@/components/SideScrollList";
import { useChoseFetch } from "@/hooks/useChoseFetch";
import { useRouter } from "expo-router";
import { Text } from "react-native";

import { Image, ScrollView, View } from "react-native";
export default function Index() {
  const router = useRouter();

  const {
    data: movieData,
    loading: movieLoading,
    error: movieError,
  } = useChoseFetch("movie");
  const {
    data: tvData,
    loading: tvLoading,
    error: tvError,
  } = useChoseFetch("tv");

  return (
    <View className="flex justify-center items-center bg-dark-200 w-screen h-screen">
      <Image
        source={require("@/assets/images/bg-image.png")}
        className="absolute w-full z-0 opacity-15"
        resizeMode="cover"
      />
      <ScrollView
        className="flex-1 px-5 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          className="mx-auto mt-20 mb-5"
          resizeMode="contain"
          tintColor={colors.secondary}
          style={{ width: 200, height: 100 }}
        />

        <SearchBox
          onPress={() => router.push("/search")}
          placeholder="Search a movie or series"
        />
        <View className="flex-1 mt-5">
          <>
            <Text className="text-lg text-accent font-bold mt-5 ">
              Trending Movies
            </Text>

            <SideScrollList
              contentType="movie"
              data={movieData}
              loading={movieLoading}
              error={movieError}
            />
          </>
        </View>

        <View className="flex-1 mt-5 mb-20">
          <Text className="text-lg text-accent font-bold mt-5">
            Trendind Series
          </Text>
          <SideScrollList
            contentType="tv"
            data={tvData}
            loading={tvLoading}
            error={tvError}
          />
        </View>
      </ScrollView>
    </View>
  );
}
