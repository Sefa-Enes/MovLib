import { MovieGenreId } from "@/constants/Genre";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const RenderListItems = ({
  ids,
  onGenrePress,
  header,
  idList = MovieGenreId,
}: {
  ids?: number[];
  onGenrePress?: (genreId: number | string) => void;
  header?: string;
  idList?: Record<number, string>;
}) => {
  if (!ids || ids.length === 0) {
    return <Text className="text-gray-400">Unknown</Text>;
  }

  return (
    <View style={styles.container}>
      <Text className="text-gray-300">{header}</Text>
      {ids.map((id, index) => {
        const item = idList[id];
        if (!item) return null;
        return (
          <View key={id} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => onGenrePress && onGenrePress(id)} // id number'dır, ama zaten union ile destekleniyor
              activeOpacity={0.7}
            >
              <Text className="text-white font-medium">{item}</Text>
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
