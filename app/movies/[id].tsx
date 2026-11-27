import DetailsPage from "@/components/Page/DetailsPage";
import { useMediaContext } from "@/context/GlobalContext";
import useFetch from "@/hooks/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const MovieDetails = () => {
  const { mediaObject, setMediaObject, filters, setFilters } =
    useMediaContext();
  const { id } = useLocalSearchParams();
  const contentType = "movie";

  // autoFetch'i kapattık, kontrol bizde
  const { data, loading, error, refetch } = useFetch(
    () => fetchMovieDetails({ id: Number(id) }),
    false,
  );

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id]);

  useEffect(() => {
    if (data && !mediaObject) {
      setMediaObject(data);
    }
  }, [data]);

  const routeId = Number(id);
  // Context içinde önceki filmden kalan veri olabilir. Sadece id eşleşirse kullan.
  const current =
    mediaObject && mediaObject.id === routeId ? mediaObject : data;

  if (!current) {
    return (
      <View className="flex-1 justify-center items-center bg-accent">
        {error ? (
          <Text>Error: {error.message}</Text>
        ) : (
          <ActivityIndicator size="large" color="#fff" />
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-accent">
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent">
      <DetailsPage
        detailData={data}
        setMediaObject={setMediaObject}
        contentType={contentType}
        mediaObject={current}
        setFilters={setFilters}
        refetchDetails={refetch}
      />
    </View>
  );
};

export default MovieDetails;
