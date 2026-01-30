import PerformanceCharts from "@/components/PerformanceCharts";
import { Course, getEnrolledCourses } from "@/lib/enhancedApi";
import { getMyAttempts, getMyProgress } from "@/lib/studentApi";
import type { Attempt, StudentAnalytics } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Theme
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

// Get YouTube thumbnail
function getYouTubeThumbnail(
  videoUrl?: string,
  youtubeMeta?: { thumbnail?: string },
): string | null {
  if (youtubeMeta?.thumbnail) return youtubeMeta.thumbnail;
  if (!videoUrl) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }

  return null;
}

// Get course thumbnail
function getCourseThumbnail(course: Course): string | null {
  if (course.thumbnail) return course.thumbnail;

  if (course.syllabus && course.syllabus.length > 0) {
    const firstModule = course.syllabus[0];
    if (firstModule.lectures && firstModule.lectures.length > 0) {
      const firstLecture = firstModule.lectures[0] as any;
      return getYouTubeThumbnail(
        firstLecture.youtubeVideoId || firstLecture.videoUrl,
        firstLecture.youtubeMeta,
      );
    }
  }

  return null;
}

export default function LearningScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [activeTab, setActiveTab] = useState<"courses" | "exams" | "analytics">(
    "courses",
  );

  const loadData = async () => {
    try {
      const [courses, analyticsData, attemptsList] = await Promise.all([
        getEnrolledCourses().catch(() => []),
        getMyProgress().catch(() => null),
        getMyAttempts().catch(() => []),
      ]);
      setEnrolledCourses(courses);
      if (analyticsData) setAnalytics(analyticsData);
      setAttempts(
        attemptsList.filter(
          (a) =>
            a.status === "submitted" ||
            a.status === "auto-submitted" ||
            a.status === "graded",
        ),
      );
    } catch (error) {
      console.error("Error loading learning data:", error);
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

  // Stats from backend - all real data
  const totalTimeSpent = enrolledCourses.reduce(
    (sum, c) => sum + ((c as any).timeSpent || 0),
    0,
  );
  const hoursSpent = Math.floor(totalTimeSpent / 60);

  // Calculate completion from progressPercent tracked in backend
  const completedCourses = enrolledCourses.filter(
    (c) => (c.progressPercent || 0) >= 100,
  ).length;

  // Count total exams taken (submitted attempts)
  const totalExamsTaken = attempts.length;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="school" size={24} color="white" />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>My Learning</Text>
              <Text style={styles.headerSubtitle}>Track your progress</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="school" size={24} color="white" />
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Learning</Text>
            <Text style={styles.headerSubtitle}>Track your progress</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statIconBg}>
            <Ionicons name="book" size={20} color={THEME.primary} />
          </View>
          <Text style={styles.statValue}>{enrolledCourses.length}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="checkmark-done" size={20} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{completedCourses}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: "#dbeafe" }]}>
            <Ionicons name="document-text" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{totalExamsTaken}</Text>
          <Text style={styles.statLabel}>Exams</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: "#f3e8ff" }]}>
            <Ionicons name="time" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{hoursSpent}h</Text>
          <Text style={styles.statLabel}>Learning</Text>
        </View>
      </View>

      {/* Quick Action - Custom Test */}
      <Pressable
        onPress={() => router.push("/(student)/modules/custom-test" as any)}
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#ecfdf5",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: "#ecfdf5",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
          }}
        >
          <Ionicons name="create" size={24} color={THEME.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            Create Custom Test
          </Text>
          <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            Create your own test with chosen subjects & chapters
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.primary} />
      </Pressable>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(["courses", "exams", "analytics"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const icons = {
            courses: "play-circle",
            exams: "document-text",
            analytics: "bar-chart",
          } as const;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
            >
              <Ionicons
                name={icons[tab]}
                size={18}
                color={isActive ? "white" : "#6b7280"}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "courses" && (
          <>
            {enrolledCourses.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="book-outline" size={48} color="#d1d5db" />
                </View>
                <Text style={styles.emptyTitle}>No Courses Yet</Text>
                <Text style={styles.emptyText}>
                  Enroll in a course to start learning
                </Text>
                <Pressable
                  onPress={() => router.push("/(student)/courses")}
                  style={styles.browseBtn}
                >
                  <Ionicons name="add-circle" size={18} color="white" />
                  <Text style={styles.browseBtnText}>Browse Courses</Text>
                </Pressable>
              </View>
            ) : (
              enrolledCourses.map((course) => {
                const thumbnail = getCourseThumbnail(course);
                // const progress = course.progressPercent || 0; // Unused
                const lectureCount =
                  course.syllabus?.reduce(
                    (acc, mod) => acc + (mod.lectures?.length || 0),
                    0,
                  ) ||
                  course.lectureCount ||
                  0;

                return (
                  <Pressable
                    key={course._id}
                    onPress={() =>
                      router.push(`/(student)/course/${course._id}` as any)
                    }
                    style={styles.courseCard}
                  >
                    {/* Thumbnail */}
                    <View style={styles.courseThumbnail}>
                      {thumbnail ? (
                        <Image
                          source={{ uri: thumbnail }}
                          style={styles.courseThumbnailImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.courseThumbnailImg,
                            styles.thumbnailPlaceholder,
                          ]}
                        >
                          <Ionicons
                            name="play-circle"
                            size={24}
                            color={THEME.primary}
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.courseInfo}>
                      <Text style={styles.courseTitle} numberOfLines={2}>
                        {course.title}
                      </Text>
                      <View style={styles.courseMeta}>
                        <Ionicons name="videocam" size={12} color="#9ca3af" />
                        <Text style={styles.courseMetaText}>
                          {lectureCount} videos
                        </Text>
                        {course.subject && (
                          <>
                            <Text style={styles.courseMetaDot}>•</Text>
                            <Text style={styles.courseMetaText}>
                              {course.subject}
                            </Text>
                          </>
                        )}
                      </View>

                      {/* Course Progress Bar */}
                      {course.progressPercent !== undefined && (
                        <View style={styles.courseProgressContainer}>
                          <View style={styles.courseProgressBar}>
                            <View
                              style={[
                                styles.courseProgressFill,
                                { width: `${course.progressPercent}%` },
                                course.progressPercent >= 100 &&
                                  styles.courseProgressComplete,
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.courseProgressText,
                              course.progressPercent >= 100 && {
                                color: THEME.primary,
                              },
                            ]}
                          >
                            {course.progressPercent >= 100
                              ? "Complete"
                              : `${course.progressPercent}%`}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#d1d5db"
                    />
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {activeTab === "exams" && (
          <>
            {attempts.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color="#d1d5db"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Exams Taken</Text>
                <Text style={styles.emptyText}>
                  Take an exam to see your history
                </Text>
              </View>
            ) : (
              attempts.slice(0, 10).map((attempt) => {
                const percent = attempt.maxScore
                  ? Math.round(
                      ((attempt.totalScore || 0) / attempt.maxScore) * 100,
                    )
                  : 0;
                const isPass = percent >= 40;
                const isExcellent = percent >= 70;

                return (
                  <Pressable
                    key={attempt._id}
                    onPress={() =>
                      router.push(`/(student)/result/${attempt._id}` as any)
                    }
                    style={styles.examCard}
                  >
                    <View
                      style={[
                        styles.examScoreBadge,
                        {
                          backgroundColor: isExcellent
                            ? "#ecfdf5"
                            : isPass
                              ? "#fffbeb"
                              : "#fef2f2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.examScoreText,
                          {
                            color: isExcellent
                              ? THEME.primary
                              : isPass
                                ? "#f59e0b"
                                : "#ef4444",
                          },
                        ]}
                      >
                        {percent}%
                      </Text>
                    </View>

                    <View style={styles.examInfo}>
                      <Text style={styles.examTitle} numberOfLines={1}>
                        {attempt.examTitle || "Exam"}
                      </Text>
                      <View style={styles.examMeta}>
                        <Text style={styles.examScore}>
                          Score: {attempt.totalScore || 0}/
                          {attempt.maxScore || 0}
                        </Text>
                        <Text style={styles.examDot}>•</Text>
                        <Text style={styles.examDate}>
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )
                            : "—"}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#d1d5db"
                    />
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {activeTab === "analytics" && (
          <View style={styles.analyticsCard}>
            <PerformanceCharts analytics={analytics} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  // Header
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: THEME.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardPrimary: {
    backgroundColor: "#ecfdf5",
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  // Tabs
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "white",
  },
  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  // Course Card
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  courseThumbnail: {
    width: 72,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 14,
  },
  courseThumbnailImg: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  courseMetaText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  courseMetaDot: {
    fontSize: 12,
    color: "#d1d5db",
    marginHorizontal: 6,
  },
  courseProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  courseProgressBar: {
    flex: 1,
    height: 5,
    backgroundColor: "#e5e7eb",
    borderRadius: 2.5,
    overflow: "hidden",
  },
  courseProgressFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 2.5,
  },
  courseProgressComplete: {
    backgroundColor: THEME.primary,
  },
  courseProgressText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f59e0b",
    minWidth: 48,
    textAlign: "right",
  },
  // Exam Card
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  examScoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  examScoreText: {
    fontSize: 16,
    fontWeight: "700",
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  examMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  examScore: {
    fontSize: 12,
    color: "#6b7280",
  },
  examDot: {
    fontSize: 12,
    color: "#d1d5db",
    marginHorizontal: 6,
  },
  examDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  // Analytics
  analyticsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  analyticItem: {
    width: "47%",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 16,
  },
  analyticIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  analyticValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  analyticLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  recentPerformance: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 14,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  recentLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  recentScore: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: "white",
    borderRadius: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
