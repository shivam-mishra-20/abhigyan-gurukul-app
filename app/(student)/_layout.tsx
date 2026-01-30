import { AnimatedTabBar } from "@/components/animated-tab-bar";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
    BookOpen,
    GraduationCap,
    Home,
    MessageCircle,
} from "lucide-react-native";
import { useEffect } from "react";

export default function StudentLayout() {
  const { isDark } = useAppTheme();
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      getToken().then((token) => {
        if (token) {
          apiFetch("/api/notifications/register-token", {
            method: "POST",
            body: JSON.stringify({ pushToken: expoPushToken }),
          }).catch((err) => console.error("Failed to register token", err));
        }
      });
    }
  }, [expoPushToken]);

  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          activeTintColor={isDark ? "#6366F1" : "#059669"}
          inactiveTintColor={isDark ? "#A1A1AA" : "#9CA3AF"}
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
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="doubts"
        options={{
          title: "Doubts",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen
        name="modules"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen
        name="settings"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen name="attempt/[attemptId]" options={{ href: null }} />
      <Tabs.Screen name="result/[attemptId]" options={{ href: null }} />
      <Tabs.Screen name="course/[courseId]" options={{ href: null }} />
      <Tabs.Screen name="video/[lectureId]" options={{ href: null }} />
      <Tabs.Screen name="more/syllabus" options={{ href: null }} />
    </Tabs>
  );
}
