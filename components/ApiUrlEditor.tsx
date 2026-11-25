// components/ApiUrlEditor.tsx
import {
  getApiUrl,
  getDefaultApiUrl,
  resetApiUrl,
  setApiUrl,
} from "@/services/api"; // api.ts dosyanızın gerçek yolunu yazın
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Feedback = { type: "ok" | "error"; text: string } | null;

export default function ApiUrlEditor() {
  const [value, setValue] = useState(getApiUrl());
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const onSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const saved = await setApiUrl(value);
      if (!saved) {
        setFeedback({
          type: "error",
          text: __DEV__
            ? "Geçersiz URL. Örnek: http://192.168.1.10:8080"
            : "Geçersiz URL. https:// ile başlamalı.",
        });
        return;
      }
      setValue(saved);
      setFeedback({
        type: "ok",
        text: "Kaydedildi. Verileri yenilemek için sayfaları aşağı çekin.",
      });
    } catch {
      setFeedback({ type: "error", text: "URL kaydedilemedi." });
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await resetApiUrl();
      setValue(getDefaultApiUrl());
      setFeedback({ type: "ok", text: "Varsayılan URL geri yüklendi." });
    } catch {
      setFeedback({ type: "error", text: "URL sıfırlanamadı." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-3 p-4">
      <Text className="text-base font-semibold text-white">API URL</Text>

      <TextInput
        className="rounded-lg border border-gray-600 px-3 py-2.5 text-white"
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setFeedback(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder={getDefaultApiUrl()}
        placeholderTextColor="#888"
        editable={!busy}
        returnKeyType="done"
        onSubmitEditing={onSave}
      />

      {feedback && (
        <Text
          className={
            feedback.type === "error" ? "text-red-400" : "text-green-400"
          }
        >
          {feedback.text}
        </Text>
      )}

      <View className="flex-row gap-3">
        <Pressable
          className={`flex-1 items-center rounded-lg bg-blue-600 py-3 ${
            busy ? "opacity-50" : ""
          }`}
          onPress={onSave}
          disabled={busy}
        >
          <Text className="font-semibold text-white">Kaydet</Text>
        </Pressable>

        <Pressable
          className={`flex-1 items-center rounded-lg bg-gray-700 py-3 ${
            busy ? "opacity-50" : ""
          }`}
          onPress={onReset}
          disabled={busy}
        >
          <Text className="font-semibold text-white">Varsayılana dön</Text>
        </Pressable>
      </View>

      <Text className="text-xs text-gray-500">
        Varsayılan: {getDefaultApiUrl()}
      </Text>
    </View>
  );
}
