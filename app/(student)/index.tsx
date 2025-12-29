import WelcomeTutorial from "@/components/WelcomeTutorial";
import { getUser, logout } from "@/lib/auth";
import { Announcement, Course, getAnnouncements, getEnrolledCourses } from "@/lib/enhancedApi";
import { getAssignedExams, getMyAttempts, getMyProgress } from "@/lib/studentApi";
import type { Attempt, Exam, ProgressDataPoint } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

// Rich green theme colors
const THEME = {
  primary: "#059669", // Emerald 600
  primaryLight: "#10b981", // Emerald 500
  primaryDark: "#047857", // Emerald 700
  accent: "#34d399", // Emerald 400
};

// Menu items for drawer-like navigation
const MENU_ITEMS = [
  { id: "learning", title: "My Learning", icon: "book", route: "/(student)/learning" },
  { id: "courses", title: "Browse Courses", icon: "library", route: "/(student)/courses" },
  { id: "exams", title: "Online Exams", icon: "document-text", route: "/(student)/exams" },
  { id: "results", title: "Results", icon: "trophy", route: "/(student)/results" },
  { id: "progress", title: "Progress", icon: "stats-chart", route: "/(student)/progress" },
  { id: "attendance", title: "Attendance", icon: "calendar", route: "/(student)/attendance" },
  { id: "schedule", title: "Class Schedule", icon: "time", route: "/(student)/schedule" },
  { id: "materials", title: "Study Materials", icon: "document", route: "/(student)/materials" },
  { id: "leaderboard", title: "Leaderboard", icon: "podium", route: "/(student)/leaderboard" },
];

