import ApiUrlEditor from "@/components/ApiUrlEditor";
import SettingEditor from "@/components/EditableSetting";
import { SettingDropdown } from "@/components/SettingInputControls";
import {
  COLOR_OPTIONS,
  colorSettings,
  movieFadeOpacitySetting,
  softFadeOpacitySetting,
  tvFadeOpacitySetting,
} from "@/config/settings";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ColorSettingsList = () => (
  <>
    {Object.entries(colorSettings).map(([key, c]) => (
      <SettingDropdown
        key={key}
        label={c.label}
        setting={c.setting}
        options={COLOR_OPTIONS}
      />
    ))}
  </>
);
const profile = () => {
  return (
    <View className="flex-1 bg-dark-200">
      <Text className="text-xl text-white mt-3">Settings</Text>
      <ScrollView
        className="flex-1  px-2 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <View className="m-5 mb-20">
          <ApiUrlEditor />
          <SettingEditor
            label="Library Tv Fade Opacity Ratio (0 - 1)"
            setting={tvFadeOpacitySetting}
            keyboardType="decimal-pad"
            invalidMessage="Please pick a number between 0 and 1"
          />
          <SettingEditor
            label="Library Movie Fade Opacity Ratio (0 - 1)"
            setting={movieFadeOpacitySetting}
            keyboardType="decimal-pad"
            invalidMessage="Please pick a number between 0 and 1"
          />
          <SettingEditor
            label="Soft Fade Opacity Ratio (0 - 1)"
            setting={softFadeOpacitySetting}
            keyboardType="decimal-pad"
            invalidMessage="Please pick a number between 0 and 1"
          />
          <SettingDropdown
            label="Soft Fade Opacity Ratio (0 - 1)"
            setting={softFadeOpacitySetting}
            options={[
              { value: "0.1", label: "0.1" },
              { value: "0.7", label: "0.7" },
            ]}
          />
          <ColorSettingsList />;
        </View>
      </ScrollView>
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({});
