import ApiUrlEditor from "@/components/ApiUrlEditor";
import SettingEditor from "@/components/EditableSetting";
import { tvFadeOpacitySetting } from "@/config/settings";
import React from "react";
import { StyleSheet, View } from "react-native";

const profile = () => {
  return (
    <View className="flex-1 justify-center items-center bg-dark-200">
      <ApiUrlEditor />

      <SettingEditor
        label="Karartma oranı (0 - 1)"
        setting={tvFadeOpacitySetting}
        keyboardType="decimal-pad"
        invalidMessage="0 ile 1 arasında bir sayı girin."
      />
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({});
