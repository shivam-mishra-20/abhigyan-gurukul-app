import { AnimatedTabBar } from "@/components/animated-tab-bar";
import { useAppTheme } from "@/lib/context";
import { Tabs } from "expo-router";
import {
  CircleHelp,
  ClipboardCheck,
  FilePlus,
  Home,
  LayoutGrid,
} from "lucide-react-native";
import React from "react";

export default function TeacherLayout() {
  const { isDark } = useAppTheme();

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
      {/* Main Tabs - Using folder structure */}
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
        name="exam"
        options={{
          title: "Exams",
          tabBarIcon: ({ color, size }) => (
            <ClipboardCheck size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <FilePlus size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="doubts"
        options={{
          title: "Doubts",
          tabBarIcon: ({ color, size }) => (
            <CircleHelp size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
