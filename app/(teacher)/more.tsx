import { useRouter } from "expo-router";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  LogOut,
  Megaphone,
  Settings,
  User,
  Users,
} from "lucide-react-native";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useAppTheme, useToast } from "@/lib/context";
import { useAuth } from "@/lib/hooks";

// ============================================================================
// Types
// ============================================================================

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

interface MenuCategory {
  title: string;
  icon: string;
  items: MenuItem[];
}

// ============================================================================
// Constants
// ============================================================================

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: "Classroom",
    icon: "school",
    items: [
      {
        id: "students",
        title: "Students",
        subtitle: "View & manage students",
        icon: "users",
        route: "/(teacher)/students",
      },
      {
        id: "batches",
        title: "Batches",
        subtitle: "Organize into groups",
        icon: "folder",
        route: "/(teacher)/batches",
      },
      {
        id: "performance",
        title: "Performance",
        subtitle: "Track progress & stats",
        icon: "chart",
        route: "/(teacher)/performance",
      },
      {
        id: "reviews",
        title: "Reviews",
        subtitle: "Test Reviews to grade",
        icon: "check",
        route: "/(teacher)/reviews",
      },
    ],
  },
  {
    title: "Communication",
    icon: "bell",
    items: [
      {
        id: "notifications",
        title: "Notifications",
        subtitle: "View all notifications",
        icon: "bell",
        route: "/(teacher)/notifications",
      },
      {
        id: "announcements",
        title: "Announcements",
        subtitle: "Send updates to students",
        icon: "megaphone",
        route: "/(teacher)/announcements",
      },
      {
        id: "doubts",
        title: "Student Doubts",
        subtitle: "Answer questions",
        icon: "help",
        route: "/(teacher)/doubts",
      },
    ],
  },
  {
    title: "Account & Settings",
    icon: "settings",
    items: [
      {
        id: "profile",
        title: "My Profile",
        subtitle: "View & edit profile",
        icon: "user",
        route: "/(teacher)/profile",
      },
      {
        id: "settings",
        title: "Settings",
        subtitle: "Preferences & notifications",
        icon: "settings",
        route: "/(teacher)/settings",
      },
    ],
  },
];

// ============================================================================
// Components
// ============================================================================

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
  isDark: boolean;
}

function MenuItemCard({ item, onPress, isDark }: MenuItemCardProps) {
  const iconColor = isDark ? "#6366F1" : "#059669"; // Indigo for dark, green for light
  const iconBg = isDark
    ? "rgba(99, 102, 241, 0.15)"
    : "rgba(5, 150, 105, 0.15)";

  const getIcon = (iconName: string) => {
    const iconProps = { size: 20, color: iconColor, strokeWidth: 2 };
    switch (iconName) {
      case "users":
        return <Users {...iconProps} />;
      case "folder":
        return <FolderOpen {...iconProps} />;
      case "chart":
        return <BarChart3 {...iconProps} />;
      case "check":
        return <CheckCircle2 {...iconProps} />;
      case "bell":
        return <Bell {...iconProps} />;
      case "megaphone":
        return <Megaphone {...iconProps} />;
      case "help":
        return <HelpCircle {...iconProps} />;
      case "user":
        return <User {...iconProps} />;
      case "settings":
        return <Settings {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-3 border-b border-gray-100 dark:border-gray-700"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        {getIcon(item.icon)}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-0.5">
          {item.title}
        </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {item.subtitle}
        </Text>
      </View>
      <ChevronRight
        size={18}
        color={isDark ? "#71717A" : "#9CA3AF"}
        strokeWidth={2}
      />
    </Pressable>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MoreScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const toast = useToast();
  const { isDark } = useAppTheme();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            toast.success("Logged out successfully");
            router.replace("/splash");
          } catch {
            toast.error("Failed to logout");
          }
        },
      },
    ]);
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-dark-background"
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 mt-4">
            <Pressable
              onPress={() => navigateTo("/(teacher)/profile")}
              className="flex-row items-center p-4"
            >
              <View className="mr-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(99, 102, 241, 0.15)"
                      : "rgba(5, 150, 105, 0.15)",
                  }}
                >
                  <User
                    size={28}
                    color={isDark ? "#6366F1" : "#059669"}
                    strokeWidth={2}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                  {user?.name || "Teacher"}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.email || "teacher@example.com"}
                </Text>
              </View>
              <ChevronRight
                size={20}
                color={isDark ? "#71717A" : "#9CA3AF"}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Menu Categories */}
        {MENU_CATEGORIES.map((category, categoryIndex) => (
          <Animated.View
            key={category.title}
            entering={FadeInDown.delay(200 + categoryIndex * 100).springify()}
            className="mb-6"
          >
            {/* Category Header */}
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {category.title}
            </Text>

            {/* Category Items */}
            <View className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {category.items.map((item, itemIndex) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(
                    300 + categoryIndex * 100 + itemIndex * 50
                  ).springify()}
                >
                  <MenuItemCard
                    item={item}
                    onPress={() => navigateTo(item.route)}
                    isDark={isDark}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center bg-white dark:bg-dark-card rounded-2xl p-3 border border-gray-200 dark:border-gray-700"
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-red-100 dark:bg-red-900/30">
              <LogOut
                size={20}
                color={isDark ? "#FCA5A5" : "#DC2626"}
                strokeWidth={2}
              />
            </View>
            <Text className="flex-1 text-base font-medium text-red-500 dark:text-red-400">
              Logout
            </Text>
            <ChevronRight
              size={18}
              color={isDark ? "#FCA5A5" : "#DC2626"}
              strokeWidth={2}
            />
          </Pressable>
        </Animated.View>

        {/* App Version */}
        <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
          Abhigyan Gurukul v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
