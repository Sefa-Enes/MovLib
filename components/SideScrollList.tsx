import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import ContentCard from "./ContentCard";

const SideScrollList = ({
  contentType,
  data,
  loading,
  error,
}: {
  contentType: string;
  data: any;
  loading: boolean;
  error: Error | null;
}) => {
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="white"
        className="mt-10 self-center"
      />
    );
  }
  if (error) {
    return <Text>Error: {error?.message}</Text>;
  }

  const pathHead = contentType === "tv" ? "tv" : "movies";
  return (
    <View className="flex-1 mt-5">
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <ContentCard {...item} routes={`${pathHead}/${item.id}`} />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 5 }}
      />
    </View>
  );
};

export default SideScrollList;
