import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// Rich green theme colors
const THEME = {
  primary: "#059669", // Emerald 600
  inactive: "#9ca3af",
};

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.inactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
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
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Hide other screens from tab bar - accessible via navigation */}
      <Tabs.Screen name="exams" options={{ href: null }} />
      <Tabs.Screen name="results" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="materials" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="attempt/[attemptId]" options={{ href: null }} />
      <Tabs.Screen name="result/[attemptId]" options={{ href: null }} />
      <Tabs.Screen name="course/[courseId]" options={{ href: null }} />
    </Tabs>
  );
}

