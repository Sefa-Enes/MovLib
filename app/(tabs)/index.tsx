import { colors } from "@/components/colors";
import SearchBox from "@/components/SearchBox";
import { useRouter } from "expo-router";

import { Image, ScrollView, View } from "react-native";
export default function Index() {
  const router = useRouter();

  return (
    <View className="flex justify-center items-center bg-dark-200 w-screen h-screen">
      <Image
        source={require("@/assets/images/bg-image.png")}
        className="absolute w-full z-0 opacity-25"
        resizeMode="cover"
      />
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          className="mx-auto mt-20 mb-5"
          resizeMode="contain"
          tintColor={colors.secondary}
          style={{ width: 200, height: 100 }}
        />
        <View className="flex-1 mt-5">
          <SearchBox
            onPress={() => router.push("/search")}
            placeholder="Search a movie or series"
          />
        </View>
      </ScrollView>
    </View>
  );
}
