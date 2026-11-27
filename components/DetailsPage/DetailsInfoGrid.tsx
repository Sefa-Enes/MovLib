// components/DetailsPage/DetailsInfoGrid.tsx
import { MediaItem } from "@/interface/interfaces";
import { formatDate, formatMoney, formatRuntime } from "@/utils/formatters";
import React from "react";
import { Text, View } from "react-native";

type Row = { label: string; value?: string | null };

const DetailsInfoGrid = ({
  item,
  contentType,
}: {
  item?: MediaItem;
  contentType: "movie" | "tv";
}) => {
  if (!item) {
    return null;
  }

  const languageName = (code?: string): string | undefined =>
    code
      ? (item.spoken_languages?.find((l) => l.iso_639_1 === code)
          ?.english_name ?? code.toUpperCase())
      : undefined;

  const spokenLanguages = item.spoken_languages
    ?.map((l) => l.english_name)
    .filter(Boolean)
    .join(", ");

  // Detail response has country names; fall back to codes from list items.
  const countries =
    item.production_countries?.map((c) => c.name).join(", ") ||
    item.origin_country?.join(", ");

  const episodeRuntime =
    item.episode_run_time?.[0] ?? item.last_episode_to_air?.runtime ?? null;

  const common: Row[] = [
    { label: "Original Language", value: languageName(item.original_language) },
    { label: "Spoken Languages", value: spokenLanguages },
    { label: "Country", value: countries },
    {
      label: "Popularity",
      value: item.popularity ? String(Math.round(item.popularity)) : undefined,
    },
  ];

  const rows: Row[] =
    contentType === "movie"
      ? [
          { label: "Status", value: item.status },
          { label: "Release Date", value: formatDate(item.release_date) },
          { label: "Runtime", value: formatRuntime(item.runtime) },
          { label: "Budget", value: formatMoney(item.budget) },
          { label: "Revenue", value: formatMoney(item.revenue) },
          ...common,
        ]
      : [
          { label: "Status", value: item.status },
          { label: "Type", value: item.type },
          { label: "First Air Date", value: formatDate(item.first_air_date) },
          { label: "Last Air Date", value: formatDate(item.last_air_date) },
          {
            label: "Seasons",
            value: item.number_of_seasons
              ? String(item.number_of_seasons)
              : undefined,
          },
          {
            label: "Episodes",
            value: item.number_of_episodes
              ? String(item.number_of_episodes)
              : undefined,
          },
          { label: "Episode Runtime", value: formatRuntime(episodeRuntime) },
          {
            label: "In Production",
            value:
              item.in_production === undefined
                ? undefined
                : item.in_production
                  ? "Yes"
                  : "No",
          },
          ...common,
        ];

  // formatters return "-" for missing values: hide those rows.
  const visibleRows = rows.filter((row) => !!row.value && row.value !== "-");

  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <View className="mt-5">
      <Text className="text-lg text-accent font-bold">Details</Text>
      <View className="flex-row flex-wrap mt-3">
        {visibleRows.map((row) => (
          <View key={row.label} className="w-1/2 pr-3 mb-3">
            <Text className="text-xs text-gray-400">{row.label}</Text>
            <Text className="text-white font-medium">{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DetailsInfoGrid;
