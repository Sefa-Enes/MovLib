import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import ContentCard from "./ContentCard";

const GridList = ({
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
          <ContentCard
            {...item}
            contentType={contentType}
            isGrid={true}
            item={item}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-evenly", //, "space-between"
          gap: 5,
          marginBottom: 5,
        }}
        className="mt-2 pb-32"
        scrollEnabled={false}
        ListEmptyComponent={
          !loading &&
          !error && (
            <View className="mt-15 px-5">
              <Text className="text-center text-gray-50">
                {"Nothing Found :("}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default GridList;
