import { MovieGenreId } from "@/constants/Genre";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const RenderMovieGenres = ({
  ids,
  onGenrePress,
}: {
  ids?: number[];
  onGenrePress?: (genreName: string) => void;
}) => {
  if (!ids || ids.length === 0) {
    return <Text className="text-gray-400">Unknown</Text>;
  }

  const genres = ids.map((id) => MovieGenreId[id]).filter((name) => !!name);

  return (
    <View className="flex-row flex-wrap">
      {genres.map((genre, index) => (
        <View key={genre} className="flex-row items-center">
          <TouchableOpacity
            onPress={() => onGenrePress && onGenrePress(genre)}
            activeOpacity={0.7}
          >
            <Text className="text-white font-medium">{genre}</Text>
          </TouchableOpacity>
          {index < genres.length - 1 && (
            <Text className="text-gray-400">, </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%", // parent genişliğini aşma
    overflow: "hidden", // taşanı gizle
  },
});
