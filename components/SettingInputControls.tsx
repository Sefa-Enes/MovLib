// components/SettingControls.tsx
import Slider from "@react-native-community/slider";
import { Check, ChevronDown, RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { EditableSetting } from "./EditableSetting";

export interface SettingOption {
  value: string; // setting.set() fonksiyonuna giden değer
  label: string;
  color?: string;
}
function Swatch({ color }: { color: string }) {
  return (
    <View
      className="h-4 w-4 rounded border border-white/30"
      style={{ backgroundColor: color }}
    />
  );
}
interface BaseProps {
  label: string;
  setting: EditableSetting;
  invalidMessage?: string;
  savedMessage?: string;
  resetMessage?: string;
  onChanged?: (value: string) => void;
}

type Feedback = { type: "ok" | "error"; text: string } | null;

// Ortak mantık: kaydet, sıfırla, busy, feedback.
function useSettingField({
  setting,
  invalidMessage = "Invalid Value.",
  savedMessage = "Saved.",
  resetMessage = "Resetted to default.",
  onChanged,
}: Omit<BaseProps, "label">) {
  const [value, setValue] = useState(setting.get());
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const apply = async (input: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const saved = await setting.set(input);
      if (saved === null) {
        setFeedback({ type: "error", text: invalidMessage });
        return;
      }
      setValue(saved);
      setFeedback({ type: "ok", text: savedMessage });
      onChanged?.(saved);
    } catch {
      setFeedback({ type: "error", text: "Couldn't Save." });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setting.reset();
      const def = setting.get();
      setValue(def);
      setFeedback({ type: "ok", text: resetMessage });
      onChanged?.(def);
    } catch {
      setFeedback({ type: "error", text: "Couldn't Reset." });
    } finally {
      setBusy(false);
    }
  };

  return { value, busy, feedback, apply, reset };
}

// Ortak kabuk: başlık, sıfırlama butonu, feedback, default bilgisi.
function Shell({
  label,
  busy,
  feedback,
  defaultText,
  onReset,
  children,
}: {
  label: string;
  busy: boolean;
  feedback: Feedback;
  defaultText: string;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">{label}</Text>
        <Pressable
          className={`h-9 w-9 items-center justify-center rounded-lg bg-gray-700 ${
            busy ? "opacity-50" : ""
          }`}
          onPress={onReset}
          disabled={busy}
          accessibilityLabel="Reset to default"
        >
          <RotateCcw size={18} color="white" />
        </Pressable>
      </View>

      {children}

      {feedback && (
        <Text
          className={
            feedback.type === "error" ? "text-red-400" : "text-green-400"
          }
        >
          {feedback.text}
        </Text>
      )}
      <Text className="text-xs text-gray-500">Default: {defaultText}</Text>
    </View>
  );
}

const labelOf = (options: SettingOption[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

// ── Dropdown ────────────────────────────────────────────────────────────────
export function SettingDropdown({
  options,
  ...props
}: BaseProps & { options: SettingOption[] }) {
  const f = useSettingField(props);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === f.value);
  return (
    <Shell
      label={props.label}
      busy={f.busy}
      feedback={f.feedback}
      defaultText={labelOf(options, props.setting.getDefault())}
      onReset={f.reset}
    >
      <Pressable
        className={`h-11 flex-row items-center justify-between rounded-lg border border-gray-600 px-3 ${
          f.busy ? "opacity-50" : ""
        }`}
        onPress={() => setOpen(true)}
        disabled={f.busy}
        accessibilityRole="combobox"
      >
        {selected?.color && <Swatch color={selected.color} />}

        <Text className="text-white">{labelOf(options, f.value)}</Text>
        <ChevronDown size={18} color="white" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 p-6"
          onPress={() => setOpen(false)}
        >
          {/* İç Pressable: içeriğe dokunmak modalı kapatmasın */}
          <Pressable className="w-full max-w-sm overflow-hidden rounded-lg bg-gray-800">
            {options.map((o) => (
              <Pressable
                key={o.value}
                className="flex-row items-center justify-between px-4 py-3"
                onPress={() => {
                  setOpen(false);
                  if (o.value !== f.value) f.apply(o.value);
                }}
              >
                {" "}
                {o.color && <Swatch color={o.color} />}
                <Text className="text-white">{o.label}</Text>
                {o.value === f.value && <Check size={18} color="white" />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </Shell>
  );
}

// ── Radio ───────────────────────────────────────────────────────────────────
export function SettingRadioGroup({
  options,
  ...props
}: BaseProps & { options: SettingOption[] }) {
  const f = useSettingField(props);

  return (
    <Shell
      label={props.label}
      busy={f.busy}
      feedback={f.feedback}
      defaultText={labelOf(options, props.setting.getDefault())}
      onReset={f.reset}
    >
      <View className="gap-1" accessibilityRole="radiogroup">
        {options.map((o) => {
          const selected = o.value === f.value;
          return (
            <Pressable
              key={o.value}
              className={`flex-row items-center gap-3 py-2 ${
                f.busy ? "opacity-50" : ""
              }`}
              onPress={() => !selected && f.apply(o.value)}
              disabled={f.busy}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selected ? "border-blue-500" : "border-gray-500"
                }`}
              >
                {selected && (
                  <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                )}
              </View>
              <Text className="text-white">{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Shell>
  );
}

// ── Slider ──────────────────────────────────────────────────────────────────
export function SettingSlider({
  min,
  max,
  step,
  ...props
}: BaseProps & { min: number; max: number; step: number }) {
  const f = useSettingField(props);
  // Sürüklerken canlı değer. Kayıt sadece parmak kalkınca yapılır.
  const [draft, setDraft] = useState<number | null>(null);

  const decimals = (String(step).split(".")[1] ?? "").length;
  // Kayan nokta hatasını önler: 0.30000000000000004 → 0.3
  const round = (n: number) => Number(n.toFixed(decimals));
  const shown = draft ?? Number(f.value);

  return (
    <Shell
      label={props.label}
      busy={f.busy}
      feedback={f.feedback}
      defaultText={props.setting.getDefault()}
      onReset={f.reset}
    >
      <View className="flex-row items-center gap-3">
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={Number(f.value)}
          disabled={f.busy}
          onValueChange={(n) => setDraft(round(n))}
          onSlidingComplete={async (n) => {
            await f.apply(String(round(n)));
            setDraft(null);
          }}
        />
        <Text className="w-12 text-right text-white">
          {shown.toFixed(decimals)}
        </Text>
      </View>
    </Shell>
  );
}
