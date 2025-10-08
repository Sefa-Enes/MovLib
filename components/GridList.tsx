import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import ContentCard from "./ContentCard";

const GridList = ({
  data,
  loading,
  error,
}: {
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

  return (
    <View className="flex-1 mt-5">
      <View>
        <Text className="text-lg text-accent font-bold mt-5 mb-3">
          Latest series
        </Text>

        <FlatList
          data={data}
          renderItem={({ item }) => <ContentCard {...item} isGrid={true} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "space-evenly", //, "space-between"
            gap: 5,
            marginBottom: 5,
          }}
          className="mt-2 pb-32"
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

export default GridList;
