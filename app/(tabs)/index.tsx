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
    data: fantasyMovieData,
    loading: fantasyMovieLoading,
    error: fantasyMovieError,
  } = useChoseFetch("movie", undefined, {
    with_genres: 14,
    sort_by: "popularity.desc",
  });
  const {
    data: horrorMovieData,
    loading: horrorMovieLoading,
    error: horrorMovieError,
  } = useChoseFetch("movie", undefined, {
    with_genres: 27,
    sort_by: "popularity.desc",
  });
  const {
    data: scifiMovieData,
    loading: scifiMovieLoading,
    error: scifiMovieError,
  } = useChoseFetch("movie", undefined, {
    with_genres: 878,
    sort_by: "popularity.desc",
  });
  const {
    data: animationMovieData,
    loading: animationMovieLoading,
    error: animationMovieError,
  } = useChoseFetch("movie", undefined, {
    with_genres: 16,
    sort_by: "popularity.desc",
  });
  // const {
  //   data: scifiMovieData,
  //   loading: scifiMovieLoading,
  //   error: scifiMovieError,
  // } = useChoseFetch("movie", undefined, {
  //   with_genres: 878,
  //   sort_by: "popularity.desc",
  // });
  // const {
  //   data: scifiMovieData,
  //   loading: scifiMovieLoading,
  //   error: scifiMovieError,
  // } = useChoseFetch("movie", undefined, {
  //   with_genres: 878,
  //   sort_by: "popularity.desc",
  // });
  const {
    data: tvData,
    loading: tvLoading,
    error: tvError,
  } = useChoseFetch("tv");

  return (
    <View className="flex-1 bg-dark-200 ">
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
        <View className="mb-20">
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
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Trending Series
            </Text>
            <SideScrollList
              contentType="tv"
              data={tvData}
              loading={tvLoading}
              error={tvError}
            />
          </View>
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Trending Horror Movies
            </Text>
            <SideScrollList
              contentType="movie"
              data={horrorMovieData}
              loading={horrorMovieLoading}
              error={horrorMovieError}
            />
          </View>
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Trendling Sci-Fi Movies
            </Text>
            <SideScrollList
              contentType="movie"
              data={scifiMovieData}
              loading={scifiMovieLoading}
              error={scifiMovieError}
            />
          </View>
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Trending Fantasy Movies
            </Text>
            <SideScrollList
              contentType="movie"
              data={fantasyMovieData}
              loading={fantasyMovieLoading}
              error={fantasyMovieError}
            />
          </View>
          <View className="flex-1 mt-5">
            <Text className="text-lg text-accent font-bold mt-5">
              Trending Animation Movies
            </Text>
            <SideScrollList
              contentType="movie"
              data={animationMovieData}
              loading={animationMovieLoading}
              error={animationMovieError}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