export default function StudentHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Data states
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [activeExamsCount, setActiveExamsCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const loadData = async () => {
    try {
      const [userData, assignedData, progress, announcementsList, courses] = await Promise.all([
        getUser(),
        getAssignedExams().catch(() => ({ exams: [], attempts: {} })),
        getMyProgress().catch(() => [] as ProgressDataPoint[]),
        getAnnouncements(5).catch(() => []),
        getEnrolledCourses().catch(() => []),
      ]);

      setUser(userData);
      setAnnouncements(announcementsList);
      setEnrolledCourses(courses);
      
      // Show welcome tutorial for first-time users
      if (userData && !userData.welcomeTutorialCompleted) {
        setShowTutorial(true);
      }

      // Process exams
      const exams = assignedData?.exams || [];
      const attempts: Record<string, Attempt> = assignedData?.attempts || {};
      
      const now = new Date();
      const upcoming = exams
        .filter((e) => {
          const startAt = e.schedule?.startAt || e.startAt;
          const endAt = e.schedule?.endAt || e.endAt;
          const attempt = attempts[e._id];
          if (attempt?.status === "submitted" || attempt?.status === "auto-submitted") return false;
          if (startAt && new Date(startAt) > now) return true;
          if (!endAt || new Date(endAt) > now) return true;
          return false;
        })
        .slice(0, 3);

      setUpcomingExams(upcoming);
      setActiveExamsCount(exams.filter((e) => {
        const attempt = attempts[e._id];
        return attempt?.status !== "submitted" && attempt?.status !== "auto-submitted";
      }).length);

      // Get recent attempts
      const attemptsList = await getMyAttempts().catch(() => []);
      const recent = attemptsList
        .filter((a) => a.status === "submitted" || a.status === "auto-submitted")
        .sort((a, b) => {
          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
      setRecentAttempts(recent);

      // Calculate average score
      if (progress.length > 0) {
        const avg = Math.round(
          progress.reduce((sum, p) => sum + (p.percent || 0), 0) / progress.length
        );
        setAvgScore(avg);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/splash");
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return { bg: "#fee2e2", text: "#dc2626", icon: "alert-circle" };
      case "high": return { bg: "#fef3c7", text: "#b45309", icon: "warning" };
      default: return { bg: "#e0f2fe", text: "#0284c7", icon: "information-circle" };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const targetExam = user?.targetExams?.[0] || "Boards";

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Header */}
        <View 
          className="pt-14 pb-8 px-6 rounded-b-3xl"
          style={{ backgroundColor: THEME.primary }}
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1">
              <Text className="text-white/80 text-sm">Welcome back,</Text>
              <Text className="text-white text-2xl font-bold" numberOfLines={1}>
                {user?.name || "Student"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowMenu(true)}
                className="bg-white/20 p-3 rounded-full"
              >
                <Ionicons name="menu" size={22} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Target Badge */}
          <View className="flex-row items-center mt-2">
            <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="school" size={14} color="white" />
              <Text className="text-white ml-2 font-medium text-sm">Target: {targetExam}</Text>
            </View>
            {user?.classLevel && (
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center ml-2">
                <Text className="text-white font-medium text-sm">Class {user.classLevel}</Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-between mt-5">
            <Pressable 
              onPress={() => router.push("/(student)/exams")}
              className="bg-white/20 rounded-2xl p-4 flex-1 mr-2"
            >
              <View className="bg-white/30 w-10 h-10 rounded-full items-center justify-center mb-2">
                <Ionicons name="document-text" size={20} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold">{activeExamsCount}</Text>
              <Text className="text-white/80 text-xs">Active Exams</Text>
            </Pressable>
            <Pressable 
              onPress={() => router.push("/(student)/learning")}
              className="bg-white/20 rounded-2xl p-4 flex-1 mx-2"
            >
              <View className="bg-white/30 w-10 h-10 rounded-full items-center justify-center mb-2">
                <Ionicons name="book" size={20} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold">{enrolledCourses.length}</Text>
              <Text className="text-white/80 text-xs">Courses</Text>
            </Pressable>
            <Pressable 
              onPress={() => router.push("/(student)/progress")}
              className="bg-white/20 rounded-2xl p-4 flex-1 ml-2"
            >
              <View className="bg-white/30 w-10 h-10 rounded-full items-center justify-center mb-2">
                <Ionicons name="trophy" size={20} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold">{avgScore}%</Text>
              <Text className="text-white/80 text-xs">Avg Score</Text>
            </Pressable>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-5 py-6">
          {/* Continue Learning */}
          {(enrolledCourses.length > 0 || recentAttempts.length > 0) && (
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-bold mb-4">
                Continue Learning
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {enrolledCourses.slice(0, 3).map((course) => (
                  <Pressable
                    key={course._id}
                    onPress={() => router.push(`/(student)/course/${course._id}` as any)}
                    className="bg-white rounded-2xl p-4 mr-3 shadow-sm border border-gray-100"
                    style={{ width: 200 }}
                  >
                    <View 
                      className="w-full h-20 rounded-xl items-center justify-center mb-3"
                      style={{ backgroundColor: THEME.primary + "20" }}
                    >
                      <Ionicons name="book" size={32} color={THEME.primary} />
                    </View>
                    <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                      {course.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">{course.subject}</Text>
                    <View className="mt-2">
                      <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${course.progressPercent || 0}%` }}
                        />
                      </View>
                    </View>
                  </Pressable>
                ))}
                {recentAttempts.length > 0 && enrolledCourses.length < 2 && (
                  <Pressable
                    onPress={() => router.push("/(student)/exams")}
                    className="bg-amber-50 rounded-2xl p-4 mr-3 shadow-sm border border-amber-100 items-center justify-center"
                    style={{ width: 150 }}
                  >
                    <Ionicons name="play-circle" size={40} color="#f59e0b" />
                    <Text className="text-amber-700 font-semibold mt-2">Take Exam</Text>
                    <Text className="text-amber-600 text-xs">{activeExamsCount} available</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          )}

          {/* Announcements */}
          {announcements.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-bold mb-4">
                Latest Updates
              </Text>
              {announcements.slice(0, 3).map((announcement) => {
                const colors = getPriorityColor(announcement.priority);
                return (
                  <View
                    key={announcement._id}
                    className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-start">
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Ionicons name={colors.icon as any} size={16} color={colors.text} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">{announcement.title}</Text>
                        <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                          {announcement.content}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-2">
                          {getTimeAgo(announcement.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Upcoming Exams */}
          {upcomingExams.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 text-lg font-bold">
                  Upcoming Exams
                </Text>
                <Pressable onPress={() => router.push("/(student)/exams")}>
                  <Text style={{ color: THEME.primary }} className="font-semibold">
                    View All
                  </Text>
                </Pressable>
              </View>

              {upcomingExams.map((exam) => {
                const startAt = exam.schedule?.startAt || exam.startAt;
                const isActive = !startAt || new Date(startAt) <= new Date();

                return (
                  <Pressable
                    key={exam._id}
                    onPress={() => router.push("/(student)/exams")}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                          {exam.title}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="time" size={14} color="#6b7280" />
                          <Text className="text-gray-500 text-sm ml-1">
                            {exam.totalDurationMins || 0} mins
                          </Text>
                        </View>
                      </View>
                      <View 
                        className="px-3 py-2 rounded-xl"
                        style={{ backgroundColor: isActive ? THEME.primary : "#e0f2fe" }}
                      >
                        <Text 
                          className="text-xs font-bold"
                          style={{ color: isActive ? "white" : "#0284c7" }}
                        >
                          {isActive ? "Start Now" : "Upcoming"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Quick Actions Grid */}
          <View className="mb-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Pressable 
                onPress={() => router.push("/(student)/exams")}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                style={{ width: "47%" }}
              >
                <View className="bg-emerald-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Ionicons name="play-circle" size={24} color={THEME.primary} />
                </View>
                <Text className="text-gray-900 font-semibold">Start Exam</Text>
                <Text className="text-gray-500 text-xs">{activeExamsCount} available</Text>
              </Pressable>

              <Pressable 
                onPress={() => router.push("/(student)/materials")}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                style={{ width: "47%" }}
              >
                <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Ionicons name="document-text" size={24} color="#2563eb" />
                </View>
                <Text className="text-gray-900 font-semibold">Study Material</Text>
                <Text className="text-gray-500 text-xs">Download notes</Text>
              </Pressable>

              <Pressable 
                onPress={() => router.push("/(student)/schedule")}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                style={{ width: "47%" }}
              >
                <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Ionicons name="calendar" size={24} color="#7c3aed" />
                </View>
                <Text className="text-gray-900 font-semibold">Schedule</Text>
                <Text className="text-gray-500 text-xs">View timetable</Text>
              </Pressable>

              <Pressable 
                onPress={() => router.push("/(student)/leaderboard")}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                style={{ width: "47%" }}
              >
                <View className="bg-amber-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Ionicons name="podium" size={24} color="#f59e0b" />
                </View>
                <Text className="text-gray-900 font-semibold">Leaderboard</Text>
                <Text className="text-gray-500 text-xs">Check rankings</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMenu(false)}
      >
        <View className="flex-1 bg-black/50">
          <Pressable className="flex-1" onPress={() => setShowMenu(false)} />
          <View className="bg-white rounded-t-3xl px-6 pb-8 pt-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-gray-900 text-xl font-bold mb-4">Menu</Text>
            
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  setShowMenu(false);
                  router.push(item.route as any);
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center mr-4">
                  <Ionicons name={item.icon as any} size={20} color="#374151" />
                </View>
                <Text className="text-gray-800 font-medium text-base flex-1">{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </Pressable>
            ))}

            <Pressable
              onPress={() => {
                setShowMenu(false);
                handleLogout();
              }}
              className="flex-row items-center py-4 mt-4"
            >
              <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center mr-4">
                <Ionicons name="log-out" size={20} color="#dc2626" />
              </View>
              <Text className="text-red-600 font-medium text-base">Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      {/* Welcome Tutorial for first-time users */}
      <WelcomeTutorial
        visible={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />
    </>
  );
}

