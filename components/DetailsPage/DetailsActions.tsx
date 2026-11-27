// components/DetailsPage/DetailsActions.tsx
import { Check, ExternalLink, Eye, Globe, Plus } from "lucide-react-native";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

// https only, no user:pass@host. Blocks javascript:, intent:, custom schemes.
const SAFE_HTTPS_URL = /^https:\/\/[^\s/?#@]+(?:[/?#]\S*)?$/i;
const IMDB_ID = /^tt\d+$/;

const openUrl = (url: string) => {
  Linking.openURL(url).catch((err) => console.error("Open URL error:", err));
};

const DetailsActions = ({
  contentType,
  isWatched,
  inWatchlist,
  onWatchedPress,
  onWatchlistPress,
  homepage,
  imdbId,
}: {
  contentType: "movie" | "tv";
  isWatched: boolean;
  inWatchlist: boolean;
  onWatchedPress: () => void | Promise<void>;
  onWatchlistPress: () => void | Promise<void>;
  homepage?: string | null;
  imdbId?: string | null;
}) => {
  const safeHomepage =
    homepage && SAFE_HTTPS_URL.test(homepage) ? homepage : null;
  const safeImdbUrl =
    imdbId && IMDB_ID.test(imdbId)
      ? `https://www.imdb.com/title/${imdbId}/`
      : null;

  return (
    <View className="flex-row items-center gap-2 mt-4">
      {contentType === "movie" && (
        <TouchableOpacity
          onPress={onWatchedPress}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2 ${
            isWatched ? "bg-primary" : "bg-dark-100 border border-white/10"
          }`}
        >
          <Eye size={18} color={isWatched ? "#0F1322" : "#d3f1f2"} />
          <Text
            className={`font-medium ${
              isWatched ? "text-dark-200" : "text-gray-300"
            }`}
          >
            {isWatched ? "Watched" : "Not Watched"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onWatchlistPress}
        className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2 ${
          inWatchlist ? "bg-primary" : "bg-dark-100 border border-white/10"
        }`}
      >
        {inWatchlist ? (
          <Check size={18} color="#0F1322" />
        ) : (
          <Plus size={18} color="#d3f1f2" />
        )}
        <Text
          className={`font-medium ${
            inWatchlist ? "text-dark-200" : "text-gray-300"
          }`}
        >
          {inWatchlist ? "Added To List" : "Not Added"}
        </Text>
      </TouchableOpacity>

      {safeHomepage && (
        <TouchableOpacity
          onPress={() => openUrl(safeHomepage)}
          accessibilityLabel="Open homepage"
          className="items-center justify-center w-10 h-10 rounded-lg bg-dark-100 border border-white/10"
        >
          <Globe size={18} color="#d3f1f2" />
        </TouchableOpacity>
      )}

      {safeImdbUrl && (
        <TouchableOpacity
          onPress={() => openUrl(safeImdbUrl)}
          accessibilityLabel="Open IMDb"
          className="flex-row items-center justify-center h-10 gap-1 px-3 rounded-lg bg-dark-100 border border-white/10"
        >
          <Text className="text-xs font-bold text-gray-300">IMDb</Text>
          <ExternalLink size={14} color="#d3f1f2" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DetailsActions;
