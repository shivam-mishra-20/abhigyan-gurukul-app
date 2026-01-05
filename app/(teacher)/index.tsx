import { useRouter } from "expo-router";
import {
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Library,
  PlusCircle,
  Users
} from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useToast } from "@/lib/context";
import { useDashboard } from "@/lib/hooks";

interface StatItem {
  id: string;
  key: "totalExams" | "pendingReviews" | "totalStudents" | "totalPapers";
  title: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  route: string;
}

interface FeaturedAction {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  route: string;
}

const STAT_ITEMS: StatItem[] = [
  {
    id: "exams",
    key: "totalExams",
    title: "Total Exams",
    icon: BookOpen,
    iconColor: "#10b981",
    bgColor: "#d1fae5",
    route: "/(teacher)/exam",
  },
  {
    id: "reviews",
    key: "pendingReviews",
    title: "Pending Reviews",
    icon: ClipboardCheck,
    iconColor: "#f59e0b",
    bgColor: "#fef3c7",
    route: "/(teacher)/more/reviews",
  },
  {
    id: "students",
    key: "totalStudents",
    title: "Total Students",
    icon: Users,
    iconColor: "#3b82f6",
    bgColor: "#dbeafe",
    route: "/(teacher)/students",
  },
  {
    id: "papers",
    key: "totalPapers",
    title: "Questions",
    icon: Library,
    iconColor: "#9333ea",
    bgColor: "#e9d5ff",
    route: "/(teacher)/create",
  },
];

const FEATURED_ACTIONS: FeaturedAction[] = [
  {
    id: "create-exam",
    title: "Create New Exam",
    subtitle: "Build exam with AI assistance",
    icon: PlusCircle,
    iconColor: "#10b981",
    bgColor: "#d1fae5",
    route: "/(teacher)/create",
  },
  {
    id: "review-submissions",
    title: "Review Submissions",
    subtitle: "Grade pending student answers",
    icon: CheckCircle,
    iconColor: "#3b82f6",
    bgColor: "#dbeafe",
    route: "/(teacher)/more/reviews",
  },
  {
    id: "student-performance",
    title: "Student Performance",
    subtitle: "View analytics & insights",
    icon: BarChart3,
    iconColor: "#9333ea",
    bgColor: "#e9d5ff",
    route: "/(teacher)/more/performance",
  },
];

export default function TeacherHome() {
  const router = useRouter();
  const toast = useToast();

  const { stats, loading, refreshing, refetch, error } = useDashboard();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data");
    }
  }, [error, toast]);

  const navigateTo = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.teacherName}>
                {stats?.teacherName || "Teacher"}
              </Text>
            </View>

            {/* Notification Icon */}
            <Pressable
              onPress={() => navigateTo("/(teacher)/more/notifications")}
              style={styles.notificationButton}
            >
              <Bell size={24} color="white" strokeWidth={2.5} />
              {stats?.pendingReviews ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {stats.pendingReviews}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {STAT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => navigateTo(item.route)}
                  style={styles.statCard}
                >
                  <View
                    style={[styles.statIconContainer, { backgroundColor: item.bgColor }]}
                  >
                    <Icon size={24} color={item.iconColor} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.statValue}>
                    {loading ? "..." : stats?.[item.key] ?? 0}
                  </Text>
                  <Text style={styles.statTitle}>{item.title}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {FEATURED_ACTIONS.map((action, index) => {
              const Icon = action.icon;
              return (
                <Pressable
                  key={action.id}
                  onPress={() => navigateTo(action.route)}
                  style={[
                    styles.actionCard,
                    index < FEATURED_ACTIONS.length - 1 && styles.actionCardBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.actionIconContainer,
                      { backgroundColor: action.bgColor },
                    ]}
                  >
                    <Icon size={24} color={action.iconColor} strokeWidth={2.5} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#10b981",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 4,
  },
  teacherName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  actionsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  actionArrow: {
    fontSize: 24,
    color: "#9ca3af",
    fontWeight: "300",
  },
});
