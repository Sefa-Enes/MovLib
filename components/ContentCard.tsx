import { Link } from "expo-router";
import { Plus, Star } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type CardProps = Tv &
  Movie & {
    showLabel?: boolean;
    isGrid?: boolean;
    routes?: string;
  };

const ContentCard = ({
  id,
  poster_path,
  title,
  name,
  vote_average,
  release_date,
  first_air_date,
  routes,
  showLabel = false,
  isGrid = false,
}: CardProps) => {
  return (
    <Link href={routes || "/(tabs)"} asChild>
      <TouchableOpacity className={`${!isGrid ? "w-36 m-2" : "w-[32%]"}`}>
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/ffffff.png",
          }}
          resizeMode="cover"
          className={`w-full rounded-lg ${!isGrid ? "h-60" : "h-52"}`}
        />
        {!isGrid && (
          <>
            <Text
              numberOfLines={1}
              className="text-white text-xs font-semibold mt-1 mb-1"
            >
              {title || name}
            </Text>

            <View className="flex-row items-center gap-x-1 justify-between">
              <View className="flex-row items-center">
                <Star className="text-white" />
                <Text className="text-xs text-white font-bold uppercase ml-1">
                  {vote_average.toFixed(1)}
                </Text>
              </View>
              <TouchableOpacity
                // onPress={} //, implement all library
                className="flex-row items-center justify-start gap-x-1 bg-secondary rounded-lg"
              >
                <Plus className="text-accent" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    </Link>
  );
};

export default ContentCard;
