// config/settings.ts
import { initApiUrl } from "@/services/api"; // api.ts dosyanızın gerçek yolunu yazın
import { createPersistedSetting } from "./persistedSettings";

export const tvFadeOpacitySetting = createPersistedSetting({
  storageKey: "dim_ratio_override",
  defaultValue: "0.8",
  normalize: (input) => {
    // Bazı klavyeler ondalık ayraç olarak virgül gönderir.
    const n = Number(input.trim().replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= 1 ? String(n) : null;
  },
});

// Kullanım yerinde sayı olarak okumak için.
export const getTvFadeOpacity = (): number =>
  Number(tvFadeOpacitySetting.get());

// Yeni ayar eklenince sadece bu listeye ekleyin.
export const initSettings = async (): Promise<void> => {
  await Promise.all([initApiUrl(), tvFadeOpacitySetting.init()]);
};
