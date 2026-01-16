import WelcomeTutorial from "@/components/WelcomeTutorial";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Course, getEnrolledCourses, getLiveSchedule, LiveScheduleResponse } from "@/lib/enhancedApi";
import { getAssignedExams } from "@/lib/studentApi";
import type { Attempt, Exam } from "@/lib/types";
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
    View
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
  const [upcomingExam, setUpcomingExam] = useState<Exam | null>(null);
  const [examAttempt, setExamAttempt] = useState<Attempt | null>(null);
  const [liveSchedule, setLiveSchedule] = useState<LiveScheduleResponse | null>(null);

  const loadData = async () => {
    try {
      const [cachedUserData, courses, storedImage, examsData, scheduleData] = await Promise.all([
        getUser(),
        getEnrolledCourses().catch(() => []),
        AsyncStorage.getItem("profile_image"),
        getAssignedExams().catch(() => ({ exams: [], attempts: {} })),
        getLiveSchedule().catch(() => null),
      ]);
      
      setLiveSchedule(scheduleData);

      // Try to fetch fresh user data from server
      let userData = cachedUserData;
      try {
        const freshUserData = await apiFetch('/api/auth/me') as any;
        if (freshUserData) {
          userData = freshUserData;
          // Update cached user data with fresh data
          if (userData) {
            await setUser(userData);
          }
        }
      } catch {
        // Use cached data if server fetch fails
        console.log('Using cached user data');
      }

      const hasSeenTutorial = await AsyncStorage.getItem("has_seen_welcome_tutorial");
      
      setUser(userData);
      setEnrolledCourses(courses);
      
      // Find next upcoming or active exam
      const now = new Date();
      const exams = examsData?.exams || [];
      const attempts = examsData?.attempts || {};
      
      const availableExams = exams
        .filter((exam: Exam) => {
          const attempt = (attempts as Record<string, Attempt>)[exam._id];
          // Not submitted yet
          if (attempt?.status === 'submitted' || attempt?.status === 'auto-submitted') return false;
          // Check if exam is still active or upcoming
          const endAt = exam.schedule?.endAt || exam.endAt;
          if (endAt && new Date(endAt) < now) return false;
          return true;
        })
        .sort((a: Exam, b: Exam) => {
          const aStart = new Date(a.schedule?.startAt || a.startAt || 0);
          const bStart = new Date(b.schedule?.startAt || b.startAt || 0);
          return aStart.getTime() - bStart.getTime();
        });
      
      if (availableExams.length > 0) {
        setUpcomingExam(availableExams[0]);
        setExamAttempt((attempts as Record<string, Attempt>)[availableExams[0]._id] || null);
      }
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

        {/* Current/Next Class Section - Displayed at top */}
        {(liveSchedule?.currentClass || liveSchedule?.nextClass) && (
          <Pressable 
            onPress={() => router.push("/(student)/modules/schedule")}
            style={styles.classHighlightCard}
          >
            {liveSchedule.currentClass ? (
              <>
                <View style={styles.liveClassIndicator}>
                  <View style={styles.liveClassDot} />
                  <Text style={styles.liveClassLabel}>HAPPENING NOW</Text>
                </View>
                <Text style={styles.liveClassSubject}>{liveSchedule.currentClass.subject}</Text>
                <Text style={styles.liveClassMeta}>
                  Room {liveSchedule.currentClass.roomNumber} • {liveSchedule.currentClass.teacherName}
                </Text>
                <Text style={styles.liveClassTime}>
                  {liveSchedule.currentClass.startTimeSlot} - {liveSchedule.currentClass.endTimeSlot}
                </Text>
              </>
            ) : liveSchedule.nextClass ? (
              <>
                <View style={styles.nextClassIndicator}>
                  <Ionicons name="time-outline" size={16} color="#f59e0b" />
                  <Text style={styles.nextClassLabelHighlight}>NEXT CLASS</Text>
                </View>
                <Text style={styles.nextUpSubject}>{liveSchedule.nextClass.subject}</Text>
                <Text style={styles.nextUpMeta}>
                  {liveSchedule.nextClass.startTimeSlot} • Room {liveSchedule.nextClass.roomNumber}
                </Text>
              </>
            ) : null}
            <View style={styles.classCardArrow}>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </View>
          </Pressable>
        )}

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

        {/* Upcoming Exam */}
        {upcomingExam && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Exam</Text>
              <Pressable onPress={() => router.push("/(student)/modules/exams")}>
                <Text style={styles.seeAllText}>All Exams</Text>
              </Pressable>
            </View>
            
            <Pressable
              style={styles.examCard}
              onPress={() => {
                if (examAttempt?._id) {
                  router.push(`/(student)/attempt/${examAttempt._id}` as any);
                } else {
                  router.push("/(student)/modules/exams");
                }
              }}
            >
              <View style={styles.examCardLeft}>
                <View style={styles.examIconContainer}>
                  <Ionicons name="document-text" size={24} color="#3b82f6" />
                </View>
                <View style={styles.examInfo}>
                  <Text style={styles.examTitle} numberOfLines={1}>
                    {upcomingExam.title}
                  </Text>
                  <View style={styles.examMeta}>
                    {upcomingExam.totalDurationMins && (
                      <View style={styles.examMetaItem}>
                        <Ionicons name="time-outline" size={14} color="#6b7280" />
                        <Text style={styles.examMetaText}>{upcomingExam.totalDurationMins} mins</Text>
                      </View>
                    )}
                    {(upcomingExam.schedule?.startAt || upcomingExam.startAt) && (
                      <View style={styles.examMetaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                        <Text style={styles.examMetaText}>
                          {new Date(upcomingExam.schedule?.startAt || upcomingExam.startAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={[
                styles.examStatusBadge,
                examAttempt?.status === 'in-progress' 
                  ? { backgroundColor: '#fef3c7' } 
                  : { backgroundColor: '#dcfce7' }
              ]}>
                <Text style={[
                  styles.examStatusText,
                  examAttempt?.status === 'in-progress'
                    ? { color: '#b45309' }
                    : { color: THEME.primary }
                ]}>
                  {examAttempt?.status === 'in-progress' ? 'Resume' : 'Start'}
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={14} 
                  color={examAttempt?.status === 'in-progress' ? '#b45309' : THEME.primary} 
                />
              </View>
            </Pressable>
          </View>
        )}

        {/* Today's Schedule */}
        {liveSchedule && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s Classes</Text>
              <Pressable onPress={() => router.push("/(student)/modules/schedule")}>
                <Text style={styles.seeAllText}>Full Timetable</Text>
              </Pressable>
            </View>
            
            {/* Today's Classes List (Filtered to show only ongoing and upcoming) */}
            <View style={styles.scheduleList}>
              {liveSchedule.todaySchedule.filter(item => item.status !== 'past').length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No upcoming classes for today</Text>
                </View>
              ) : (
                liveSchedule.todaySchedule
                  .filter(item => item.status !== 'past')
                  .slice(0, 4)
                  .map((item, index) => {
                    const isOngoing = item.status === 'ongoing';
                    return (
                      <View 
                        key={item._id || index} 
                        style={[styles.scheduleItem, isOngoing && styles.scheduleItemActive]}
                      >
                        <View style={styles.scheduleTime}>
                          <Text style={[styles.scheduleTimeText, isOngoing && styles.scheduleTimeTextActive]}>
                            {item.startTimeSlot}
                          </Text>
                        </View>
                        <View style={styles.scheduleDetails}>
                          <Text style={[styles.scheduleSubject, isOngoing && styles.scheduleSubjectActive]}>
                            {item.subject}
                          </Text>
                          <Text style={styles.scheduleTeacher}>
                            Room {item.roomNumber} • {item.teacherName || 'TBA'}
                          </Text>
                        </View>
                        {isOngoing && (
                          <View style={styles.ongoingBadge}>
                            <Text style={styles.ongoingText}>ONGOING</Text>
                          </View>
                        )}
                      </View>
                    );
                  })
              )}
            </View>
          </View>
        )}

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
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: THEME.primary,
    overflow: "hidden",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
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
    color: "#0f172a",
  },
  seeAllText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "600",
  },
  // Header styles
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  // Hero section
  heroSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  heroTextNormal: {
    fontSize: 20,
    color: "#1f2937",
    fontWeight: "500",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroTextHighlight: {
    fontSize: 22,
    fontWeight: "700",
    color: THEME.primary,
  },
  // Featured overlay
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
  },
  decorCircle1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  featuredTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  featuredBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredCenter: {
    alignItems: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  featuredBottom: {
    alignItems: "flex-start",
  },
  featuredSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
  },
  // Course list and thumbnails
  courseList: {
    gap: 12,
  },
  thumbnailContainer: {
    width: 90,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    backgroundColor: THEME.primary,
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
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  courseProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  courseProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 8,
  },
  courseProgressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
  },
  courseProgressText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  // Featured Course
  featuredCard: {
    marginHorizontal: 20,
    height: 180,
    backgroundColor: "#1e1e2e",
    borderRadius: 20,
    overflow: "hidden",
  },
  featuredImageContainer: {
    height: 160,
    backgroundColor: "#e2e8f0",
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.primary,
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  featuredDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  progressContainer: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: 3,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
  },
  continueBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  // Courses List
  coursesList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  courseThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  courseThumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  courseInfo: {
    flex: 1,
    justifyContent: "center",
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  courseMetaText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 4,
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
  // Exam Card
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  examCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
    flexWrap: "wrap",
    gap: 12,
  },
  examMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  examMetaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  examStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    marginLeft: 8,
  },
  examStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Schedule Styles
  scheduleHighlight: {
    marginBottom: 16,
  },
  currentClassCard: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 16,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  currentClassSubject: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  currentClassMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  nextClassCard: {
    backgroundColor: "#fef3c7",
    padding: 14,
    borderRadius: 12,
  },
  nextClassLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#b45309",
    marginBottom: 4,
    letterSpacing: 1,
  },
  nextClassSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 2,
  },
  nextClassMeta: {
    fontSize: 12,
    color: "#b45309",
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  scheduleItemActive: {
    borderColor: THEME.primary,
    borderWidth: 2,
    backgroundColor: "#f0fdf4",
  },
  scheduleTime: {
    width: 50,
    marginRight: 12,
  },
  scheduleTimeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  scheduleTimeTextActive: {
    color: THEME.primary,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  scheduleSubjectActive: {
    color: THEME.primary,
  },
  scheduleTeacher: {
    fontSize: 12,
    color: "#64748b",
  },
  ongoingBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ongoingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  // Current/Next Class Highlight Card
  classHighlightCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: THEME.primary,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  liveClassIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  liveClassDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  liveClassLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  liveClassSubject: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  liveClassMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 2,
  },
  liveClassTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  nextClassIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  nextClassLabelHighlight: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
    letterSpacing: 1,
  },
  nextUpSubject: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  nextUpMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  classCardArrow: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -9,
    opacity: 0.7,
  },
});
