import {
  SeasonProgress,
  TvSeason,
  WatchedTvEpisode,
} from "@/interface/interfaces";
import { isEpisodeAired } from "@/utils/episodeHelpers";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import EpisodeRow from "./EpisodeRow";

interface SeasonEpisodeListProps {
  seasons: TvSeason[];
  episodesBySeason: Record<number, WatchedTvEpisode[]>;
  seasonProgress: Record<number, SeasonProgress>;
  expandedSeason: number | null;
  loadingSeason: number | null;
  episodeError: string | null;

  onSeasonPress: (seasonNumber: number) => void;

  onEpisodePress: (episode: WatchedTvEpisode) => void;

  onMarkSeasonWatched: (seasonNumber: number, watched: boolean) => void;
}

const SeasonEpisodeList = ({
  seasons,
  episodesBySeason,
  seasonProgress,
  expandedSeason,
  loadingSeason,
  episodeError,
  onSeasonPress,
  onEpisodePress,
  onMarkSeasonWatched,
}: SeasonEpisodeListProps) => {
  if (!seasons || seasons.length === 0) {
    return (
      <Text className="text-gray-400 mt-4">No season information found.</Text>
    );
  }

  return (
    <View className="mt-5">
      <Text className="text-lg text-accent font-bold mb-3">Episodes</Text>

      {episodeError && (
        <Text className="text-red-400 mb-3">{episodeError}</Text>
      )}

      {seasons.map((season) => {
        const seasonNumber = season.season_number;
        const isExpanded = expandedSeason === seasonNumber;

        const episodes = episodesBySeason[seasonNumber] ?? [];

        const storedProgress = seasonProgress[seasonNumber];

        const airedEpisodes = episodes.filter((episode) =>
          isEpisodeAired(episode.air_date),
        );

        const watchedCount = airedEpisodes.filter(
          (episode) => episode.isWatched,
        ).length;

        const totalEpisodeCount =
          airedEpisodes.length > 0
            ? airedEpisodes.length
            : season.episode_count;

        const upcomingCount =
          episodes.length > 0 ? episodes.length - airedEpisodes.length : 0;
        const seasonIsLoaded = episodes.length > 0 || Boolean(storedProgress);

        const seasonIsCompleted =
          seasonIsLoaded &&
          totalEpisodeCount > 0 &&
          watchedCount >= totalEpisodeCount;

        const seasonIsInProgress = watchedCount > 0 && !seasonIsCompleted;

        const progressPercentage =
          totalEpisodeCount > 0
            ? Math.min(
                Math.round((watchedCount / totalEpisodeCount) * 100),
                100,
              )
            : 0;

        const isLoading = loadingSeason === seasonNumber;

        return (
          <View
            key={seasonNumber}
            className="mb-3 rounded-xl bg-secondary overflow-hidden"
          >
            <TouchableOpacity
              onPress={() => onSeasonPress(seasonNumber)}
              activeOpacity={0.75}
              className="p-4"
            >
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() =>
                    onMarkSeasonWatched(seasonNumber, !seasonIsCompleted)
                  }
                  activeOpacity={0.7}
                  className="mr-3"
                >
                  {seasonIsCompleted ? (
                    <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                      <Check size={18} color="white" />
                    </View>
                  ) : seasonIsInProgress ? (
                    <View className="w-7 h-7 rounded-full border-2 border-primary items-center justify-center">
                      <View className="w-3 h-3 rounded-full bg-primary" />
                    </View>
                  ) : (
                    <View className="w-7 h-7 rounded-full border border-gray-400" />
                  )}
                </TouchableOpacity>

                <View className="flex-1">
                  <Text className="text-white font-bold">
                    {season.name || `Season ${seasonNumber}`}
                  </Text>

                  <Text className="text-gray-400 text-xs mt-1">
                    {watchedCount}/{totalEpisodeCount} aired watched
                  </Text>

                  {upcomingCount > 0 && (
                    <Text className="text-yellow-500 text-xs mt-1">
                      {upcomingCount} upcoming
                    </Text>
                  )}

                  <View className="h-2 bg-black/30 rounded-full mt-2 overflow-hidden">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />
                  </View>

                  <Text className="text-gray-500 text-xs mt-1">
                    {seasonIsCompleted
                      ? "Completed"
                      : seasonIsInProgress
                        ? "In Progress"
                        : "Not Started"}
                  </Text>
                </View>

                <View className="ml-3">
                  {isExpanded ? (
                    <ChevronUp size={22} color="white" />
                  ) : (
                    <ChevronDown size={22} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View className="px-3 pb-3">
                <TouchableOpacity
                  onPress={() =>
                    onMarkSeasonWatched(seasonNumber, !seasonIsCompleted)
                  }
                  className="bg-primary rounded-lg p-2 mb-2"
                >
                  <Text className="text-white text-center font-medium">
                    {seasonIsCompleted
                      ? "Mark Season Unwatched"
                      : "Mark Season Watched"}
                  </Text>
                </TouchableOpacity>

                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    className="my-4"
                  />
                )}

                {!isLoading &&
                  episodes.map((episode) => (
                    <EpisodeRow
                      key={`${episode.season_number}-${episode.episode_number}`}
                      episode={episode}
                      onPress={onEpisodePress}
                    />
                  ))}

                {!isLoading && seasonIsLoaded && episodes.length === 0 && (
                  <Text className="text-gray-400 text-center py-4">
                    No episodes found for this season.
                  </Text>
                )}

                {!isLoading && !seasonIsLoaded && (
                  <Text className="text-gray-400 text-center py-4">
                    Open the season to load episodes.
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default SeasonEpisodeList;
