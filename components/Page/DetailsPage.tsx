import {
  deleteMovie,
  deleteTvShow,
  getMovieById,
  getTvShowById,
  insertMovieWithGenres,
  insertTvWithGenres,
  setEpisodesWatched,
  toggleMovieWatched,
  toggleTvWatched,
} from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import { MediaItem, Movie, Tv, WatchedTvEpisode } from "@/interface/interfaces";
import {
  fetchCollection,
  fetchRecommendations,
  fetchSimilar,
  fetchTvSeasonEpisodes,
} from "@/services/api";
import { isEpisodeAired } from "@/utils/episodeHelpers";
import { DiscoverMovieFilters } from "@/utils/queryBuilder";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreatorRow from "../DetailsPage/CreatorRow";
import DetailsActions from "../DetailsPage/DetailsActions";
import DetailsHero from "../DetailsPage/DetailsHero";
import DetailsInfoGrid from "../DetailsPage/DetailsInfoGrid";
import EpisodeHighlightCard from "../DetailsPage/EpisodeHighlightCard";
import GenreChips from "../DetailsPage/GenreChips";
import LogoRow from "../DetailsPage/LogoRow";
import OverviewText from "../DetailsPage/OverviewText";
import SeasonEpisodeList from "../Episodes/SeasonEpisodeList";
import SideScrollList from "../SideScrollList";
import Divider from "../ui/Divider";

