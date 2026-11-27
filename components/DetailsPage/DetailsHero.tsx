// components/DetailsPage/DetailsHero.tsx
import { MediaItem } from "@/interface/interfaces";
import {
  formatCount,
  formatRuntime,
  formatYearRange,
} from "@/utils/formatters";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const POSTER_PLACEHOLDER = "https://placehold.co/400x600/1a1a1a/ffff.png";

const DetailsHero = ({
  item,
  contentType,
  onPosterPress,
}: {
  item?: MediaItem;
  contentType: "movie" | "tv";
  onPosterPress: () => void;
}) => {
  if (!item) {
    return null;
  }

  const title = item.title || item.name || "";
  const originalTitle = item.original_title || item.original_name;
  const showOriginal = !!originalTitle && originalTitle !== title;

  const seasonCount = item.number_of_seasons;
  const metaParts: (string | undefined)[] =
    contentType === "movie"
      ? [
          item.release_date?.slice(0, 4),
          formatRuntime(item.runtime),
          item.status,
        ]
      : [
          formatYearRange(
            item.first_air_date,
            item.last_air_date,
            item.in_production,
          ),
          seasonCount
            ? `${seasonCount} Season${seasonCount > 1 ? "s" : ""}`
            : undefined,
          item.status,
        ];
  const meta = metaParts
    .filter((part): part is string => !!part && part !== "-")
    .join(" · ");

  return (
    // -mx-5 cancels the 20px horizontal padding of the parent ScrollView.
    <View className="-mx-5">
      <View className="w-full h-56">
        {item.backdrop_path ? (
          <Image
            source={{ uri: `${BACKDROP_BASE}${item.backdrop_path}` }}
            resizeMode="cover"
            className="w-full h-full"
          />
        ) : (
          <View className="w-full h-full bg-dark-100" />
        )}
        {/* Colors: dark-200 (#0F1322) from tailwind.config.js */}
        <LinearGradient
          colors={["rgba(15,19,34,0.55)", "rgba(15,19,34,0)", "#0F1322"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <View className="flex-row items-end gap-3 px-5 -mt-24">
        <TouchableOpacity
          className="shrink-0"
          onPress={onPosterPress}
          accessibilityLabel="Open poster"
        >
          <Image
            source={{
              uri: item.poster_path
                ? `${POSTER_BASE}${item.poster_path}`
                : POSTER_PLACEHOLDER,
            }}
            resizeMode="cover"
            className="w-32 h-48 rounded-lg border border-white/10"
          />
        </TouchableOpacity>

        <View className="flex-1 pb-1">
          <Text className="text-2xl font-bold text-white" numberOfLines={3}>
            {title}
          </Text>
          {showOriginal && (
            <Text className="text-sm text-gray-400" numberOfLines={2}>
              {originalTitle}
            </Text>
          )}
          {!!meta && (
            <Text className="mt-1 text-sm text-gray-300" numberOfLines={2}>
              {meta}
            </Text>
          )}
          <View className="flex-row flex-wrap items-center gap-2 mt-2">
            {!!item.vote_count && (
              <View className="flex-row items-center px-2 py-1 rounded-full bg-dark-100">
                <Text className="font-bold text-yellow-400">
                  ⭐ {item.vote_average?.toFixed(1)}
                </Text>
                <Text className="ml-1 text-gray-400">
                  ({formatCount(item.vote_count)})
                </Text>
              </View>
            )}
            {item.adult && (
              <View className="px-2 py-1 rounded-full bg-red-900/60">
                <Text className="text-xs font-bold text-white">18+</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {!!item.tagline && (
        <Text className="px-5 mt-4 italic text-gray-400">{item.tagline}</Text>
      )}
    </View>
  );
};

export default DetailsHero;
