import { useMediaContext } from "@/context/GlobalContext";
import {
  deleteMovie,
  deleteTvShow,
  insertMovieWithGenres,
  insertTvWithGenres,
  toggleMovieWatched,
  toggleTvWatched,
} from "@/helpers/databaseHelper";
import { MediaItem, Movie, Tv } from "@/interface/interfaces";
import { Href, router } from "expo-router";
import { Check, Eye, Plus, Star } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type CardProps = MediaItem & {
  contentType?: "movie" | "tv";
  showLabel?: boolean;
  isGrid?: boolean;
  routes?: string;
  item: MediaItem;
};

// ── TV watched-ratio fade ──────────────────────────────────────────────────
// Library TV cards carry episode_count / watched_episode_count from the
// backend (GET /tv). The poster is faded from the top down to a boundary set
// by the watched ratio, so the clear region at the bottom is proportional to
// progress:
//   0/20  → fully faded
//   10/20 → bottom half clear, top half faded
//   5/20  → bottom 25% clear, top 75% faded
// No gradient library is used — the fade is a stack of thin overlay strips
// with increasing opacity (darkest at the top, transparent at the boundary).
const TV_FADE_OPACITY = 0.8;

const renderTvProgressFade = (ratio: number) => {
  if (ratio >= 1) return null; // fully watched → no fade
  const fadePct = (1 - ratio) * 100;
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: `${fadePct}%`,
        backgroundColor: `rgba(0,0,0,${TV_FADE_OPACITY})`,
      }}
    />
  );
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
  contentType = "movie",
  showLabel = false,
  isGrid = false,
  item,
}: CardProps) => {
  const { setMediaObject } = useMediaContext();
  const pathHead = contentType === "tv" ? "tv" : "movies";

  // Option 3: the TMDB proxy annotates every catalog item with in_library
  // (movies + TV) and is_watched (movies only). The card reads them directly
  // — the old per-card getMovieById/getTvShowById fetch (N+1) is gone.
  //
  // Library-sourced items (watchlist section, library page) arrive from
  // GET /movies or GET /tv with DIFFERENT field names: the backend returns
  // isWatched (camelCase, movies.go json tag) and is_favorite (tv_shows.go),
  // and no in_library field at all — being in the response IS the membership
  // proof. Both naming conventions are handled here so the card works
  // regardless of which source produced the item:
  //   - proxy item:      in_library / is_watched present
  //   - backend item:    isWatched (movie) or is_favorite (tv) present
  //   - normalized item: both present (backendHelper adds in_library/is_watched)
  const [inWatchlist, setInWatchlist] = useState(
    item.in_library ?? ("isWatched" in item || "is_favorite" in item),
  );
  const [isWatched, setIsWatched] = useState(
    item.is_watched ?? (item as any).isWatched ?? false,
  );

  // TV watched ratio for the progress fade. Only library-sourced TV items
  // carry episode_count / watched_episode_count (backend GET /tv); everything
  // else (TMDB proxy items, movies) gets no fade.
  const tvProgressRatio = useMemo(() => {
    if (contentType !== "tv") return null;
    const total = (item as any).episode_count;
    const watched = (item as any).watched_episode_count;
    if (!total || total <= 0) return null;
    return Math.min(1, Math.max(0, (watched ?? 0) / total));
  }, [contentType, item]);

  const dbFns = useMemo(() => {
    if (contentType === "movie") {
      return {
        insert: async (media: MediaItem, watched: boolean) => {
          return insertMovieWithGenres(media as Movie, watched);
        },

        remove: async (mediaId: number) => {
          return deleteMovie(mediaId);
        },

        toggleWatched: async (mediaId: number, watched: boolean) => {
          return toggleMovieWatched(mediaId, watched);
        },
      };
    }

    return {
      insert: async (media: MediaItem, watched: boolean) => {
        return insertTvWithGenres(media as Tv, watched);
      },

      remove: async (mediaId: number) => {
        return deleteTvShow(mediaId);
      },

      toggleWatched: async (mediaId: number, watched: boolean) => {
        return toggleTvWatched(mediaId, watched);
      },
    };
  }, [contentType]);

  // 🔹 İzleme listesine ekle / kaldır
  const handleWatchlistPress = async () => {
    try {
      if (!inWatchlist) {
        await dbFns.insert(item, false);
        setInWatchlist(true);
      } else {
        // Eğer zaten varsa -> veritabanından silmek istersin
        await dbFns.remove(id);
        setInWatchlist(false);
        setIsWatched(false);
      }
    } catch (err) {
      console.error("Watchlist toggle error:", err);
    }
  };

  // 🔹 İzlenme durumunu değiştir
  const handleWatchedPress = async () => {
    if (contentType !== "movie") {
      return;
    }

    try {
      if (!isWatched) {
        if (inWatchlist) {
          await dbFns.toggleWatched(id, true);
        } else {
          await dbFns.insert(item, true);
          setInWatchlist(true);
        }

        setIsWatched(true);
      } else {
        await dbFns.toggleWatched(id, false);
        setIsWatched(false);
      }
    } catch (err) {
      console.error("Watched toggle error:", err);
    }
  };
  const handleRedirect = async () => {
    setMediaObject(item);
    router.push(`/${pathHead}/${id}` as Href);
  };
  return (
    <TouchableOpacity onPress={handleRedirect} className="w-36 m-2">
      {/* 🔹 IMAGE WRAPPER */}
      <View className="relative">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/ffffff.png",
          }}
          resizeMode="cover"
          className="w-full h-60 rounded-lg"
        />

        {/* TV watched-ratio fade: clear bottom ↔ faded top, proportional to
            watched_episode_count / episode_count. */}
        {contentType === "tv" && tvProgressRatio !== null && (
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-lg overflow-hidden"
          >
            {renderTvProgressFade(tvProgressRatio)}
          </View>
        )}

        {contentType === "movie" && (
          <View className="absolute top-2 right-2 rounded-lg flex-row items-center">
            <TouchableOpacity
              onPress={handleWatchedPress}
              className={`rounded-lg p-1 ${
                !isWatched ? "bg-secondary" : "bg-primary"
              }`}
            >
              <Eye size={18} color={isWatched ? "white" : "lightgray"} />
            </TouchableOpacity>
          </View>
        )}

        {/* 🔹 Grid görünüm alt overlay */}
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
                  <Check size={18} color="white" />
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
                <Check size={18} color="white" />
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
