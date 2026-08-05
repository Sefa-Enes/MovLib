import {
  deleteMovie,
  deleteTvShow,
  getEpisodesBySeason,
  getMovieById,
  getSeasonProgress,
  getTvProgress,
  getTvShowById,
  insertMovieWithGenres,
  insertTvWithGenres,
  toggleEpisodeWatched,
  toggleMovieWatched,
  toggleTvWatched,
  upsertTvEpisodes,
} from "@/helpers/databaseHelper";
import useFetch from "@/hooks/useFetch";
import {
  MediaItem,
  Movie,
  SeasonProgress,
  Tv,
  UnitedWithDb,
  WatchedTvEpisode,
} from "@/interface/interfaces";
import { fetchSimilar, fetchTvSeasonEpisodes } from "@/services/api";
import { isEpisodeAired } from "@/utils/episodeHelpers";
import { DiscoverMovieFilters } from "@/utils/queryBuilder";
import { router } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RenderListItems } from "../CategoryClickable";
import SeasonEpisodeList from "../Episodes/SeasonEpisodeList";
import SideScrollList from "../SideScrollList";
import Divider from "../ui/Divider";
import ExpandableView from "../ui/ExpandableView";

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
  const [detailDrawer, setDetailDrawer] = useState<boolean>(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  const [fromDb, setFromDb] = useState<UnitedWithDb | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  const [seasonEpisodes, setSeasonEpisodes] = useState<
    Record<number, WatchedTvEpisode[]>
  >({});
  const [seasonProgress, setSeasonProgress] = useState<
    Record<number, SeasonProgress>
  >({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);

  const [episodeError, setEpisodeError] = useState<string | null>(null);

  const [tvProgress, setTvProgress] = useState({
    totalEpisodes: 0,
    watchedEpisodes: 0,
    percentage: 0,
  });
  // 🔹 DB'den mevcut durumu al
  useEffect(() => {
    if (mediaObject) {
      const fetchData = async () => {
        try {
          const data =
            contentType === "movie"
              ? await getMovieById(mediaObject.id)
              : await getTvShowById(mediaObject.id);
          setFromDb(data as UnitedWithDb);
          setInWatchlist(!!data);
          setIsWatched(!!data?.isWatched);
        } catch (err) {
          console.error("DB fetch error:", err);
        }
      };

      fetchData();
    }
  }, [mediaObject, contentType]);

  useEffect(() => {
    if (
      contentType !== "tv" ||
      !mediaObject?.id ||
      !detailData?.seasons ||
      detailData.seasons.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const loadStoredSeasonData = async () => {
      try {
        const entries = await Promise.all(
          detailData.seasons!.map(async (season) => {
            const seasonNumber = season.season_number;

            const [episodes, progress] = await Promise.all([
              getEpisodesBySeason(mediaObject.id, seasonNumber),
              getSeasonProgress(mediaObject.id, seasonNumber),
            ]);

            return {
              seasonNumber,
              episodes,
              progress,
            };
          }),
        );

        if (cancelled) {
          return;
        }

        const episodeMap: Record<number, WatchedTvEpisode[]> = {};

        const progressMap: Record<number, SeasonProgress> = {};

        entries.forEach(({ seasonNumber, episodes, progress }) => {
          episodeMap[seasonNumber] = episodes;
          progressMap[seasonNumber] = progress;
        });

        setSeasonEpisodes(episodeMap);
        setSeasonProgress(progressMap);
      } catch (error) {
        console.error("Stored season data fetch error:", error);
      }
    };

    loadStoredSeasonData();

    return () => {
      cancelled = true;
    };
  }, [contentType, mediaObject?.id, detailData?.seasons]);

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
    if (mediaObject) {
      refetch();
    }
  }, [mediaObject]);
  useEffect(() => {
    if (contentType !== "tv" || !mediaObject) {
      return;
    }

    const loadTvProgress = async () => {
      try {
        const progress = await getTvProgress(mediaObject.id);
        setTvProgress(progress);
      } catch (error) {
        console.error("TV progress fetch error:", error);
      }
    };

    loadTvProgress();
  }, [contentType, mediaObject]);

  const loadSeasonEpisodes = async (seasonNumber: number) => {
    if (!mediaObject || contentType !== "tv") {
      return;
    }

    // Daha önce yüklenmişse tekrar API çağrısı yapma
    if (seasonEpisodes[seasonNumber]) {
      return;
    }

    try {
      setLoadingSeason(seasonNumber);
      setEpisodeError(null);

      const fetchedEpisodes = await fetchTvSeasonEpisodes({
        tvId: mediaObject.id,
        seasonNumber,
      });

      await upsertTvEpisodes(mediaObject.id, fetchedEpisodes);

      const savedEpisodes = await getEpisodesBySeason(
        mediaObject.id,
        seasonNumber,
      );

      setSeasonEpisodes((previous) => ({
        ...previous,
        [seasonNumber]: savedEpisodes,
      }));

      const progress = await getTvProgress(mediaObject.id);

      setTvProgress(progress);
    } catch (error) {
      console.error("Season episodes fetch error:", error);

      setEpisodeError(
        error instanceof Error
          ? error.message
          : "Episodes could not be loaded.",
      );
    } finally {
      setLoadingSeason(null);
    }
  };
  const handleSeasonPress = async (seasonNumber: number) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }

    setExpandedSeason(seasonNumber);

    await loadSeasonEpisodes(seasonNumber);
  };
  const handleEpisodeWatchedPress = async (episode: WatchedTvEpisode) => {
    if (!mediaObject || contentType !== "tv") {
      return;
    }
    if (!isEpisodeAired(episode.air_date)) {
      return;
    }
    try {
      await toggleEpisodeWatched({
        tvId: mediaObject.id,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
        watched: !episode.isWatched,
      });

      const updatedEpisodes = await getEpisodesBySeason(
        mediaObject.id,
        episode.season_number,
      );

      setSeasonEpisodes((previous) => ({
        ...previous,
        [episode.season_number]: updatedEpisodes,
      }));

      const progress = await getTvProgress(mediaObject.id);

      setTvProgress(progress);
      const updatedSeasonProgress = await getSeasonProgress(
        mediaObject.id,
        episode.season_number,
      );

      setSeasonProgress((previous) => ({
        ...previous,
        [episode.season_number]: updatedSeasonProgress,
      }));
    } catch (error) {
      console.error("Episode watched toggle error:", error);
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
      let episodes = seasonEpisodes[seasonNumber];

      // Sezon daha önce açılmadıysa önce bölümleri yükle
      if (!episodes) {
        const fetchedEpisodes = await fetchTvSeasonEpisodes({
          tvId: mediaObject.id,
          seasonNumber,
        });

        await upsertTvEpisodes(mediaObject.id, fetchedEpisodes);

        episodes = await getEpisodesBySeason(mediaObject.id, seasonNumber);

        setSeasonEpisodes((previous) => ({
          ...previous,
          [seasonNumber]: episodes ?? [],
        }));
      }

      const airedEpisodes =
        episodes?.filter((episode) => isEpisodeAired(episode.air_date)) ?? [];

      for (const episode of airedEpisodes) {
        await toggleEpisodeWatched({
          tvId: mediaObject.id,
          seasonNumber,
          episodeNumber: episode.episode_number,
          watched,
        });
      }

      const updatedEpisodes = await getEpisodesBySeason(
        mediaObject.id,
        seasonNumber,
      );

      setSeasonEpisodes((previous) => ({
        ...previous,
        [seasonNumber]: updatedEpisodes,
      }));

      const progress = await getTvProgress(mediaObject.id);

      setTvProgress(progress);

      const updatedSeasonProgress = await getSeasonProgress(
        mediaObject.id,
        seasonNumber,
      );

      setSeasonProgress((previous) => ({
        ...previous,
        [seasonNumber]: updatedSeasonProgress,
      }));
    } catch (error) {
      console.error("Season watched toggle error:", error);
    }
  };

  return (
    <View
      className="flex-1 bg-dark-200"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center w-[95%] h-20 gap-x-1 justify-end">
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.push("/(tabs)")
          }
          className="flex-row items-center justify-center gap-x-2 h-10 w-10 rounded-full"
        >
          <X className="text-accent font-bold" size={36} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center justify-center w-full mb-4">
          <Text className="text-center font-bold text-3xl text-white flex-wrap">
            {mediaObject?.title || mediaObject?.name}
          </Text>
        </View>

        <View id="upperSection" className="flex-row mt-6 gap-3">
          <TouchableOpacity
            className="shrink-0"
            onPress={() => setPosterModalOpen(true)}
          >
            <Image
              source={{
                uri: mediaObject?.poster_path
                  ? `https://image.tmdb.org/t/p/w500${mediaObject.poster_path}`
                  : "https://placehold.co/400x600/1a1a1a/ffffff.png",
              }}
              resizeMode="contain"
              className="rounded-lg w-44 h-60"
            />
          </TouchableOpacity>
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
                    uri: mediaObject?.poster_path
                      ? `https://image.tmdb.org/t/p/w500${mediaObject.poster_path}`
                      : "https://placehold.co/400x600/1a1a1a/ffffff.png",
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </Modal>
          <View className="flex-1 flex-col gap-2">
            {/* Yayın Tarihi */}
            {mediaObject?.release_date && (
              <Text className="text-gray-300" numberOfLines={2}>
                Release Date:{" "}
                <Text className="text-white font-medium">
                  {new Date(mediaObject.release_date).toLocaleDateString()}
                </Text>
              </Text>
            )}

            {/* Kullanıcı Oylaması */}
            <View className="flex-row items-center flex-wrap">
              <Text className="text-yellow-400 font-bold">
                ⭐ {mediaObject?.vote_average?.toFixed(1)}
              </Text>
              <Text className="text-gray-400 ml-2">
                ({mediaObject?.vote_count} votes)
              </Text>
            </View>

            {/* Kategori */}
            <View className="flex flex-wrap flex-row">
              {/* <Text className="text-gray-300 mb-1">Category: </Text> */}
              <RenderListItems
                header="Category: "
                ids={
                  mediaObject?.genre_ids ||
                  mediaObject?.genres?.map((g) => ("id" in g ? g.id : g))
                }
                onGenrePress={(genreId) => {
                  setFilters({
                    with_genres: [Number(genreId)],
                    sort_by: "popularity.desc",
                  });
                  router.push("/(tabs)/search");
                }}
              />
            </View>

            {/* Popülerlik */}
            {mediaObject?.popularity && (
              <Text className="text-gray-300" numberOfLines={1}>
                Popularity:{" "}
                <Text className="text-white font-medium">
                  {Math.round(mediaObject.popularity)}
                </Text>
              </Text>
            )}

            {mediaObject?.original_language && (
              <Text className="text-gray-300  " numberOfLines={1}>
                Language:{" "}
                <Text className="text-white  uppercase font-medium">
                  {mediaObject.original_language}
                </Text>
              </Text>
            )}

            {mediaObject?.adult && (
              <Text className="text-gray-300  " numberOfLines={1}>
                🔞 Adult Content
              </Text>
            )}

            {mediaObject && (
              <>
                {contentType === "movie" && (
                  <View className="w-full">
                    <TouchableOpacity
                      onPress={handleWatchedPress}
                      className={`flex-row gap-2 justify-center rounded-lg p-1 ${
                        !isWatched ? "bg-secondary" : "bg-primary"
                      }`}
                    >
                      <Eye size={18} color={isWatched ? "white" : "darkgray"} />

                      <Text>{isWatched ? "Watched" : "Not Watched"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View className="w-full ">
                  <TouchableOpacity
                    onPress={handleWatchlistPress}
                    className={`flex flex-row gap-2 justify-center rounded-lg p-1 ${
                      !inWatchlist ? "bg-secondary" : "bg-primary"
                    }`}
                  >
                    {inWatchlist ? (
                      <Check size={18} color="white" />
                    ) : (
                      <Plus size={18} className="text-accent" />
                    )}
                    <Text>{inWatchlist ? "Added To List" : "Not Added"}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
        <Divider dividerStyle={{ marginTop: 20, marginBottom: 10 }}></Divider>
        <View>
          <ExpandableView expanded={detailDrawer} expheight={200}>
            {/* Production Companies */}
            {detailData?.production_companies && (
              <View className="flex flex-wrap flex-row">
                <RenderListItems
                  header="Production: "
                  ids={detailData?.production_companies?.map((g) =>
                    "id" in g ? g.id : g,
                  )}
                  onGenrePress={(companyName) => {
                    setFilters({
                      with_companies: [String(companyName)],
                      sort_by: "popularity.desc",
                    });
                    router.push("/(tabs)/search");
                  }}
                  idList={detailData?.production_companies?.reduce(
                    (acc, item) => {
                      acc[item.id] = item.name; // id → name eşle
                      return acc;
                    },
                    {} as Record<number, string>,
                  )}
                />
              </View>
            )}

            {/* Budget */}
            {detailData?.budget ? (
              <View className="flex flex-wrap flex-row">
                <Text className="text-gray-300">
                  Budget:{" "}
                  <Text className="text-white">
                    ${detailData.budget / 1000000}M
                  </Text>
                </Text>
              </View>
            ) : null}
            {/* Revenue */}
            {detailData?.revenue ? (
              <View className="flex flex-wrap flex-row">
                <Text className="text-gray-300">
                  Revenue:{" "}
                  <Text className="text-white">
                    ${(detailData.revenue / 1000000).toFixed(2)}M
                  </Text>
                </Text>
              </View>
            ) : null}
          </ExpandableView>

          <TouchableOpacity
            onPress={() => {
              setDetailDrawer(!detailDrawer);
              !detailData && refetchDetails();
            }}
            className="flex-row items-top justify-center mt-2"
          >
            {!detailDrawer ? (
              <>
                <ChevronDown className="text-white" />
                <Text className="ml-3 text-gray-300 font-medium">
                  More Details
                </Text>
              </>
            ) : (
              <>
                <ChevronUp className="text-white" />
                <Text className="ml-3 text-gray-300 font-medium">
                  Less Details
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <Divider dividerStyle={{ marginTop: 10, marginBottom: 10 }}></Divider>
        {contentType === "tv" && (
          <>
            <Divider
              dividerStyle={{
                marginTop: 10,
                marginBottom: 10,
              }}
            />

            <SeasonEpisodeList
              seasons={detailData?.seasons ?? []}
              episodesBySeason={seasonEpisodes}
              seasonProgress={seasonProgress}
              expandedSeason={expandedSeason}
              loadingSeason={loadingSeason}
              episodeError={episodeError}
              onSeasonPress={handleSeasonPress}
              onEpisodePress={handleEpisodeWatchedPress}
              onMarkSeasonWatched={handleMarkSeasonWatched}
            />
          </>
        )}
        <View className="flex-row">
          {mediaObject?.overview && (
            <Text className="text-gray-300">
              {" "}
              <Text className="text-gray font-medium">
                {mediaObject.overview}
              </Text>
            </Text>
          )}
        </View>
        <Divider dividerStyle={{ marginTop: 10, marginBottom: 10 }} />
        <View className="flex-1 mt-5">
          <>
            <Text className="text-lg text-accent font-bold mt-5 ">
              Similar Content
            </Text>
            <SideScrollList
              contentType={contentType}
              data={similarData}
              loading={similarLoading}
              error={similarError}
            />
          </>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsPage;
