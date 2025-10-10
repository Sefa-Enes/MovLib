import { useMediaContext } from "@/context/GlobalContext";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TvDetails = () => {
  const { mediaObject } = useMediaContext();
  console.log("Media obj " + mediaObject);

  return (
    <View className="flex justify-center items-center bg-dark-200 w-screen h-screen">
      <View className="flex-row  items-center w-[90%] h-20 mt-10 gap-x-1 justify-end">
        <TouchableOpacity
          onPress={router.back} //, implement all library
          className="flex-row items-center justify-center gap-x-2 h-10 w-10 rounded-full"
        >
          <X className="text-accent font-bold" size={36} />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1 p-5 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <View className="flex-row items-center justify-center w-full">
          <Text className="text-center font-bold text-3xl text-white w-full">
            {mediaObject?.name}
          </Text>
        </View>
        <View className="flex-row ">
          <TouchableOpacity>
            <Image
              source={{
                uri: mediaObject?.poster_path
                  ? `https://image.tmdb.org/t/p/w500${mediaObject.poster_path}`
                  : "https://placehold.co/600x400/1a1a1a/ffffff.png",
              }}
              resizeMode="cover"
              className={`rounded-lg mt-10 w-36 h-60`}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TvDetails;

const styles = StyleSheet.create({});
