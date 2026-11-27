// components/home/SectionHeader.tsx
import React from "react";
import { Text, View } from "react-native";

const SectionHeader = ({ title }: { title: string }) => (
  <View className="flex-row items-center">
    <View className="w-1 h-5 rounded-full bg-primary mr-2" />
    <Text className="text-lg text-accent font-bold">{title}</Text>
  </View>
);

export default SectionHeader;
