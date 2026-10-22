// components/GridList.tsx
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ContentCard from "./ContentCard";

const COLUMN_GAP = 8; // horizontal space between cards
const ROW_GAP = 8; // vertical space between rows

const GridList = ({
  contentType,
  data,
  loading,
  error,
  showButton = true,
}: {
  contentType: "movie" | "tv";
  data: any;
  loading: boolean;
  error: Error | null;
  showButton?: boolean;
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
  const items = data ?? [];

  if (!items.length) {
    return (
      <View className="mt-15 px-5">
        <Text className="text-center text-gray-50">{"Nothing Found :("}</Text>
      </View>
    );
  }

  return (
    <View
      className="mt-5"
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: COLUMN_GAP,
        rowGap: ROW_GAP,
        paddingBottom: 120,
      }}
    >
      {items.map((item: any) => (
        <ContentCard
          key={item.id}
          {...item}
          contentType={contentType}
          isGrid={true}
          item={item}
        />
      ))}
    </View>
  );
};

export default GridList;
