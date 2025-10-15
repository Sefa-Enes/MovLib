import { useEffect, useState } from "react";
import { Animated, View } from "react-native";

const ExpandableView = ({
  expanded = false,
  children,
  expheight = 200,
}: {
  expanded: boolean;
  children?: React.ReactNode;
  expheight?: number;
}) => {
  const [height] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(height, {
      toValue: expanded ? expheight : 0, // Fixed: expand when true
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [expanded, height]);

  return (
    <Animated.View style={{ height }}>
      {/* Only render children when expanded if you want to hide content completely */}
      {expanded && <View className="space-y-2">{children}</View>}
    </Animated.View>
  );
};

export default ExpandableView;
