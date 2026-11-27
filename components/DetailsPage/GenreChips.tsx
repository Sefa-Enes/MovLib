// components/DetailsPage/GenreChips.tsx
import { MovieGenreId } from "@/constants/Genre";
import { MediaItem } from "@/interface/interfaces";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const GenreChips = ({
  item,
  onGenrePress,
}: {
  item?: MediaItem;
  onGenrePress: (genreId: number) => void;
}) => {
  const chips = useMemo(() => {
    const fromDetail = (item?.genres ?? []).filter(
      (g) => g && typeof g === "object" && !!g.name,
    );
    if (fromDetail.length > 0) {
      return fromDetail.map((g) => ({ id: g.id, name: g.name }));
    }
    return (item?.genre_ids ?? []).flatMap((id) =>
      MovieGenreId[id] ? [{ id, name: MovieGenreId[id] }] : [],
    );
  }, [item?.genres, item?.genre_ids]);

  if (chips.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip.id}
          onPress={() => onGenrePress(chip.id)}
          activeOpacity={0.7}
          className="px-3 py-1 rounded-full bg-dark-100 border border-white/10"
        >
          <Text className="text-sm font-medium text-white">{chip.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default GenreChips;
