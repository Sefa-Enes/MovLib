// app/_layout.tsx
import { initSettings } from "@/config/settings";
import { MediaProvider } from "@/context/GlobalContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "./globals.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    initSettings().finally(() => {
      setSettingsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  // MediaProvider, ayarlar hazır olmadan mount edilmemeli.
  if (!settingsReady) return null;

  return (
    <MediaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MediaProvider>
  );
}
