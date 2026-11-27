// components/NextEpisodeCard.tsx
import { WatchingShow } from "@/interface/interfaces";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { Check, Tv } from "lucide-react-native";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export const CARD_WIDTH = 256;
export const NARROW_BREAKPOINT = 420;
// Parent layout values. They must match the list container.
export const LIST_HORIZONTAL_PADDING = 20; // px-5
export const COLUMN_GAP = 12;
const INFO_HEIGHT = 80; // old h-56 (224) - h-36 (144)

// Native driver is not supported on web.
const USE_NATIVE_DRIVER = Platform.OS !== "web";

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
  // Dims the image. Used for the "Not Watched For Awhile" list.
  muted?: boolean;
  onMarkWatched: (item: WatchingShow) => void;
}

const NextEpisodeCard = ({
  item,
  busy = false,
  muted = false,
  onMarkWatched,
}: Props) => {
  const ep = item.next_episode;
  const { cardWidth, imageHeight, cardHeight } = useNextEpisodeCardLayout();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness: 6,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

  const handleRedirect = async () => {
    // setMediaObject(item);
    router.push(`/tv/${item.id}` as Href);
  };

  return (
    // Outer view: size, shadow and press animation. No overflow-hidden here,
    // because iOS clips the shadow when overflow is hidden.
    <Animated.View
      style={{
        width: cardWidth,
        height: cardHeight,
        maxWidth: "100%", // never wider than parent on very narrow screens
        transform: [{ scale }],
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      <Pressable
        onPress={handleRedirect}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}`}
        className="flex-1 bg-dark-100 rounded-xl overflow-hidden border border-white/10"
      >
        <View style={{ height: imageHeight }} className="w-full bg-dark-200">
          {ep?.still_path ? (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w300${ep.still_path}`,
              }}
              resizeMode="cover"
              className="w-full"
              style={{ height: imageHeight }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Tv size={28} color="#4b5563" />
            </View>
          )}

          {/* Dim overlay for the Awhile list. */}
          {muted && (
            <View
              pointerEvents="none"
              className="absolute inset-0 bg-dark-200/45"
            />
          )}

          {/* Soft fade at the bottom edge of the image. */}
          <LinearGradient
            colors={["transparent", "rgba(26, 31, 54, 0.9)"]}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "30%",
            }}
          />

          {ep && (
            <View className="absolute top-2 left-2 flex-row items-center px-2 py-1 rounded-full bg-black/55 border border-white/15">
              <View className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
              <Text className="text-white text-[11px] font-semibold tracking-wide">
                {`S${ep.season_number} · E${ep.episode_number}`}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 flex-row items-center px-3">
          <View className="flex-1 mr-3">
            <Text numberOfLines={1} className="text-white text-sm font-bold">
              {item.name}
            </Text>
            {ep && (
              <Text numberOfLines={1} className="text-gray-400 text-xs mt-0.5">
                {ep.name}
              </Text>
            )}
          </View>

          {ep && (
            <Pressable
              disabled={busy}
              onPress={() => onMarkWatched(item)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
              accessibilityLabel={`Mark ${item.name} S${ep.season_number} E${ep.episode_number} as watched`}
              className="w-9 h-9 rounded-full items-center justify-center border border-secondary/60"
              style={({ pressed }) => ({
                // secondary (#0466c9) tint; darker while pressed.
                backgroundColor: pressed
                  ? "rgba(4, 102, 201, 0.45)"
                  : "rgba(4, 102, 201, 0.18)",
                opacity: busy ? 0.7 : 1,
              })}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#d3f1f2" />
              ) : (
                <Check size={18} color="#d3f1f2" strokeWidth={2.5} />
              )}
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default NextEpisodeCard;
