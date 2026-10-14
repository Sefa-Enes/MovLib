import { WatchedTvEpisode } from "@/interface/interfaces";
import { isEpisodeAired } from "@/utils/episodeHelpers";
import { Check } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface EpisodeRowProps {
  episode: WatchedTvEpisode;
  onPress: (episode: WatchedTvEpisode) => void;
}

const EpisodeRow = ({ episode, onPress }: EpisodeRowProps) => {
  const imageUri = episode.still_path
    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
    : "https://placehold.co/320x180/1a1a1a/ffffff.png";
  const isAired = isEpisodeAired(episode.air_date);
  return (
    <TouchableOpacity
      onPress={() => {
        if (isAired) {
          onPress(episode);
        }
      }}
      disabled={!isAired}
      activeOpacity={isAired ? 0.75 : 1}
      className={`flex-row items-center gap-3 py-3 border-b border-white/10 ${
        !isAired ? "opacity-50" : ""
      }`}
    >
      <Image
        source={{ uri: imageUri }}
        resizeMode="cover"
        className="w-28 h-16 rounded-md bg-black"
      />

      <View className="w-7 items-center justify-center">
        {!isAired ? (
          <Text className="text-yellow-500 text-xs">—</Text>
        ) : episode.isWatched ? (
          <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
            <Check size={16} color="white" />
          </View>
        ) : (
          <View className="w-6 h-6 rounded-full border border-gray-400" />
        )}
      </View>

      <View className="flex-1">
        <Text
          numberOfLines={2}
          className={
            !isAired
              ? "text-gray-500"
              : episode.isWatched
                ? "text-gray-400 line-through"
                : "text-white"
          }
        >
          {episode.episode_number}. {episode.name}
        </Text>

        {episode.air_date && (
          <Text className="text-gray-500 text-xs mt-1">{episode.air_date}</Text>
        )}

        {!isAired && (
          <Text className="text-yellow-500 text-xs mt-1">Not Released</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default EpisodeRow;
