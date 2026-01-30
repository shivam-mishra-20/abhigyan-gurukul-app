import { AnimatedTabBar } from "@/components/animated-tab-bar";
import { useAppTheme } from "@/lib/context";
import { Tabs } from "expo-router";
import { Compass, Home, Info, LogIn } from "lucide-react-native";

export default function GuestLayout() {
  const { isDark } = useAppTheme();

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
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, size }) => (
            <Info size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, size }) => (
            <LogIn size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
