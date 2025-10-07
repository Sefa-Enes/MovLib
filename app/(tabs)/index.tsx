import { colors } from "@/components/colors";
import MovieCard from "@/components/MovieCard";
import SearchBox from "@/components/SearchBox";
import useFetch from "@/hooks/useFetch";
import { fetchMovies } from "@/services/api";
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

  return (
    <View className="flex justify-center items-center bg-dark-200 w-screen h-screen">
      <Image
        source={require("@/assets/images/bg-image.png")}
        className="absolute w-full z-0 opacity-25"
        resizeMode="cover"
      />
      <ScrollView
        className="flex-1 px-5"
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
                Latest Moves
              </Text>
              <FlatList
                data={movies}
                renderItem={({ item }) => (
                  // <Text className="text-white text-sm">{item.title}</Text>
                  <MovieCard {...item} />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start", //, "space-between"
                  gap: 22,
                  paddingRight: 5,
                  marginBottom: 20,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
