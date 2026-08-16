import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import ContentCard from "./ContentCard";

const CARD_WIDTH = 144;
const CARD_HORIZONTAL_MARGIN = 8;
const COLUMN_GAP = 8;
const LIST_HORIZONTAL_PADDING = 20;
const GridList = ({
  contentType,
  data,
  loading,
  error,
}: {
  contentType: "movie" | "tv";
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
  const { width } = useWindowDimensions();
  const columnCount = useMemo(() => {
    const availableWidth = width - LIST_HORIZONTAL_PADDING * 2;

    const itemWidth = CARD_WIDTH + CARD_HORIZONTAL_MARGIN * 2 + COLUMN_GAP;

    return Math.max(1, Math.floor((availableWidth + COLUMN_GAP) / itemWidth));
  }, [width]);
  const pathHead = contentType === "tv" ? "tv" : "movies";
  return (
    <View className="flex-1 mt-5">
      <FlatList
        data={data ?? []}
        key={columnCount}
        renderItem={({ item }) => (
          <ContentCard
            {...item}
            contentType={contentType}
            isGrid={true}
            item={item}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={columnCount}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: COLUMN_GAP,
        }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
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
