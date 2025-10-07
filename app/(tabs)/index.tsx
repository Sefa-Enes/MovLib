import { colors } from "@/components/colors";
import ContentCard from "@/components/ContentCard";
import SearchBox from "@/components/SearchBox";
import useFetch from "@/hooks/useFetch";
import { fetchMovies, fetchSeries } from "@/services/api";
import { useRouter } from "expo-router";
import { FlatList, Text } from "react-native";

import { ActivityIndicator, Image, ScrollView, View } from "react-native";
export default function Index() {
  const router = useRouter();
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));
  const {
    data: series,
    loading: seriesLoading,
    error: seriesError,
  } = useFetch(() => fetchSeries({ query: "" }));

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

        {moviesLoading ? (
          <ActivityIndicator
            size="large"
            color="white"
            className="mt-10 self-center"
          />
        ) : moviesError ? (
          <Text>Error: {moviesError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBox
              onPress={() => router.push("/search")}
              placeholder="Search a movie or series"
            />
            <>
              <Text className="text-lg text-accent font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              <FlatList
                data={movies}
                renderItem={({ item }) => <ContentCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 5 }}
              />
              {/* <FlatList
                data={movies}
                renderItem={({ item }) => (
                  // <Text className="text-white text-sm">{item.title}</Text>
                  <ContentCard {...item} isGrid={true} />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-evenly", //, "space-between"
                  gap: 5,
                  marginBottom: 5,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              /> */}
            </>
          </View>
        )}
        {seriesLoading ? (
          <ActivityIndicator
            size="large"
            color="white"
            className="mt-10 self-center"
          />
        ) : seriesError ? (
          <Text>Error: {seriesError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            {/* <SearchBox
              onPress={() => router.push("/search")}
              placeholder="Search a movie or series"
            /> */}
            <>
              <Text className="text-lg text-accent font-bold mt-5 mb-3">
                Latest series
              </Text>

              <FlatList
                data={series}
                renderItem={({ item }) => <ContentCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 5, marginBottom: 50 }}
              />
              {/* <FlatList
                data={series}
                renderItem={({ item }) => (
                  // <Text className="text-white text-sm">{item.title}</Text>
                  <ContentCard {...item} isGrid={true} />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-evenly", //, "space-between"
                  gap: 5,
                  marginBottom: 5,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              /> */}
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
