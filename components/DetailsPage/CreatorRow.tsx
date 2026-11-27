// components/DetailsPage/CreatorRow.tsx
import { MediaItem } from "@/interface/interfaces";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

const CreatorRow = ({ creators }: { creators?: MediaItem["created_by"] }) => {
  if (!creators || creators.length === 0) {
    return null;
  }

  return (
    <View className="mt-5">
      <Text className="text-lg text-accent font-bold">Created By</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
        className="mt-3"
      >
        {creators.map((creator) => (
          <View key={creator.id} className="items-center w-20">
            {creator.profile_path ? (
              <Image
                source={{ uri: `${PROFILE_BASE}${creator.profile_path}` }}
                resizeMode="cover"
                className="w-16 h-16 rounded-full bg-dark-100"
              />
            ) : (
              <View className="items-center justify-center w-16 h-16 rounded-full bg-dark-100">
                <Text className="text-xl font-bold text-gray-300">
                  {creator.name.charAt(0)}
                </Text>
              </View>
            )}
            <Text
              numberOfLines={2}
              className="mt-1 text-xs text-center text-gray-300"
            >
              {creator.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CreatorRow;
