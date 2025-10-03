import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Home, Library, Search, User, ZoomIn } from "lucide-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Background } from "@react-navigation/elements";
import { colors } from "@/components/colors";
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
      <SafeAreaProvider>
        <View className="flex flex-row  w-[120px] min-h-12 justify-center items-center gap-2 rounded-full bg-primary px-4 py-2">
          <Icon className="text-white" />
          <Text className="text-white font-medium">{title}</Text>
        </View>
      </SafeAreaProvider>
    );
  } else {
    return (
      <SafeAreaProvider>
        <View className=" px-4 py-2">
          <Icon className="text-white" />
        </View>
      </SafeAreaProvider>
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
        },
        tabBarStyle: {
          backgroundColor: colors.secondary,
          borderRadius: 50,
          marginHorizontal: 15,
          marginBottom: 20,
          height: 60,
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
