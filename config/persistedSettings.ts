// config/persistedSetting.ts
import { EditableSetting } from "@/components/EditableSetting";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PersistedSetting extends EditableSetting {
  // Açılışta bir kez çağırın (ilk kullanımdan önce).
  init: () => Promise<void>;
}

export function createPersistedSetting({
  storageKey,
  defaultValue,
  normalize,
}: {
  storageKey: string;
  defaultValue: string;
  // Geçersizse null döner.
  normalize: (input: string) => string | null;
}): PersistedSetting {
  let current = defaultValue;

  return {
    get: () => current,
    getDefault: () => defaultValue,
    init: async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        current = (saved ? normalize(saved) : null) ?? defaultValue;
      } catch {
        current = defaultValue;
      }
    },
    set: async (input) => {
      const normalized = normalize(input);
      if (normalized === null) return null;
      await AsyncStorage.setItem(storageKey, normalized);
      current = normalized;
      return normalized;
    },
    reset: async () => {
      await AsyncStorage.removeItem(storageKey);
      current = defaultValue;
    },
  };
}
