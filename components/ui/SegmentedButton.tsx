import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityState,
  Animated,
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../colors";

type Segment = {
  key: string;
  label?: string;
  node?: React.ReactNode;
  disabled?: boolean;
};

type Props = {
  segments: Segment[];
  value?: string;
  onChange?: (key: string) => void;
  initialIndex?: number;
  width?: number;
  height?: number;
  containerStyle?: ViewStyle;
  segmentStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  inactiveTextStyle?: TextStyle;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  rounded?: boolean;
  disabledOpacity?: number;
};
/**
 * A customizable segmented control component for React Native + Web.
 *
 * - Supports animation between segments.
 * - Fully controlled or uncontrolled modes.
 * - Responsive to container width changes.
 *
 * @param {Object} props - Component props.
 * @param {Segment[]} props.segments - Segment definitions.
 * @param {string} [props.value] - Controlled selected segment key.
 * @param {(key: string) => void} [props.onChange] - Callback on change.
 *
 * @example
     <SegmentedControl
  segments={segments}
  value={mode} // kontrol edilen kullanım
  onChange={(k) => setMode(k)}
  containerStyle={{ marginBottom: 16 }}
  activeColor="#2563eb" // blue-600
  inactiveColor="#4b5563" // gray-700
  activeTextStyle={{ fontWeight: "700", color: "#fff" }}
  inactiveTextStyle={{ fontWeight: "600" }}
/>;
 * @example
<SegmentedControl
  segments={[
    { key: "movie", label: "Movie" },
    { key: "tv", label: "Tv" },
  ]}
  value={contentType}
  width={300}
  initialIndex={1}
  onChange={(key) => setContentType(key as "movie" | "tv")}
/>; 
 */

const SegmentedControl: React.FC<Props> = ({
  segments,
  value,
  onChange,
  initialIndex = 0,
  width,
  height = 44,
  containerStyle,
  segmentStyle,
  activeTextStyle,
  inactiveTextStyle,
  activeColor = colors.primary,
  inactiveColor = colors.accent,
  backgroundColor = colors.secondary,
  rounded = true,
  disabledOpacity = 0.5,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(
    value ??
      (segments[initialIndex] && segments[initialIndex].key) ??
      segments[0].key
  );

  const [containerWidth, setContainerWidth] = useState<number>(width ?? 0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (typeof value !== "undefined" && value !== selectedKey) {
      setSelectedKey(value);
    }
  }, [value]);

  useEffect(() => {
    if (!containerWidth) return;
    const index = segments.findIndex((s) => s.key === selectedKey);
    const segWidth = containerWidth / segments.length;
    Animated.spring(anim, {
      toValue: index * segWidth,
      useNativeDriver: false,
      stiffness: 240,
      damping: 18,
      mass: 0.3,
    }).start();
  }, [selectedKey, containerWidth, segments.length]);

  const handleLayout = (e: any) => {
    if (!width) {
      const measuredWidth = e.nativeEvent.layout.width;
      if (measuredWidth !== containerWidth) {
        setContainerWidth(measuredWidth);
      }
    }
  };

  const handlePress = (seg: Segment) => {
    if (seg.disabled) return;
    if (value === undefined) setSelectedKey(seg.key);
    onChange?.(seg.key);
  };

  const segWidth = containerWidth ? containerWidth / segments.length : 0;

  return (
    <View
      onLayout={handleLayout}
      className={`flex-row self-center mt-5 items-center justify-between relative overflow-hidden ${
        rounded ? "rounded-full" : ""
      }`}
      style={[{ backgroundColor, height, width }, containerStyle]}
      accessible
      accessibilityRole="tablist"
    >
      {/* Slider */}
      {segWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          //   className={`absolute top-0 left-0 ${rounded ? "rounded-full" : ""}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: rounded ? 9999 : 0,
            width: segWidth,
            height,
            backgroundColor: activeColor,
            transform: [{ translateX: anim }],
          }}
        />
      )}

      {/* Segments */}
      {segments.map((seg) => {
        const isSelected = seg.key === selectedKey;
        const a11yState: AccessibilityState = {
          selected: isSelected,
          disabled: !!seg.disabled,
        };

        return (
          <Pressable
            key={seg.key}
            onPress={() => handlePress(seg)}
            className="flex-1 justify-center items-center z-10"
            style={({ pressed }) => [
              segmentStyle,
              {
                opacity: seg.disabled ? disabledOpacity : pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={a11yState}
            accessibilityLabel={seg.label ?? seg.key}
          >
            <View className="items-center justify-center">
              {seg.node ? (
                seg.node
              ) : (
                <Text
                  className={`text-center font-semibold ${
                    isSelected ? "font-bold" : ""
                  }`}
                  style={[
                    isSelected ? activeTextStyle : inactiveTextStyle,
                    { color: isSelected ? "#fff" : inactiveColor },
                  ]}
                >
                  {seg.label}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;
