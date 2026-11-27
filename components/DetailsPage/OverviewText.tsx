// components/DetailsPage/OverviewText.tsx
import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

const COLLAPSE_THRESHOLD = 240; // chars; heuristic for ~4 lines

const OverviewText = ({ overview }: { overview?: string | null }) => {
  const [expanded, setExpanded] = useState(false);

  if (!overview) {
    return null;
  }

  const collapsible = overview.length > COLLAPSE_THRESHOLD;

  return (
    <>
      <Text
        className="text-gray-300 leading-6"
        numberOfLines={collapsible && !expanded ? 4 : undefined}
      >
        {overview}
      </Text>
      {collapsible && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          className="mt-1"
        >
          <Text className="text-primary font-medium">
            {expanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default OverviewText;
