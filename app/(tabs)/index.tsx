import { Image, Text, View } from "react-native";
export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-dark-100">
      <Image
        source={require("@/assets/images/bg-image.png")}
        className="absolute w-full z-0 opacity-25"
        resizeMode="cover"
      />

      <Text className="text-3xl text-primary font-bold">Müşerrefesssll!</Text>
      <Text className="text-3xl text-dark-100 font-bold">Müşerref Olduk!</Text>
    </View>
  );
}
