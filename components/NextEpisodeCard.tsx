// components/NextEpisodeCard.tsx
import type { WatchingShow } from "@/helpers/backendHelper";
import { Check } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  show: WatchingShow;
  busy?: boolean;
  onMarkWatched: (show: WatchingShow) => void;
}

const NextEpisodeCard = ({ show, busy = false, onMarkWatched }: Props) => {
  const ep = show.next_episode;
  return (
    <View className="w-64 mr-3">
      <Image
        source={{
          uri: ep.still_path
            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
            : "https://placehold.co/600x400/1a1a1a/ffffff.png",
        }}
        resizeMode="cover"
        className="w-full h-36 rounded-lg"
      />
      <Text numberOfLines={1} className="text-white text-sm font-bold mt-2">
        {show.name}
      </Text>
      <View className="flex-row items-center justify-between mt-1">
        <Text numberOfLines={1} className="text-gray-50 text-xs flex-1 mr-2">
          {`S${ep.season_number}/E${ep.episode_number} · ${ep.name}`}
        </Text>
        <TouchableOpacity
          disabled={busy}
          onPress={() => onMarkWatched(show)}
          className="rounded-lg p-1 bg-secondary"
        >
          {busy ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Check size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NextEpisodeCard;
