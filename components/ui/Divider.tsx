import React from "react";
import { View } from "react-native";

interface DividerProps {
  width?: number;
  orientation?: "horizontal" | "vertical";
  color?: string;
  dividerStyle?: any;
  margin?: string;
}

const Divider: React.FC<DividerProps> = ({
  width = 1,
  orientation = "horizontal",
  color = "#DFE4EA",
  dividerStyle,
}) => {
  const dividerStyles = [
    { width: orientation === "horizontal" ? "full" : width },
    { height: orientation === "vertical" ? "full" : width },
    { backgroundColor: color },

    dividerStyle,
  ];

  return <View style={dividerStyles} />;
};

export default Divider;
