// components/NextEpisodeCard.tsx
import { WatchingShow } from "@/interface/interfaces";
import { Href, router } from "expo-router";
import { Check } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export const CARD_WIDTH = 256;
export const NARROW_BREAKPOINT = 420;
// Parent layout values. They must match the list container.
export const LIST_HORIZONTAL_PADDING = 20; // px-5
export const COLUMN_GAP = 12;
const INFO_HEIGHT = 80; // old h-56 (224) - h-36 (144)

// Shared hook: the parent list uses the same values for numColumns/gap.
export const useNextEpisodeCardLayout = () => {
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < NARROW_BREAKPOINT;
  const cardWidth = isNarrow
    ? Math.floor((screenWidth - LIST_HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2)
    : CARD_WIDTH;
  const imageHeight = Math.round((cardWidth * 9) / 16); // 256 -> 144 (h-36)
  return {
    isNarrow,
    numColumns: isNarrow ? 2 : 1,
    cardWidth,
    imageHeight,
    cardHeight: imageHeight + INFO_HEIGHT,
  };
};

interface Props {
  item: WatchingShow;
  busy?: boolean;
  onMarkWatched: (item: WatchingShow) => void;
}

const NextEpisodeCard = ({ item, busy = false, onMarkWatched }: Props) => {
  const ep = item.next_episode;
  const { cardWidth, imageHeight, cardHeight } = useNextEpisodeCardLayout();
  const handleRedirect = async () => {
    // setMediaObject(item);
    router.push(`/tv/${item.id}` as Href);
  };
  return (
    <TouchableOpacity
      onPress={handleRedirect}
      style={{
        width: cardWidth,
        height: cardHeight,
        maxWidth: "100%", // never wider than parent on very narrow screens
      }}
      className="bg-slate-700 rounded-lg overflow-hidden"
    >
      <Image
        source={{
          uri: ep?.still_path
            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
            : "https://placehold.co/600x400/1a1a1a/ffffff.png",
        }}
        resizeMode="cover"
        className="w-full"
        style={{ height: imageHeight }}
      />
      <View className="px-2">
        <Text numberOfLines={1} className="text-white text-sm font-bold mt-2">
          {item.name}
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text numberOfLines={1} className="text-gray-50 text-xs flex-1 mr-2">
            {`S${ep?.season_number}/E${ep?.episode_number} · ${ep?.name}`}
          </Text>
          <TouchableOpacity
            disabled={busy}
            onPress={() => onMarkWatched(item)}
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
    </TouchableOpacity>
  );
};

export default NextEpisodeCard;
