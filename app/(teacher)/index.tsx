import { apiFetch } from "@/lib/api";
import { getLiveSchedule, LiveScheduleResponse } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Bell,
    Calendar,
    CheckCircle,
    Plus,
    Upload
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useToast } from "@/lib/context";
import { useDashboard } from "@/lib/hooks";

const THEME = {
  primary: "#2563eb", // Deep professional blue
  primaryLight: "#dbeafe",
  background: "#f8fafc",
  text: "#0f172a",
  textSecondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  border: "#e2e8f0",
  white: "#ffffff"
};

interface QuickAction {
  id: string;
  title: string;
  icon: any;
  route?: string;
  action?: () => void;
  color: string;
  bgColor: string;
}

// Helper to format date
const formatDate = () => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('en-US', options);
};

export default function TeacherHome() {
  const router = useRouter();
  const toast = useToast();

  const { stats, loading: dashboardLoading, refreshing, refetch, error } = useDashboard();
  
  // Schedule state
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [liveSchedule, setLiveSchedule] = useState<LiveScheduleResponse | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const loadSchedule = async () => {
    try {
      setScheduleLoading(true);
      const data = await getLiveSchedule();
      setLiveSchedule(data);
    } catch (err) {
      console.log('Error loading schedule:', err);
    } finally {
      setScheduleLoading(false);
    }
  };
  
  const loadProfile = async () => {
    try {
      const userData = await apiFetch('/api/auth/me') as any;
      if (userData?.profileImage) {
        setProfileImage(userData.profileImage);
      }
    } catch (err) {
      console.log('Error loading profile:', err);
    }
  };

  useEffect(() => {
    loadSchedule();
    loadProfile();
  }, []);

  const onRefresh = useCallback(() => {
    refetch();
    loadSchedule();
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

  const handleComingSoon = (feature: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${feature} coming soon`, ToastAndroid.SHORT);
    } else {
      // Fallback for iOS if toast context not available immediately
      alert(`${feature} coming soon`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Derive unique batches from today's schedule for "Active Batches" metric
  // This is a heuristic since we don't have a direct API for "Total Active Batches"
  const activeBatchesCount = liveSchedule?.todaySchedule 
    ? new Set(liveSchedule.todaySchedule.map(s => s.batch).filter(Boolean)).size 
    : 0;

  const quickActions: QuickAction[] = [
    {
      id: "create-homework",
      title: "Create Homework",
      icon: Plus,
      route: "/(teacher)/create",
      color: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      id: "upload-material",
      title: "Upload Material",
      icon: Upload,
      action: () => handleComingSoon("Study Material Upload"),
      color: "#059669",
      bgColor: "#ecfdf5",
    },
    {
      id: "mark-attendance",
      title: "Mark Attendance",
      icon: CheckCircle,
      action: () => handleComingSoon("Attendance Marking"),
      color: "#7c3aed",
      bgColor: "#f5f3ff",
    },
    {
      id: "manage-schedule",
      title: "Manage Schedule",
      icon: Calendar,
      route: "/(teacher)/more/schedule",
      color: "#db2777",
      bgColor: "#fdf2f8",
    },
  ];

  if (dashboardLoading && !stats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading workspace...</Text>
      </SafeAreaView>
    );
  }

  const firstInitial = (stats?.teacherName || "T").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* 1. Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSub}>{getGreeting()},</Text>
            <Text style={styles.greetingMain}>{stats?.teacherName || "Teacher"}</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.iconButton}
              onPress={() => navigateTo("/(teacher)/notifications")}
            >
              <Bell size={24} color={THEME.textSecondary} strokeWidth={1.5} />
              {stats?.pendingReviews ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.pendingReviews > 9 ? '9+' : stats.pendingReviews}</Text>
                </View>
              ) : null}
            </Pressable>
            
            <Pressable 
              style={styles.profileButton}
              onPress={() => navigateTo("/(teacher)/more/profile")}
            >
               {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{firstInitial}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* 2. Today's Classes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Classes</Text>
            <Pressable onPress={() => navigateTo("/(teacher)/more/schedule")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          {scheduleLoading ? (
            <ActivityIndicator size="small" color={THEME.primary} style={{ marginTop: 20 }} />
          ) : liveSchedule?.todaySchedule && liveSchedule.todaySchedule.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.classesScroll}
            >
              {liveSchedule.todaySchedule
                .filter(item => item.status !== 'past')
                .sort((a, b) => (a.status === 'ongoing' ? -1 : 1)) // Prioritize ongoing
                .map((item, index) => {
                  const isOngoing = item.status === 'ongoing';
                  return (
                    <Pressable 
                      key={item._id || index}
                      style={[styles.classCard, isOngoing && styles.classCardActive]}
                      onPress={() => navigateTo("/(teacher)/more/schedule")}
                    >
                      <View style={styles.classCardHeader}>
                        <View style={[styles.statusBadge, isOngoing ? styles.statusBadgeActive : styles.statusBadgeUpcoming]}>
                          <Text style={[styles.statusText, isOngoing ? styles.statusTextActive : styles.statusTextUpcoming]}>
                            {isOngoing ? "ONGOING" : "UPCOMING"}
                          </Text>
                        </View>
                        <Text style={[styles.classTime, isOngoing && styles.classTimeActive]}>
                          {item.startTimeSlot}
                        </Text>
                      </View>
                      
                      <Text 
                        style={[styles.subjectName, isOngoing && styles.subjectNameActive]} 
                        numberOfLines={1}
                      >
                        {item.subject}
                      </Text>
                      <Text style={[styles.batchName, isOngoing && styles.batchNameActive]}>
                        Class {item.classLevel} • {item.batch}
                      </Text>
                      
                      <View style={styles.cardFooter}>
                        <Text style={[styles.actionLink, isOngoing && styles.actionLinkActive]}>
                          {isOngoing ? "Join Class" : "View Details"}
                        </Text>
                        <Ionicons 
                          name="arrow-forward" 
                          size={16} 
                          color={isOngoing ? "white" : THEME.primary} 
                        />
                      </View>
                    </Pressable>
                  );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={40} color={THEME.textSecondary} strokeWidth={1} />
              <Text style={styles.emptyStateText}>No classes scheduled for today.</Text>
            </View>
          )}
        </View>

        {/* 3. Class Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewContainer}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Classes</Text>
              <Text style={styles.overviewValue}>
                {scheduleLoading ? "-" : liveSchedule?.todaySchedule?.length || 0}
              </Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Students</Text>
              <Text style={styles.overviewValue}>{stats?.totalStudents || 0}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Active Batches</Text>
              <Text style={styles.overviewValue}>
                 {scheduleLoading ? "-" : activeBatchesCount}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Pressable
                  key={action.id}
                  style={styles.quickActionCard}
                  onPress={() => {
                    if (action.action) action.action();
                    else if (action.route) navigateTo(action.route);
                  }}
                >
                  <View style={[styles.actionIconParams, { backgroundColor: action.bgColor }]}>
                    <Icon size={24} color={action.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
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
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  loadingText: {
    marginTop: 12,
    color: THEME.textSecondary,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: THEME.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  greetingSub: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  greetingMain: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.white,
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.primary,
  },

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  
  // Classes
  classesScroll: {
    gap: 16,
    paddingRight: 24, // extra padding for horizontal scroll end
  },
  classCard: {
    width: 260,
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 4, // subtle shadow space
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  classCardActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeUpcoming: {
    backgroundColor: THEME.background,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTextUpcoming: {
    color: THEME.textSecondary,
  },
  statusTextActive: {
    color: 'white',
  },
  classTime: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '600',
  },
  classTimeActive: {
    color: 'white',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  subjectNameActive: {
    color: 'white',
  },
  batchName: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 16,
  },
  batchNameActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  actionLinkActive: {
    color: 'white',
  },
  emptyState: {
    padding: 32,
    backgroundColor: THEME.white,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 8,
    color: THEME.textSecondary,
    fontSize: 14,
  },

  // Overview
  overviewContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: 'space-between',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: THEME.border,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%', // 2 columns with gap
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1.4,
  },
  actionIconParams: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
  },
});
