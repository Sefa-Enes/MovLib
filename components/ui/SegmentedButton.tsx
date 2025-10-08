import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityState,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

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
  activeColor = "#2563eb",
  inactiveColor = "#6b7280",
  backgroundColor = "#e5e7eb",
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
      mass: 0.9,
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
      style={[
        styles.container,
        {
          backgroundColor,
          width: width ?? "100%",
          height,
          borderRadius: rounded ? height / 2 : 8,
        },
        containerStyle,
      ]}
      accessible
      accessibilityRole="tablist"
    >
      {/* Slider */}
      {containerWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slider,
            {
              width: segWidth,
              height,
              borderRadius: rounded ? height / 2 : 8,
              transform: [
                {
                  translateX: Animated.add(anim, new Animated.Value(0)),
                },
              ],
              backgroundColor: activeColor,
            },
          ]}
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
            style={({ pressed }) => [
              styles.segment,
              segmentStyle,
              {
                opacity: seg.disabled ? disabledOpacity : pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={a11yState}
            accessibilityLabel={seg.label ?? seg.key}
          >
            <View style={styles.centerContent}>
              {seg.node ? (
                seg.node
              ) : (
                <Text
                  style={[
                    isSelected
                      ? [styles.activeText, activeTextStyle]
                      : [styles.inactiveText, inactiveTextStyle],
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

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  slider: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeText: {
    fontWeight: "700",
    textAlign: "center",
  },
  inactiveText: {
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SegmentedControl;
