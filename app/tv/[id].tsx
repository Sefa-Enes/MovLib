import DetailsPage from "@/components/Page/DetailsPage";
import { useMediaContext } from "@/context/GlobalContext";
import useFetch from "@/hooks/useFetch";
import { fetchTvDetails } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const TvDetails = () => {
  const { mediaObject, setMediaObject, filters, setFilters } =
    useMediaContext();
  const { id } = useLocalSearchParams();
  const contentType = "tv";

  // autoFetch'i kapattık, kontrol bizde
  const { data, loading, error, refetch } = useFetch(
    () => fetchTvDetails({ id: Number(id) }),
    false,
  );

  // Sadece veri yoksa fetch et
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      setMediaObject(data);
    }
  }, [data, setMediaObject]);

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-accent">
        <ActivityIndicator size="large" color="#fff" />
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
        setMediaObject={setMediaObject}
        contentType={contentType}
        mediaObject={mediaObject || data}
        detailData={data}
        setFilters={setFilters}
        refetchDetails={refetch}
      />
    </View>
  );
};

export default TvDetails;
