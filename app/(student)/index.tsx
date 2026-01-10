import WelcomeTutorial from "@/components/WelcomeTutorial";
import { getUser } from "@/lib/auth";
import { Course, getEnrolledCourses } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
  accent: "#34d399",
};

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", 
    "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
    "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
    "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Extract thumbnail from YouTube video
function getYouTubeThumbnail(videoUrl?: string, youtubeMeta?: { thumbnail?: string }): string | null {
  if (youtubeMeta?.thumbnail) return youtubeMeta.thumbnail;
  if (!videoUrl) return null;
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  
  // If videoUrl is just the ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(videoUrl)) {
    return `https://img.youtube.com/vi/${videoUrl}/mqdefault.jpg`;
  }
  
  return null;
}

// Get course thumbnail - first try course, then first lecture
function getCourseThumbnail(course: Course): string | null {
  if (course.thumbnail) return course.thumbnail;
  
  // Try to get from first lecture
  if (course.syllabus && course.syllabus.length > 0) {
    const firstModule = course.syllabus[0];
    if (firstModule.lectures && firstModule.lectures.length > 0) {
      const firstLecture = firstModule.lectures[0];
      return getYouTubeThumbnail(
        firstLecture.youtubeVideoId || firstLecture.videoUrl,
        firstLecture.youtubeMeta
      );
    }
  }
  
  return null;
}

