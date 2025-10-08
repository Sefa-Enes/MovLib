import { colors } from "@/components/colors";
import ContentCard from "@/components/ContentCard";
import SearchBox from "@/components/SearchBox";
import SegmentedControl from "@/components/ui/SegmentedButton";
import useFetch from "@/hooks/useFetch";
import { fetchMovies, fetchSeries } from "@/services/api";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const search = () => {
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
            {/* <View className="flex-row justify-evenly items-center self-center rounded-full w-[60%] h-10 mt-5 bg-secondary">
              <TouchableOpacity>
                <View className="w-full text-center">
                  <Text>Movies</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity>
                <View className="w-full text-center">
                  <Text>Tv Series</Text>
                </View>
              </TouchableOpacity>
            </View> */}
            {/* <SegmentedControl
        segments={segments}
        value={mode} // kontrol edilen kullanım
        onChange={(k) => setMode(k)}
        containerStyle={{ marginBottom: 16 }}
        activeColor="#2563eb" // blue-600
        inactiveColor="#4b5563" // gray-700
        activeTextStyle={{ fontWeight: "700", color: "#fff" }}
        inactiveTextStyle={{ fontWeight: "600" }}
      /> */}
            {/* uncontrolled example */}
            <SegmentedControl
              segments={[
                { key: "a", label: "Movie" },
                { key: "b", label: "Tv" },
              ]}
              width={300}
              initialIndex={1}
              onChange={(k) => console.log("uncontrolled selection:", k)}
            />{" "}
            <>
              <Text className="text-lg text-accent font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              {/* <FlatList
                data={movies}
                renderItem={({ item }) => <ContentCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 5 }}
              /> */}
              <FlatList
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
              />
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

              {/* <FlatList
                data={series}
                renderItem={({ item }) => <ContentCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 5 }}
              /> */}
              <FlatList
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
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default search;

const styles = StyleSheet.create({});
