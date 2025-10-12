import useFetch from "@/hooks/useFetch";
import { MediaItem } from "@/interface/interfaces";
import { fetchSimilar } from "@/services/api";
import { router } from "expo-router";
import { ChevronDown, X } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RenderMovieGenres } from "../CategoryClickable";
import SideScrollList from "../SideScrollList";
import Divider from "../ui/Divider";

const DetailsPage = ({
  mediaObject,
  contentType = "movie",
}: {
  mediaObject?: MediaItem;
  contentType?: "movie" | "tv";
}) => {
  const insets = useSafeAreaInsets();

  const { data, loading, error } = useFetch(() =>
    fetchSimilar({ contentType: contentType, id: Number(mediaObject?.id) })
  );

  return (
    <View
      className="flex-1 bg-dark-200"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center w-[90%] h-20 gap-x-1 justify-end">
        <TouchableOpacity
          onPress={router.back}
          className="flex-row items-center justify-center gap-x-2 h-10 w-10 rounded-full"
        >
          <X className="text-accent font-bold" size={36} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center justify-center w-full mb-4">
          <Text className="text-center font-bold text-3xl text-white flex-wrap">
            {mediaObject?.title || mediaObject?.name}
          </Text>
        </View>

        <View id="upperSection" className="flex-row mt-6 gap-3">
          <TouchableOpacity className="shrink-0">
            <Image
              source={{
                uri: mediaObject?.poster_path
                  ? `https://image.tmdb.org/t/p/w500${mediaObject.poster_path}`
                  : "https://placehold.co/400x600/1a1a1a/ffffff.png",
              }}
              resizeMode="contain"
              className="rounded-lg w-44 h-60"
            />
          </TouchableOpacity>

          <View className="flex-1 flex-col space-y-2">
            {/* Yayın Tarihi */}
            {mediaObject?.release_date && (
              <Text className="text-gray-300" numberOfLines={2}>
                📅 Release Date:{" "}
                <Text className="text-white font-medium">
                  {new Date(mediaObject.release_date).toLocaleDateString()}
                </Text>
              </Text>
            )}

            {/* Kullanıcı Oylaması */}
            <View className="flex-row items-center flex-wrap">
              <Text className="text-yellow-400 font-bold">
                ⭐ {mediaObject?.vote_average?.toFixed(1)}
              </Text>
              <Text className="text-gray-400 ml-2">
                ({mediaObject?.vote_count} votes)
              </Text>
            </View>

            {/* Kategori */}
            <View>
              <Text className="text-gray-300 mb-1">🎬 Category: </Text>
              <RenderMovieGenres
                ids={mediaObject?.genre_ids}
                onGenrePress={(genreName) => {
                  console.log("Clicked genre:", genreName);
                }}
              />
            </View>

            {/* Popülerlik */}
            {mediaObject?.popularity && (
              <Text className="text-gray-300" numberOfLines={1}>
                🔥 Popularity:{" "}
                <Text className="text-white font-medium">
                  {Math.round(mediaObject.popularity)}
                </Text>
              </Text>
            )}

            {mediaObject?.original_language && (
              <Text className="text-gray-300  " numberOfLines={1}>
                🌐 Language:{" "}
                <Text className="text-white  uppercase font-medium">
                  {mediaObject.original_language}
                </Text>
              </Text>
            )}

            {mediaObject?.adult && (
              <Text className="text-gray-300  " numberOfLines={1}>
                🔞 Adult Content
              </Text>
            )}
          </View>
        </View>
        <Divider dividerStyle={{ marginTop: 20, marginBottom: 10 }}></Divider>
        <TouchableOpacity>
          <View className="flex-row items-center justify-center">
            <ChevronDown />
            <Text className="text-gray-300 text-gray font-medium">
              More Details
            </Text>
          </View>
        </TouchableOpacity>
        <Divider dividerStyle={{ marginTop: 10, marginBottom: 10 }}></Divider>
        <View className="flex-row">
          {mediaObject?.overview && (
            <Text className="text-gray-300">
              {" "}
              <Text className="text-gray font-medium">
                {mediaObject.overview}
              </Text>
            </Text>
          )}
        </View>
        <Divider dividerStyle={{ marginTop: 10, marginBottom: 10 }} />
        <View className="flex-1 mt-5">
          <>
            <Text className="text-lg text-accent font-bold mt-5 ">
              Similar Content
            </Text>
            <SideScrollList
              contentType="movie"
              data={data}
              loading={loading}
              error={error}
            />
          </>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsPage;
