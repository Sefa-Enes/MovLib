import { colors } from "@/components/colors";
import { Tabs } from "expo-router";
import { Home, Library, Search, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
const TabIcon = ({
  focused,
  title,
  icon: Icon,
}: {
  focused: boolean;
  title?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  if (focused) {
    return (
      // SafeAreaProvider'ı buradan kaldırdık
      <View className="flex flex-row w-28 h-[60px] justify-center items-center gap-2 rounded-full bg-primary">
        {/* min-h-[60px] yerine h-full kullandık. Bu sayede ebeveyninin yüksekliğine uyum sağlar. */}
        <Icon className="text-white" />
        <Text className="text-white font-medium">{title}</Text>
      </View>
    );
  } else {
    return (
      <View className="size-full justify-center items-center rounded-full">
        <Icon className="text-white" />
      </View>
    );
  }
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
        },
        tabBarStyle: {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          borderRadius: 50,
          marginHorizontal: 15,
          marginBottom: 20,
          height: 60, // <-- Yüksekliği 70'den 60'a düşürdük
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title={"Home"} icon={Home} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",

          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title={"Search"} icon={Search} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",

          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title={"Library"} icon={Library} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} title={"Profile"} icon={User} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
