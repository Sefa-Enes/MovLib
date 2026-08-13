import { colors } from "@/components/colors";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Geometri tek kaynaktan türetilir.
 * Eş merkezli yuvarlaklık: PILL_RADIUS === BAR_RADIUS - BAR_PADDING
 */
export const BAR_HEIGHT = 64;
export const BAR_PADDING = 0;
export const BAR_SIDE_MARGIN = 16;
export const BAR_BOTTOM_GAP = 12;

const PILL_HEIGHT = BAR_HEIGHT - BAR_PADDING * 2;
const BAR_RADIUS = BAR_HEIGHT / 2;
const PILL_RADIUS = PILL_HEIGHT / 2;

const ICON_SIZE = 20;
const ICON_COLOR = "#FFFFFF";

const SPRING = { damping: 18, stiffness: 180, mass: 0.9 } as const;

type IconRenderer = (props: {
  focused: boolean;
  color: string;
  size: number;
}) => ReactNode;

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const hasSettled = useRef(false);

  const pillWidth = trackWidth > 0 ? trackWidth / state.routes.length : 0;

  useEffect(() => {
    if (pillWidth === 0) return;

    const target = state.index * pillWidth;

    // İlk ölçümde animasyon yok; pill 0'dan kayarak gelmesin.
    if (hasSettled.current) {
      translateX.value = withSpring(target, SPRING);
    } else {
      translateX.value = target;
      hasSettled.current = true;
    }
  }, [state.index, pillWidth, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={{
        position: "absolute",
        left: BAR_SIDE_MARGIN,
        right: BAR_SIDE_MARGIN,
        bottom: insets.bottom + BAR_BOTTOM_GAP,
        height: BAR_HEIGHT,
        borderRadius: BAR_RADIUS,
        backgroundColor: colors.secondary,
        padding: BAR_PADDING,
        overflow: "hidden",
      }}
    >
      <View
        onLayout={onTrackLayout}
        style={{ flex: 1, flexDirection: "row", alignItems: "stretch" }}
      >
        {pillWidth > 0 ? (
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: pillWidth,
                borderRadius: PILL_RADIUS,
                backgroundColor: colors.primary,
              },
              pillStyle,
            ]}
          />
        ) : null}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          if (!options.tabBarIcon) {
            throw new Error(
              `FloatingTabBar: "${route.name}" ekranında tabBarIcon tanımlı değil.`,
            );
          }

          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabButton
              key={route.key}
              focused={focused}
              label={options.title ?? route.name}
              renderIcon={options.tabBarIcon as IconRenderer}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabButtonProps = {
  focused: boolean;
  label: string;
  renderIcon: IconRenderer;
  onPress: () => void;
};

function TabButton({ focused, label, renderIcon, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 8,
      }}
    >
      {renderIcon({ focused, color: ICON_COLOR, size: ICON_SIZE })}

      {focused ? (
        <Animated.Text
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          numberOfLines={1}
          style={{ color: ICON_COLOR, fontWeight: "500", fontSize: 13 }}
        >
          {label}
        </Animated.Text>
      ) : null}
    </Pressable>
  );
}

/** Ekran içeriklerinin bar'ın altında kalmaması için kullanılacak boşluk. */
export function useTabBarSpacing() {
  const insets = useSafeAreaInsets();
  return BAR_HEIGHT + BAR_BOTTOM_GAP * 2 + insets.bottom;
}
