import { MediaProvider } from "@/context/GlobalContext";
import { initDB } from "@/db/database";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import "./globals.css";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        console.log("🛠 Database initialising...");
        await initDB();
      } catch (err) {
        console.error("❌ Database initialise error:", err);
      } finally {
        setIsReady(true);
      }
    };

    initializeDB();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Veritabanı hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <MediaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="movies/[id]" options={{ headerShown: false }} /> */}
      </Stack>
    </MediaProvider>
  );
}