export default function StudentHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Data states
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const loadData = async () => {
    try {
      const [userData, courses, storedImage] = await Promise.all([
        getUser(),
        getEnrolledCourses().catch(() => []),
        AsyncStorage.getItem("profile_image"),
      ]);

      const hasSeenTutorial = await AsyncStorage.getItem("has_seen_welcome_tutorial");
      
      setUser(userData);
      setEnrolledCourses(courses);
      // Use server profile image first, fallback to local storage
      if (userData?.profileImage) {
        setProfileImage(userData.profileImage);
      } else if (storedImage) {
        setProfileImage(storedImage);
      }
      
      if (!hasSeenTutorial) {
        setShowTutorial(true);
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
  
  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem("has_seen_welcome_tutorial", "true");
      setShowTutorial(false);
    } catch (error) {
      console.error("Error saving tutorial status:", error);
      setShowTutorial(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const firstInitial = (user?.name || "S").charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(user?.name || "Student");
  const featuredCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;
  const featuredThumbnail = featuredCourse ? getCourseThumbnail(featuredCourse) : null;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
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
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, Welcome 👋</Text>
            <Text style={styles.userName}>{user?.name || "Student"}</Text>
          </View>
          <Pressable 
            onPress={() => router.push("/(student)/profile")}
            style={styles.avatarContainer}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{firstInitial}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Hero Text */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTextNormal}>Get Your</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroTextHighlight}>Best Course</Text>
            <Text style={styles.heroTextNormal}> Today!</Text>
          </View>
        </View>

        {/* Featured Course Card */}
        {featuredCourse ? (
          <Pressable 
            onPress={() => router.push(`/(student)/course/${featuredCourse._id}` as any)}
            style={styles.featuredCard}
          >
            {/* Background Image or Gradient */}
            {featuredThumbnail ? (
              <Image 
                source={{ uri: featuredThumbnail }} 
                style={styles.featuredImage}
                resizeMode="cover"
              />
            ) : null}
            <View style={[
              styles.featuredOverlay,
              !featuredThumbnail && { backgroundColor: '#2e2e48' }
            ]}>
              {/* Decorative Elements */}
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              
              {/* Content */}
              <View style={styles.featuredContent}>
                <View style={styles.featuredTopRow}>
                  <View style={styles.featuredBadge}>
                    <Ionicons name="play-circle" size={14} color="white" />
                    <Text style={styles.featuredBadgeText}>Featured</Text>
                  </View>
                  <View style={styles.bookmarkBtn}>
                    <Ionicons name="bookmark-outline" size={20} color="white" />
                  </View>
                </View>
                
                <View style={styles.featuredCenter}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={30} color="white" style={{ marginLeft: 4 }} />
                  </View>
                </View>
                
                <View style={styles.featuredBottom}>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {featuredCourse.title}
                  </Text>
                  <Text style={styles.featuredSubtitle}>
                    {featuredCourse.subject || "Continue Learning"}
                  </Text>
                  {featuredCourse.progressPercent !== undefined && (
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${featuredCourse.progressPercent}%` }
                        ]} 
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        ) : (
          <Pressable 
            onPress={() => router.push("/(student)/courses")}
            style={styles.featuredCard}
          >
            <View style={[styles.featuredOverlay, { backgroundColor: '#2e2e48' }]}>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredCenter}>
                  <View style={styles.playButton}>
                    <Ionicons name="add" size={30} color="white" />
                  </View>
                </View>
                <View style={styles.featuredBottom}>
                  <Text style={styles.featuredTitle}>Explore Courses</Text>
                  <Text style={styles.featuredSubtitle}>
                    Start your learning journey today
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}

        {/* Course of The Week */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Courses</Text>
            {enrolledCourses.length > 3 && (
              <Pressable onPress={() => router.push("/(student)/courses")}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            )}
          </View>
          
          {enrolledCourses.length > 0 ? (
            <View style={styles.courseList}>
              {enrolledCourses.slice(0, 5).map((course: Course, index: number) => {
                const thumbnail = getCourseThumbnail(course);
                const lectureCount = course.syllabus?.reduce(
                  (acc, mod) => acc + (mod.lectures?.length || 0), 0
                ) || course.lectureCount || 0;
                
                return (
                  <Pressable
                    key={course._id || index}
                    onPress={() => router.push(`/(student)/course/${course._id}` as any)}
                    style={styles.courseCard}
                  >
                    {/* Thumbnail */}
                    <View style={styles.thumbnailContainer}>
                      {thumbnail ? (
                        <Image 
                          source={{ uri: thumbnail }} 
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                          <Ionicons name="play-circle" size={28} color="#9ca3af" />
                        </View>
                      )}
                      {lectureCount > 0 && (
                        <View style={styles.lectureCountBadge}>
                          <Text style={styles.lectureCountText}>{lectureCount} lectures</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Info */}
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                      {course.subject && (
                        <Text style={styles.courseSubject}>{course.subject}</Text>
                      )}
                      {course.progressPercent !== undefined && course.progressPercent > 0 && (
                        <View style={styles.courseProgressRow}>
                          <View style={styles.courseProgressBar}>
                            <View 
                              style={[
                                styles.courseProgressFill, 
                                { width: `${course.progressPercent}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.courseProgressText}>{course.progressPercent}%</Text>
                        </View>
                      )}
                    </View>

                    {/* Arrow */}
                    <View style={styles.arrowContainer}>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No Courses Yet</Text>
              <Text style={styles.emptyStateText}>
                Explore our course catalog to start learning
              </Text>
              <Pressable 
                style={styles.exploreCourseBtn}
                onPress={() => router.push("/(student)/courses")}
              >
                <Text style={styles.exploreCourseBtnText}>Browse Courses</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push("/(student)/learning")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#ecfdf5" }]}>
                <Ionicons name="book" size={22} color={THEME.primary} />
              </View>
              <Text style={styles.quickActionText}>My Learning</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push("/(student)/modules/results")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="trophy" size={22} color="#f59e0b" />
              </View>
              <Text style={styles.quickActionText}>Results</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push("/(student)/modules/schedule")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="calendar" size={22} color="#3b82f6" />
              </View>
              <Text style={styles.quickActionText}>Schedule</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push("/(student)/modules/materials")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#f3e8ff" }]}>
                <Ionicons name="document-text" size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.quickActionText}>Materials</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <WelcomeTutorial
        visible={showTutorial}
        onComplete={handleTutorialComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 56,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerLeft: {},
  greeting: {
    fontSize: 15,
    color: "#9ca3af",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  avatar: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  // Hero
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroTextNormal: {
    fontSize: 32,
    color: "#111827",
  },
  heroRow: {
    flexDirection: "row",
  },
  heroTextHighlight: {
    fontSize: 32,
    fontWeight: "700",
    color: THEME.primary,
  },
  // Featured Card
  featuredCard: {
    marginHorizontal: 24,
    height: 280,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 28,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  featuredContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  featuredTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  featuredBottom: {},
  featuredTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.accent,
    borderRadius: 2,
  },
  decorCircle1: {
    position: "absolute",
    top: 40,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(253,224,71,0.15)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  // Section
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.primary,
  },
  // Course List
  courseList: {
    gap: 14,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  thumbnailContainer: {
    width: 80,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 14,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  lectureCountBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lectureCountText: {
    fontSize: 9,
    color: "white",
    fontWeight: "600",
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
  courseSubject: {
    fontSize: 12,
    color: "#6b7280",
  },
  courseProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  courseProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  courseProgressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: 2,
  },
  courseProgressText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.primary,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  exploreCourseBtn: {
    marginTop: 20,
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreCourseBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "47%",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
