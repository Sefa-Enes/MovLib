import { MediaProvider } from "@/context/GlobalContext";
import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  return (
    <MediaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MediaProvider>
  );
}
