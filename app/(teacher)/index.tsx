import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useAppTheme, useToast } from "@/lib/context";
import { useDashboard } from "@/lib/hooks";

// Components
import { LoadingScreen } from "@/components/shared";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

interface StatItem {
  id: string;
  key: "totalExams" | "pendingReviews" | "totalStudents" | "totalPapers";
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface FeaturedAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

// ============================================================================
// Constants
// ============================================================================

const STAT_ITEMS: StatItem[] = [
  {
    id: "exams",
    key: "totalExams",
    title: "Total Exams",
    icon: "document-text",
    route: "/(teacher)/exams",
  },
  {
    id: "reviews",
    key: "pendingReviews",
    title: "Pending Reviews",
    icon: "time",
    route: "/(teacher)/reviews",
  },
  {
    id: "students",
    key: "totalStudents",
    title: "Total Students",
    icon: "people",
    route: "/(teacher)/students",
  },
  {
    id: "papers",
    key: "totalPapers",
    title: "Questions",
    icon: "library",
    route: "/(teacher)/create-paper",
  },
];

const FEATURED_ACTIONS: FeaturedAction[] = [
  {
    id: "create-exam",
    title: "Create New Exam",
    subtitle: "Build exam with AI assistance",
    icon: "add-circle",
    route: "/(teacher)/create-paper",
  },
  {
    id: "review-submissions",
    title: "Review Submissions",
    subtitle: "Grade pending student answers",
    icon: "checkmark-done-circle",
    route: "/(teacher)/reviews",
  },
  {
    id: "student-performance",
    title: "Student Performance",
    subtitle: "View analytics & insights",
    icon: "bar-chart",
    route: "/(teacher)/performance",
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function TeacherHome() {
  const router = useRouter();
  const toast = useToast();
  const { isDark } = useAppTheme();

  // Use our custom dashboard hook for data fetching
  const { stats, loading, refreshing, refetch, error } = useDashboard();

  // Handle refresh
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data");
    }
  }, [error, toast]);

  // Navigate to route
  const navigateTo = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Initial loading screen
  if (loading && !stats) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView
      className="bg-white dark:bg-dark-background h-screen"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8BC53F"]}
            tintColor="#8BC53F"
          />
        }
      >
        {/* Header */}
        <View className="px-2.5 py-5 mb-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {getGreeting()}
            </Text>
            <Text className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {stats?.teacherName || "Teacher"}
            </Text>
          </Animated.View>

          {/* Notification Icon */}
          <Pressable
            onPress={() => navigateTo("/(teacher)/notifications")}
            className="absolute top-8 right-4 w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={isDark ? "#F9FAFB" : "#374151"}
            />
            {stats?.pendingReviews ? (
              <View className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-primary-500 items-center justify-center px-1 border-2 border-white dark:border-dark-surface">
                <Text className="text-[9px] font-bold text-white">
                  {stats.pendingReviews}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Stats Grid */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-4 mb-6"
        >
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Overview
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {STAT_ITEMS.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(300 + index * 100).springify()}
                style={{
                  width: (SCREEN_WIDTH - 32 - 8) / 2,
                }}
              >
                <Pressable
                  onPress={() => navigateTo(item.route)}
                  className="bg-white dark:bg-dark-card rounded-2xl p-4 min-h-[110px] border border-gray-200 dark:border-gray-700"
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center mb-3 bg-primary-100 dark:bg-primary-900/30">
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isDark ? "#A3CF47" : "#6EA530"}
                    />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                    {loading ? "..." : stats?.[item.key] ?? 0}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    {item.title}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="px-4"
        >
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Quick Actions
          </Text>

          <View className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {FEATURED_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.id}
                entering={FadeInRight.delay(500 + index * 100).springify()}
              >
                <Pressable
                  onPress={() => navigateTo(action.route)}
                  className={`flex-row items-center p-4 ${
                    index < FEATURED_ACTIONS.length - 1
                      ? "border-b border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <View className="w-11 h-11 rounded-xl items-center justify-center mr-3 bg-primary-100 dark:bg-primary-900/30">
                    <Ionicons
                      name={action.icon}
                      size={22}
                      color={isDark ? "#A3CF47" : "#6EA530"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                      {action.title}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {action.subtitle}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
