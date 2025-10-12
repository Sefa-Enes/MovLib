import { colors } from "@/components/colors";
import GridList from "@/components/GridList";
import SearchBox from "@/components/SearchBox";
import SegmentedControl from "@/components/ui/SegmentedButton";
import { getMovieGenresAsString } from "@/constants/Genre";
import { useMediaContext } from "@/context/GlobalContext";
import { useChoseFetch } from "@/hooks/useChoseFetch";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const search = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");

  const { filters, setFilters } = useMediaContext();
  const { data, loading, error } = useChoseFetch(
    contentType,
    searchQuery,
    filters
  );

  return (
    <View className="flex-1 bg-dark-200">
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
          style={{ height: 50 }}
        />
        {
          <View className="flex-1 mt-5">
            <SearchBox
              placeholder="Search a movie or series"
              value={searchQuery}
              onChangeText={(text: string) => setSearchQuery(text)}
            />
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
            {data &&
              !loading &&
              !error &&
              searchQuery.trim() &&
              data.length > 0 && (
                <Text className="text-xl text-white mt-3">
                  Search Results for:
                  <Text className="text-accent font-bold">
                    {" " + searchQuery}
                  </Text>
                </Text>
              )}
            {data &&
              !loading &&
              !error &&
              filters?.with_genres &&
              data.length > 0 && (
                <Text className="text-xl text-white mt-3">
                  Showing
                  <Text className="text-accent font-bold">
                    {" " +
                      getMovieGenresAsString(
                        Array.isArray(filters.with_genres)
                          ? filters.with_genres
                          : [filters.with_genres].filter(Boolean)
                      ) +
                      " Genre"}
                  </Text>
                </Text>
              )}
            <View className="flex-1">
              <GridList
                contentType={contentType}
                data={data}
                loading={loading}
                error={error}
              />
            </View>
          </View>
        }
      </ScrollView>
    </View>
  );
};

export default search;

const styles = StyleSheet.create({});
