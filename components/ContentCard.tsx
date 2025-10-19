import { useMediaContext } from "@/context/GlobalContext";
import {
  getMovieById,
  getTvShowById,
  insertMovieWithGenres,
  toggleMovieWatched,
} from "@/helpers/databaseHelper";
import { MediaItem } from "@/interface/interfaces";
import { Href, router } from "expo-router";
import { Check, Eye, Plus, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type CardProps = MediaItem & {
  contentType?: "movie" | "tv";
  showLabel?: boolean;
  isGrid?: boolean;
  routes?: string;
  item: MediaItem;
};

interface UnitedWithDb extends MediaItem {
  isWatched: boolean;
}

const ContentCard = ({
  id,
  poster_path,
  title,
  name,
  vote_average,
  release_date,
  first_air_date,
  routes,
  contentType = "movie",
  showLabel = false,
  isGrid = false,
  item,
}: CardProps) => {
  const { setMediaObject } = useMediaContext();
  const pathHead = contentType === "tv" ? "tv" : "movies";

  // 🔹 local state for DB data
  const [fromDb, setFromDb] = useState<UnitedWithDb | null>(null);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [isWatched, setIsWatched] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data =
          contentType === "movie"
            ? await getMovieById(id)
            : await getTvShowById(id);
        setFromDb(data as UnitedWithDb);
      } catch (err) {
        console.error("DB fetch error:", err);
      }
    };

    fetchData();
  }, [id, contentType]); // id veya contentType değişirse yeniden yükle

  useEffect(() => {
    setInWatchlist(fromDb ? true : false);
    setIsWatched(fromDb?.isWatched ? true : false);
  }, [fromDb, inWatchlist, isWatched]); // id veya contentType değişirse yeniden yükle

  const handleRedirect = async () => {
    await new Promise((resolve) => {
      setMediaObject(item);
      resolve(true);
    });
    router.push(`/${pathHead}/${id}` as Href);
  };
  const handleWatchlistPress = async () => {
    () => insertMovieWithGenres(item, false);
  };
  const handleWatchedPress = async () => {
    if (!isWatched) {
      if (inWatchlist) {
        toggleMovieWatched(id, true);
      } else {
        insertMovieWithGenres(item, true);
      }
    } else {
      toggleMovieWatched(id, false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRedirect}
      className={`${!isGrid ? "w-36 m-2" : "w-[32%]"}`}
    >
      {/* 🔹 IMAGE WRAPPER */}
      <View className="relative">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/ffffff.png",
          }}
          resizeMode="cover"
          className={`w-full rounded-lg ${!isGrid ? "h-60" : "h-52"}`}
        />

        {/* 🔹 Sağ üst - izleme butonu */}
        <View className="absolute top-2 right-2 rounded-lg flex-row items-center">
          <TouchableOpacity
            onPress={handleWatchedPress}
            className="bg-secondary rounded-lg p-1"
          >
            <Eye color={isWatched ? "white" : "gray"} />
          </TouchableOpacity>
        </View>

        {/* 🔹 Grid görünüm için alt overlayler */}
        {isGrid && (
          <>
            <View className="absolute bottom-2 right-2 rounded-lg flex-row items-center">
              <TouchableOpacity
                onPress={handleWatchlistPress}
                className={`rounded-lg p-1 ${
                  !inWatchlist ? "bg-secondary" : "bg-primary"
                }`}
              >
                {inWatchlist ? (
                  <Check size={18} color="white" /> // DB’de varsa yeşil göz
                ) : (
                  <Plus size={18} className="text-accent" />
                )}
              </TouchableOpacity>
            </View>

            <View className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-lg flex-row items-center">
              <Star size={14} color="#FFD700" />
              <Text className="text-white text-xs ml-1 font-semibold">
                {vote_average.toFixed(1)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* 🔹 Alt bilgi */}
      {!isGrid && (
        <>
          <View className="flex-row justify-between mt-1 mb-1">
            <Text
              numberOfLines={1}
              className="text-white text-xs font-semibold flex-1 overflow-hidden"
            >
              {title || name}
            </Text>
            <Text className="text-white text-xs font-semibold ml-2">
              {release_date?.split("-")[0] || first_air_date?.split("-")[0]}
            </Text>
          </View>

          <View className="flex-row items-center gap-x-1 justify-between">
            <View className="flex-row items-center">
              <Star size={16} color="#FFD700" />
              <Text className="text-xs text-white font-bold uppercase ml-1">
                {vote_average.toFixed(1)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleWatchlistPress}
              className={`flex-row items-center justify-start gap-x-1 rounded-lg p-1 ${
                !inWatchlist ? "bg-secondary" : "bg-primary"
              }`}
            >
              {inWatchlist ? (
                <Check size={18} color="white" /> // DB’de varsa yeşil göz
              ) : (
                <Plus size={18} className="text-accent" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

export default ContentCard;
