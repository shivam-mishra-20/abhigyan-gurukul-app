/**
 * Teacher Tab Layout
 *
 * Clean, focused tab navigation with only essential screens.
 * Secondary features accessible via "More" hub.
 */

import { SHADOWS, THEME } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.gray400,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.white,
          borderTopWidth: 1,
          borderTopColor: THEME.gray200,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 85 : 65,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Main Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: "Exams",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: "Reviews",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens - accessible via navigation from More or Home */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="create-paper" options={{ href: null }} />
      <Tabs.Screen name="batches" options={{ href: null }} />
      <Tabs.Screen name="students" options={{ href: null }} />
      <Tabs.Screen name="performance" options={{ href: null }} />
      <Tabs.Screen name="doubts" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="student-report" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="build-exam" options={{ href: null }} />
    </Tabs>
  );
}
