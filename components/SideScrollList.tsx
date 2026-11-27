// SideScrollList.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import ContentCard from "./ContentCard";

const SCROLL_RATIO = 0.8; // her tıklamada görünür genişliğin %80'i

const SideScrollList = ({
  contentType,
  data,
  loading,
  error,
  isLibrary = false,
}: {
  contentType: string;
  data: any;
  loading: boolean;
  error: Error | null;
  isLibrary?: boolean;
}) => {
  const listRef = useRef<FlatList>(null);
  const [offset, setOffset] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const maxOffset = Math.max(contentWidth - layoutWidth, 0);
  const canScrollLeft = offset > 1;
  const canScrollRight = offset < maxOffset - 1;

  const scrollBy = useCallback(
    (direction: 1 | -1) => {
      const target = Math.min(
        Math.max(offset + direction * layoutWidth * SCROLL_RATIO, 0),
        maxOffset,
      );
      listRef.current?.scrollToOffset({ offset: target, animated: true });
    },
    [offset, layoutWidth, maxOffset],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffset(e.nativeEvent.contentOffset.x);
  };

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
    <View className="flex-1">
      <FlatList
        ref={listRef}
        data={data}
        renderItem={({ item }) => (
          <ContentCard
            {...item}
            contentType={contentType}
            item={item}
            isLibrary={isLibrary}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{}}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentWidth(w)}
      />

      {canScrollLeft && (
        <Pressable
          onPress={() => scrollBy(-1)}
          accessibilityLabel="Scroll left"
          className="absolute left-1 top-1/2 -mt-5 h-10 w-10 items-center justify-center rounded-full bg-black/60"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
      )}
      {canScrollRight && (
        <Pressable
          onPress={() => scrollBy(1)}
          accessibilityLabel="Scroll right"
          className="absolute right-1 top-1/2 -mt-5 h-10 w-10 items-center justify-center rounded-full bg-black/60"
        >
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>
      )}
    </View>
  );
};

export default SideScrollList;
