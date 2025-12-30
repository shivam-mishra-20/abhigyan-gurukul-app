import { AnimatedTabBar } from "@/components/animated-tab-bar";
import { useAppTheme } from "@/lib/context";
import { Tabs } from "expo-router";
import { BookOpen, GraduationCap, Home, User } from "lucide-react-native";

export default function StudentLayout() {
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
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
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
