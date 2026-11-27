// components/DetailsPage/LogoRow.tsx
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const LOGO_BASE = "https://image.tmdb.org/t/p/w185";

export type LogoItem = {
  id: number;
  name: string;
  logo_path: string | null;
};

const LogoRow = ({
  title,
  items,
  onItemPress,
}: {
  title: string;
  items?: LogoItem[];
  onItemPress?: (id: number) => void;
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View className="mt-5">
      <Text className="text-lg text-accent font-bold">{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingVertical: 10 }}
      >
        {items.map((entry) => {
          // Light tile: TMDB logos are dark transparent PNGs.
          const content = (
            <View className="w-28 items-center">
              <View className="h-14 w-28 items-center justify-center rounded-lg bg-white/90 px-2">
                {entry.logo_path ? (
                  <Image
                    source={{ uri: `${LOGO_BASE}${entry.logo_path}` }}
                    resizeMode="contain"
                    className="w-full h-8"
                    accessibilityLabel={entry.name}
                  />
                ) : (
                  <Text
                    className="text-xs font-bold text-dark-200 text-center"
                    numberOfLines={2}
                  >
                    {entry.name}
                  </Text>
                )}
              </View>
              <Text
                className="mt-1 text-xs text-gray-400 text-center"
                numberOfLines={1}
              >
                {entry.name}
              </Text>
            </View>
          );

          return onItemPress ? (
            <TouchableOpacity
              key={entry.id}
              activeOpacity={0.7}
              onPress={() => onItemPress(entry.id)}
            >
              {content}
            </TouchableOpacity>
          ) : (
            <View key={entry.id}>{content}</View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default LogoRow;
