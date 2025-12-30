import { Tabs } from "expo-router";
import { Compass, Home } from "lucide-react-native";
import React from "react";

import { AnimatedTabBar } from "@/components/animated-tab-bar";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          activeTintColor={isDark ? "#6366F1" : "#059669"} // Indigo for dark, green for light
          inactiveTintColor={isDark ? "#A1A1AA" : "#6B7280"}
          backgroundColor={isDark ? "#27272A" : "#FFFFFF"}
          isDark={isDark}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
