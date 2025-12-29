import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Constants
import { COLORS } from "@/constants/colors";

// Hooks
import { useToast } from "@/lib/context";
import { useAuth } from "@/lib/hooks";

// ============================================================================
// Types
// ============================================================================

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface MenuCategory {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
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
        icon: "people",
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
        icon: "bar-chart",
        route: "/(teacher)/performance",
      },
    ],
  },
  {
    title: "Communication",
    icon: "chatbubbles",
    items: [
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
        icon: "help-circle",
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
        icon: "person",
        route: "/(teacher)/profile",
      },
      {
        id: "settings",
        title: "Settings",
        subtitle: "Preferences & notifications",
        icon: "cog",
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
}

function MenuItemCard({ item, onPress }: MenuItemCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-3 border-b border-gray-100 active:bg-gray-50"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${COLORS.primary}15` }}
      >
        <Ionicons name={item.icon} size={20} color={COLORS.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900 mb-0.5">
          {item.title}
        </Text>
        <Text className="text-xs text-gray-600">{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="bg-white rounded-2xl border border-gray-200 mb-6 mt-4">
            <Pressable
              onPress={() => navigateTo("/(teacher)/profile")}
              className="flex-row items-center p-4 active:bg-gray-50"
            >
              <View className="mr-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${COLORS.primary}15` }}
                >
                  <Ionicons name="person" size={28} color={COLORS.primary} />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-0.5">
                  {user?.name || "Teacher"}
                </Text>
                <Text className="text-xs text-gray-600">
                  {user?.email || "teacher@example.com"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.gray400}
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
            <Text className="text-base font-semibold text-gray-900 mb-2">
              {category.title}
            </Text>

            {/* Category Items */}
            <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
            className="flex-row items-center bg-white rounded-2xl p-3 border border-gray-200 active:bg-gray-50"
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${COLORS.error}15` }}
            >
              <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            </View>
            <Text className="flex-1 text-base font-medium text-red-500">
              Logout
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.error} />
          </Pressable>
        </Animated.View>

        {/* App Version */}
        <Text className="text-xs text-gray-400 text-center mt-6">
          Abhigyan Gurukul v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
