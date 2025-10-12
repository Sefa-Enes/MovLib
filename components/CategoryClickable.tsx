import { MovieGenreId } from "@/constants/Genre";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const RenderMovieGenres = ({
  ids,
  onGenrePress,
}: {
  ids?: number[];
  onGenrePress?: (genreId: number) => void;
}) => {
  if (!ids || ids.length === 0) {
    return <Text className="text-gray-400">Unknown</Text>;
  }

  return (
    <View className="flex-row flex-wrap">
      {ids.map((id, index) => {
        const genreName = MovieGenreId[id];
        if (!genreName) return null;
        return (
          <View key={id} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => onGenrePress && onGenrePress(id)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-medium">{genreName}</Text>
            </TouchableOpacity>
            {index < ids.length - 1 && (
              <Text className="text-gray-400">, </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    overflow: "hidden",
  },
});
