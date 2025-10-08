import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import SearchBox from "@/components/SearchBox";
import SegmentedControl from "@/components/ui/SegmentedButton";
import { useChoseFetch } from "@/hooks/useChoseFetch";
import useFetch from "@/hooks/useFetch";
import { fetchMovies, fetchSeries } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

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

  const [contentType, setContentType] = useState<"movie" | "tv">("movie");

  const { data, loading, error } = useChoseFetch(contentType);

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

        {
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
                { key: "movie", label: "Movie" },
                { key: "tv", label: "Tv" },
              ]}
              value={contentType}
              width={300}
              initialIndex={1}
              onChange={(key) => setContentType(key as "movie" | "tv")}
            />
            <>
              {/* <FlatList
                data={movies}
                renderItem={({ item }) => <ContentCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 5 }}
              /> */}
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
        }

        <View className="flex-1 mt-5">
          <>
            {/* <Text className="text-lg text-accent font-bold mt-5 mb-3">
              Latest series
            </Text> */}

            {/* <FlatList
                data={series}
                renderItem={({ item }) => <ContentCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 5 }}
              /> */}
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

        <View className="flex-1 mt-5">
          <Text>HookTest</Text>
          <GridList data={data} loading={loading} error={error} />
        </View>
      </ScrollView>
    </View>
  );
};

export default search;

const styles = StyleSheet.create({});
