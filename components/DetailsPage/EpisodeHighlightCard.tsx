// components/DetailsPage/EpisodeHighlightCard.tsx
import { TvEpisode } from "@/interface/interfaces";
import { formatDate, formatDaysUntil, formatRuntime } from "@/utils/formatters";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STILL_BASE = "https://image.tmdb.org/t/p/w300";
const STILL_PLACEHOLDER = "https://placehold.co/320x180/1a1a1a/ffff.png";
const MAX_BLUR = 90;
const REVEAL_MS = 450;

const BADGES: Record<string, string> = {
  finale: "Finale",
  premiere: "Premiere",
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const EpisodeHighlightCard = ({
  label,
  episode,
  showCountdown = false,
  spoiler = false,
}: {
  label: string;
  episode?: TvEpisode | null;
  showCountdown?: boolean;
  // When true, a tap-to-reveal blur overlay covers the card
  spoiler?: boolean;
}) => {
  // 0 = hidden, 1 = revealed
  const progress = useRef(new Animated.Value(0)).current;
  const [overlayGone, setOverlayGone] = useState(!spoiler);
  const [revealing, setRevealing] = useState(false);

  if (!episode) {
    return null;
  }

  const handleReveal = () => {
    if (revealing) return;
    setRevealing(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: REVEAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // BlurView intensity cannot use the native driver
    }).start(() => setOverlayGone(true));
  };

  const badge = BADGES[episode.episode_type];
  const runtime = formatRuntime(episode.runtime);
  const dateText = showCountdown
    ? formatDaysUntil(episode.air_date)
    : formatDate(episode.air_date);

  const blurIntensity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [MAX_BLUR, 0],
  });
  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View className="mt-3">
      <Text className="text-xs text-gray-400 mb-2">{label}</Text>
      {/* Wrapper: the overlay has the same bounds as the card */}
      <View className="rounded-lg overflow-hidden">
        {/* Hide spoiler text from screen readers until reveal */}
        <View
          className="flex-row gap-3 p-3 rounded-lg bg-dark-100"
          accessibilityElementsHidden={!overlayGone}
          importantForAccessibility={
            overlayGone ? "auto" : "no-hide-descendants"
          }
        >
          <Image
            source={{
              uri: episode.still_path
                ? `${STILL_BASE}${episode.still_path}`
                : STILL_PLACEHOLDER,
            }}
            resizeMode="cover"
            className="w-28 h-16 rounded-md bg-black"
          />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-bold text-primary">
                S{episode.season_number} E{episode.episode_number}
              </Text>
              {!!badge && (
                <View className="px-2 py-0.5 rounded-full bg-primary/20">
                  <Text className="text-xs text-primary">{badge}</Text>
                </View>
              )}
            </View>
            <Text numberOfLines={2} className="text-white">
              {episode.name}
            </Text>
            <Text className="mt-1 text-xs text-gray-400">
              {dateText}
              {runtime !== "-" ? ` · ${runtime}` : ""}
            </Text>
          </View>
        </View>

        {!overlayGone && (
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
          >
            <AnimatedBlurView
              intensity={blurIntensity as unknown as number}
              tint="dark"
              // Android: real blur. Without this, Android shows a plain tint.
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            {/* Dark scrim: keeps content hidden if blur is weak on a device */}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.55)" },
              ]}
            />
            <Pressable
              onPress={handleReveal}
              accessibilityRole="button"
              accessibilityLabel="Show latest episode. Spoiler"
              style={[
                StyleSheet.absoluteFill,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Text className="font-bold text-red-400">
                Show Latest Episode SPOILER!!!
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default EpisodeHighlightCard;