const DetailsPage = ({
  detailData,
  refetchDetails,
  setFilters,
  setMediaObject,
  mediaObject,
  contentType = "movie",
}: {
  detailData: MediaItem | undefined;
  refetchDetails: () => Promise<void>;
  setFilters: (item: DiscoverMovieFilters | undefined) => void;
  setMediaObject: (item: MediaItem | undefined) => void; // sadece değer alır
  mediaObject?: MediaItem;
  contentType?: "movie" | "tv";
}) => {
  const insets = useSafeAreaInsets();

  const {
    data: similarData,
    loading: similarLoading,
    error: similarError,
    refetch,
  } = useFetch(
    () =>
      fetchSimilar({ contentType: contentType, id: Number(mediaObject?.id) }),
    false,
  );
  const {
    data: recommendationsData,
    loading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommend,
  } = useFetch(
    () =>
      fetchRecommendations({
        contentType: contentType,
        id: Number(mediaObject?.id),
      }),
    false,
  );
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  const [seasonEpisodes, setSeasonEpisodes] = useState<
    Record<number, WatchedTvEpisode[]>
  >({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);

  const [episodeError, setEpisodeError] = useState<string | null>(null);

  // Current show id. Async results for a previous show (user navigated via
  // Similar) are ignored when this no longer matches.
  const tvIdRef = useRef<number | undefined>(mediaObject?.id);
  // DetailsPage.tsx
  // Latest episode stays hidden until the user taps the spoiler button.

  useEffect(() => {
    tvIdRef.current = mediaObject?.id;
    setSeasonEpisodes({});
    setExpandedSeason(null);
    setEpisodeError(null);
  }, [mediaObject?.id]);

  // Specials (season 0) are hidden: library progress excludes them.
  const visibleSeasons = useMemo(
    () => (detailData?.seasons ?? []).filter((s) => s.season_number > 0),
    [detailData?.seasons],
  );
  // Fresh detail response when it matches the shown item; list item otherwise.
  const item = useMemo(
    () =>
      detailData && detailData.id === mediaObject?.id
        ? detailData
        : mediaObject,
    [detailData, mediaObject],
  );
  // Movies use release_date, TV uses first_air_date.
  const displayDate = item?.release_date || item?.first_air_date;

  const collectionId =
    contentType === "movie" ? item?.belongs_to_collection?.id : undefined;
  const [showLatestEpisode, setShowLatestEpisode] = useState(false);

  // Hide it again when another title opens.
  useEffect(() => {
    setShowLatestEpisode(false);
  }, [item?.id]);
  const {
    data: collectionData,
    loading: collectionLoading,
    error: collectionError,
    refetch: refetchCollection,
    reset: resetCollection,
  } = useFetch(() => fetchCollection({ id: Number(collectionId) }), false);

  // The list item has no belongs_to_collection. The id appears when the detail
  // response arrives, so this effect runs again at that time.
  useEffect(() => {
    if (collectionId) {
      refetchCollection();
    } else {
      resetCollection();
    }
  }, [collectionId]);
  // components/DetailsPage/DetailsPage.tsx
  // 🔹 Library durumu: proxy annotation'dan (in_library / is_watched).
  // detailData is the fresh tv/{id} or movie/{id} response; mediaObject may be
  // a list item cached in context. DB lookup only when annotation is missing
  // (annotation is best-effort and is dropped if the flag query fails).
  useEffect(() => {
    if (!mediaObject) {
      return;
    }

    const fresh =
      detailData && detailData.id === mediaObject.id ? detailData : undefined;
    const source = fresh ?? mediaObject;

    if (typeof source.in_library === "boolean") {
      setInWatchlist(source.in_library);
      setIsWatched(
        contentType === "movie" && source.in_library && !!source.is_watched,
      );
      return;
    }

    // No annotation on the list item: wait for fresh details.
    if (!fresh) {
      return;
    }

    // Fresh details have no annotation either: fall back to the DB.
    const id = mediaObject.id;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const data =
          contentType === "movie"
            ? await getMovieById(id)
            : await getTvShowById(id);

        if (cancelled) {
          return;
        }
        setInWatchlist(!!data);
        setIsWatched(!!data?.isWatched);
      } catch (err) {
        console.error("DB fetch error:", err);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [mediaObject?.id, detailData, contentType]);

  const ensureSeasonEpisodes = async (
    seasonNumber: number,
    force: boolean = false,
  ): Promise<WatchedTvEpisode[] | null> => {
    if (!mediaObject || contentType !== "tv") {
      return null;
    }

    if (!force) {
      const cached = seasonEpisodes[seasonNumber];
      if (cached !== undefined) {
        return cached;
      }
    }

    const tvId = mediaObject.id;

    try {
      setLoadingSeason(seasonNumber);
      setEpisodeError(null);

      const episodes = await fetchTvSeasonEpisodes({ tvId, seasonNumber });

      if (tvIdRef.current !== tvId) {
        return null; // page switched to another show
      }

      setSeasonEpisodes((previous) => ({
        ...previous,
        [seasonNumber]: episodes,
      }));

      return episodes;
    } catch (error) {
      console.error("Season episodes fetch error:", error);

      if (tvIdRef.current === tvId) {
        setEpisodeError(
          error instanceof Error
            ? error.message
            : "Episodes could not be loaded.",
        );
      }

      return null;
    } finally {
      setLoadingSeason((current) =>
        current === seasonNumber ? null : current,
      );
    }
  };

  // Applies a confirmed (server-accepted) watched change to the cache.
  const applyLocalWatched = (
    seasonNumber: number,
    episodeIds: Set<number>,
    watched: boolean,
  ) => {
    const watchedAt = watched ? new Date().toISOString() : null;

    setSeasonEpisodes((previous) => {
      const episodes = previous[seasonNumber];
      if (!episodes) {
        return previous;
      }
      return {
        ...previous,
        [seasonNumber]: episodes.map((episode) =>
          episodeIds.has(episode.id)
            ? { ...episode, isWatched: watched, watched_at: watchedAt }
            : episode,
        ),
      };
    });
  };

  // One batch request. Local state changes only after the request succeeds;
  // on error this throws and the UI keeps its previous state.
  const commitWatched = async (
    seasonNumber: number,
    episodes: WatchedTvEpisode[],
    watched: boolean,
  ) => {
    if (!mediaObject || episodes.length === 0) {
      return;
    }

    const tvId = mediaObject.id;

    const result = await setEpisodesWatched(
      tvId,
      episodes.map((episode) => ({
        id: episode.id,
        season_number: seasonNumber,
        watched,
      })),
    );

    if (tvIdRef.current !== tvId) {
      return;
    }

    // Backend auto-adds / restores the show when an episode is marked watched.
    if (watched && result.applied > 0) {
      setInWatchlist(true);
    }

    if (result.skipped_unaired > 0) {
      // Client and server disagree on air dates: trust the server.
      await ensureSeasonEpisodes(seasonNumber, true);
      return;
    }

    applyLocalWatched(
      seasonNumber,
      new Set(episodes.map((episode) => episode.id)),
      watched,
    );
  };
  const dbFns = useMemo(() => {
    if (contentType === "movie") {
      return {
        insert: async (item: MediaItem, watched: boolean) => {
          return insertMovieWithGenres(item as Movie, watched);
        },

        remove: async (id: number) => {
          return deleteMovie(id);
        },

        toggleWatched: async (id: number, watched: boolean) => {
          return toggleMovieWatched(id, watched);
        },
      };
    }

    return {
      insert: async (item: MediaItem, watched: boolean) => {
        return insertTvWithGenres(item as Tv, watched);
      },

      remove: async (id: number) => {
        return deleteTvShow(id);
      },

      toggleWatched: async (id: number, watched: boolean) => {
        return toggleTvWatched(id, watched);
      },
    };
  }, [contentType]);

  // 🔹 İzleme listesine ekle / kaldır
  const handleWatchlistPress = async () => {
    try {
      if (mediaObject) {
        if (!inWatchlist) {
          await dbFns.insert(mediaObject, false);
          setInWatchlist(true);
        } else {
          // Eğer zaten varsa -> veritabanından silmek istersin
          await dbFns.remove(mediaObject?.id);
          setInWatchlist(false);
          setIsWatched(false);
        }
      }
    } catch (err) {
      console.error("Watchlist toggle error:", err);
    }
  };

  // 🔹 İzlenme durumunu değiştir
  const handleWatchedPress = async () => {
    try {
      if (mediaObject) {
        if (!isWatched) {
          if (inWatchlist) {
            await dbFns.toggleWatched(mediaObject.id, true);
          } else {
            await dbFns.insert(mediaObject, true);
            setInWatchlist(true);
          }
          setIsWatched(true);
        } else {
          await dbFns.toggleWatched(mediaObject.id, false);
          setIsWatched(false);
        }
      }
    } catch (err) {
      console.error("Watched toggle error:", err);
    }
  };
  useEffect(() => {
    if (mediaObject?.id) {
      refetch();
      refetchRecommend();
    }
  }, [mediaObject?.id, contentType]);
  // components/DetailsPage/DetailsPage.tsx
  const handleSeasonPress = async (seasonNumber: number) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }

    setExpandedSeason(seasonNumber);

    await ensureSeasonEpisodes(seasonNumber);
  };

  const handleEpisodeWatchedPress = async (episode: WatchedTvEpisode) => {
    if (!mediaObject || contentType !== "tv") {
      return;
    }
    if (!isEpisodeAired(episode.air_date)) {
      return;
    }
    try {
      await commitWatched(episode.season_number, [episode], !episode.isWatched);
    } catch (error) {
      console.error("Episode watched toggle error:", error);
      setEpisodeError("Episode could not be updated.");
    }
  };

  const handleMarkSeasonWatched = async (
    seasonNumber: number,
    watched: boolean,
  ) => {
    if (!mediaObject || contentType !== "tv") {
      return;
    }

    try {
      // Fetches the season (1 proxy request) if it was never opened.
      const episodes = await ensureSeasonEpisodes(seasonNumber);

      if (!episodes || episodes.length === 0) {
        return;
      }

      // Only aired episodes whose state actually changes. Already-watched
      // episodes are not re-sent, so their watched_at is preserved.
      const targets = episodes.filter(
        (episode) =>
          isEpisodeAired(episode.air_date) && episode.isWatched !== watched,
      );

      await commitWatched(seasonNumber, targets, watched);
    } catch (error) {
      console.error("Season watched toggle error:", error);
      setEpisodeError("Season could not be updated.");
    }
  };
  return (
    <View
      className="flex-1 bg-dark-200"
      style={{ paddingBottom: insets.bottom }}
    >
      <TouchableOpacity
        onPress={() =>
          router.canGoBack() ? router.back() : router.push("/(tabs)")
        }
        accessibilityLabel="Close"
        className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-black/50"
        style={{ top: insets.top + 8, zIndex: 10 }}
      >
        <X size={24} color="white" />
      </TouchableOpacity>

      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <DetailsHero
          item={item}
          contentType={contentType}
          onPosterPress={() => setPosterModalOpen(true)}
        />
        <Modal
          visible={posterModalOpen}
          transparent={false}
          onRequestClose={() => setPosterModalOpen(false)}
        >
          <View className="flex-1 bg-black justify-center items-center ">
            <TouchableOpacity
              onPress={() => setPosterModalOpen(false)}
              className="flex-1 w-full"
            >
              <Image
                source={{
                  uri: item?.poster_path
                    ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
                    : "https://placehold.co/400x600/1a1a1a/ffff.png",
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </Modal>
        {mediaObject && (
          <DetailsActions
            contentType={contentType}
            isWatched={isWatched}
            inWatchlist={inWatchlist}
            onWatchedPress={handleWatchedPress}
            onWatchlistPress={handleWatchlistPress}
            homepage={item?.homepage}
            imdbId={item?.imdb_id}
          />
        )}
        <View className="mt-4">
          <GenreChips
            item={item}
            onGenrePress={(genreId) => {
              setFilters({
                with_genres: [Number(genreId)],
                sort_by: "popularity.desc",
              });
              router.push("/(tabs)/search");
            }}
          />
        </View>
        <Divider dividerStyle={{ marginTop: 20, marginBottom: 10 }} />
        <OverviewText overview={item?.overview} />
        <Divider dividerStyle={{ marginTop: 10, marginBottom: 10 }} />

        {contentType === "tv" && (
          <>
            <SeasonEpisodeList
              seasons={visibleSeasons}
              episodesBySeason={seasonEpisodes}
              expandedSeason={expandedSeason}
              loadingSeason={loadingSeason}
              episodeError={episodeError}
              onSeasonPress={handleSeasonPress}
              onEpisodePress={handleEpisodeWatchedPress}
              onMarkSeasonWatched={handleMarkSeasonWatched}
            />
          </>
        )}
        {contentType === "tv" && (
          // Parent screen — replaces the old conditional block
          <View className="mt-5">
            {item?.last_episode_to_air && (
              <EpisodeHighlightCard
                label="Latest episode"
                episode={item.last_episode_to_air}
                spoiler
              />
            )}
            <EpisodeHighlightCard
              label="Next episode"
              episode={item?.next_episode_to_air}
              showCountdown
            />
          </View>
        )}

        <DetailsInfoGrid item={item} contentType={contentType} />
        <LogoRow
          title="Production"
          items={item?.production_companies}
          onItemPress={(companyId) => {
            setFilters({
              with_companies: [String(companyId)],
              sort_by: "popularity.desc",
            });
            router.push("/(tabs)/search");
          }}
        />
        {contentType === "tv" && (
          <LogoRow title="Networks" items={item?.networks} />
        )}
        {contentType === "tv" && <CreatorRow creators={item?.created_by} />}
        <Divider dividerStyle={{ marginTop: 10, marginBottom: 10 }} />
        <View className="flex-1 mt-5">
          <>
            {contentType === "movie" && !!collectionId && (
              <View>
                <Text className="text-lg text-accent font-bold mt-5 ">
                  {item?.belongs_to_collection?.name}
                </Text>
                <SideScrollList
                  contentType={contentType}
                  data={collectionData}
                  loading={collectionLoading}
                  error={collectionError}
                />
              </View>
            )}
            <View>
              <Text className="text-lg text-accent font-bold mt-5 ">
                Recommended Content
              </Text>
              <SideScrollList
                contentType={contentType}
                data={recommendationsData}
                loading={recommendationsLoading}
                error={recommendationsError}
              />
            </View>
            <View>
              <Text className="text-lg text-accent font-bold mt-5 ">
                Similar Content
              </Text>
              <SideScrollList
                contentType={contentType}
                data={similarData}
                loading={similarLoading}
                error={similarError}
              />
            </View>
          </>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsPage;
