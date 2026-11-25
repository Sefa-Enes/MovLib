// components/SettingEditor.tsx
import { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

// Düzenlenebilir bir değerin sözleşmesi.
export interface EditableSetting {
  get: () => string;
  getDefault: () => string;
  // Başarılıysa normalize edilmiş değeri, geçersizse null döner.
  set: (input: string) => Promise<string | null>;
  reset: () => Promise<void>;
}

interface Props {
  label: string;
  setting: EditableSetting;
  invalidMessage?: string;
  savedMessage?: string;
  resetMessage?: string;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  secureTextEntry?: boolean;
  // Kayıt veya sıfırlama başarılı olunca çağrılır (ör. cache temizleme).
  onChanged?: (value: string) => void;
}

type Feedback = { type: "ok" | "error"; text: string } | null;

export default function SettingEditor({
  label,
  setting,
  invalidMessage = "Geçersiz değer.",
  savedMessage = "Kaydedildi.",
  resetMessage = "Varsayılan değer geri yüklendi.",
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  onChanged,
}: Props) {
  const [value, setValue] = useState(setting.get());
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const onSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const saved = await setting.set(value);
      if (saved === null) {
        setFeedback({ type: "error", text: invalidMessage });
        return;
      }
      setValue(saved);
      setFeedback({ type: "ok", text: savedMessage });
      onChanged?.(saved);
    } catch {
      setFeedback({ type: "error", text: "Kaydedilemedi." });
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setting.reset();
      const def = setting.get();
      setValue(def);
      setFeedback({ type: "ok", text: resetMessage });
      onChanged?.(def);
    } catch {
      setFeedback({ type: "error", text: "Sıfırlanamadı." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-3 p-4">
      <Text className="text-base font-semibold text-white">{label}</Text>

      <TextInput
        className="rounded-lg border border-gray-600 px-3 py-2.5 text-white"
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setFeedback(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder ?? setting.getDefault()}
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
        Varsayılan: {setting.getDefault()}
      </Text>
    </View>
  );
}
