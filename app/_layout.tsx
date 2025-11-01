import { MediaProvider } from "@/context/GlobalContext";
import { initDB } from "@/db/database";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import "./globals.css";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const platform = Platform.OS === "web" ? "Web" : "Mobile";
        console.log(`🛠 ${platform} storage initialising...`);
        await initDB();
      } catch (err) {
        console.error("❌ Storage initialise error:", err);
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
        <Text className="text-white mt-4">
          {Platform.OS === "web"
            ? "Storage hazırlanıyor..."
            : "Veritabanı hazırlanıyor..."}
        </Text>
      </View>
    );
  }

  return (
    <MediaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MediaProvider>
  );
}
