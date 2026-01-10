import { Course, enrollInCourse, getCourseDetail } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

// Get YouTube thumbnail
function getYouTubeThumbnail(videoUrl?: string, youtubeMeta?: { thumbnail?: string }): string | null {
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
        firstLecture.youtubeMeta
      );
    }
  }
  
  return null;
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const loadCourse = async () => {
    try {
      const data = await getCourseDetail(courseId!);
      setCourse(data);
    } catch (error) {
      console.error("Error loading course:", error);
      Alert.alert("Error", "Failed to load course details");
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourse();
  }, []);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollInCourse(courseId!);
      Alert.alert("Success", "You have been enrolled in this course!");
      loadCourse();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (loading || !course) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading course...</Text>
      </View>
    );
  }

  const completedLectures = (course as any).completedLectures || [];
  const thumbnail = getCourseThumbnail(course);
  const totalLectures = course.syllabus?.reduce((acc, s) => acc + s.lectures.length, 0) || course.lectureCount || 0;

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroContainer}>
        {thumbnail ? (
          <Image 
            source={{ uri: thumbnail }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Ionicons name="book" size={64} color={THEME.primary} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />
        
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>

        {/* Badge */}
        <View style={styles.heroBadge}>
          {course.isEnrolled ? (
            <>
              <Ionicons name="checkmark-circle" size={14} color="white" />
              <Text style={styles.heroBadgeText}>Enrolled</Text>
            </>
          ) : course.isFree ? (
            <>
              <Ionicons name="gift" size={14} color="white" />
              <Text style={styles.heroBadgeText}>Free</Text>
            </>
          ) : (
            <>
              <Ionicons name="star" size={14} color="white" />
              <Text style={styles.heroBadgeText}>Premium</Text>
            </>
          )}
        </View>

        {/* Hero Content */}
        <View style={styles.heroContent}>
          {course.subject && (
            <Text style={styles.heroSubject}>{course.subject}</Text>
          )}
          <Text style={styles.heroTitle} numberOfLines={2}>{course.title}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#ecfdf5" }]}>
              <Ionicons name="videocam" size={18} color={THEME.primary} />
            </View>
            <Text style={styles.statValue}>{totalLectures}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          {course.duration !== undefined && (
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="time" size={18} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{course.duration}h</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          )}
          {course.instructor?.name && (
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#f3e8ff" }]}>
                <Ionicons name="person" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue} numberOfLines={1}>
                {course.instructor.name.split(' ')[0]}
              </Text>
              <Text style={styles.statLabel}>Instructor</Text>
            </View>
          )}
          {course.isEnrolled && (
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="trophy" size={18} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{course.progressPercent || 0}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {course.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>About this course</Text>
            <Text style={styles.descriptionText}>{course.description}</Text>
          </View>
        )}

        {/* Video Lecture Progress Bar - Hidden for now */}
        {/* {course.isEnrolled && course.progressPercent !== undefined && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPercent}>{course.progressPercent}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${course.progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressHint}>
              {completedLectures.length} of {totalLectures} videos completed
            </Text>
          </View>
        )} */}

        {/* Enroll Button */}
        {!course.isEnrolled && (
          <Pressable
            onPress={handleEnroll}
            disabled={enrolling}
            style={[styles.enrollButton, enrolling && { opacity: 0.7 }]}
          >
            {enrolling ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.enrollButtonText}>
                  {course.isFree ? "Enroll for Free" : "Enroll Now"}
                </Text>
              </>
            )}
          </Pressable>
        )}

        {/* Syllabus */}
        {course.syllabus && course.syllabus.length > 0 && (
          <View style={styles.syllabusCard}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            <Text style={styles.syllabusSubtitle}>
              {course.syllabus.length} modules • {totalLectures} videos
            </Text>

            {course.syllabus.map((section, sIdx) => {
              const isExpanded = expandedSections.has(sIdx);
              const sectionCompleted = section.lectures.filter((l) =>
                completedLectures.includes(l._id)
              ).length;

              return (
                <View key={sIdx} style={styles.moduleContainer}>
                  <Pressable
                    onPress={() => toggleSection(sIdx)}
                    style={styles.moduleHeader}
                  >
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleNumber}>Module {sIdx + 1}</Text>
                      <Text style={styles.moduleTitle} numberOfLines={1}>{section.title}</Text>
                      <Text style={styles.moduleProgress}>
                        {sectionCompleted}/{section.lectures.length} completed
                      </Text>
                    </View>
                    <View style={[
                      styles.moduleChevron,
                      isExpanded && styles.moduleChevronExpanded
                    ]}>
                      <Ionicons name="chevron-down" size={18} color="#6b7280" />
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.lecturesContainer}>
                      {section.lectures.map((lecture, lIdx) => {
                        const isCompleted = completedLectures.includes(lecture._id);
                        const isLocked = !course.isEnrolled && !course.isFree;
                        const hasVideo = !!lecture.videoUrl;

                        const handleLecturePress = () => {
                          if (isLocked) {
                            Alert.alert("Locked", "Enroll in this course to access the content.");
                            return;
                          }
                          if (!hasVideo) {
                            Alert.alert("No Video", "This lecture doesn't have a video yet.");
                            return;
                          }
                          router.push({
                            pathname: "/(student)/video/[lectureId]",
                            params: {
                              lectureId: lecture._id, // Actual MongoDB ID for progress tracking
                              courseId: courseId,
                              videoUrl: lecture.videoUrl || lecture.youtubeVideoId || "",
                              title: lecture.title,
                              moduleIndex: sIdx.toString(),
                              lectureIndex: lIdx.toString(), // For UI display
                            }
                          } as any);
                        };

                        const videoId = lecture.youtubeVideoId || (lecture.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1]);
                        const lectureThumbnail = (lecture as any).youtubeMeta?.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
                        const durationSec = (lecture as any).youtubeMeta?.durationSec;

                        return (
                          <Pressable
                            key={lIdx}
                            onPress={handleLecturePress}
                            style={styles.lectureItem}
                          >
                            {/* Thumbnail */}
                            <View style={styles.lectureThumbnail}>
                              {lectureThumbnail ? (
                                <Image 
                                  source={{ uri: lectureThumbnail }} 
                                  style={styles.lectureThumbnailImg}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={[styles.lectureThumbnailImg, styles.thumbnailPlaceholder]}>
                                  {isLocked ? (
                                    <Ionicons name="lock-closed" size={18} color="#9ca3af" />
                                  ) : (
                                    <Ionicons name="play-circle" size={22} color={THEME.primary} />
                                  )}
                                </View>
                              )}
                              {durationSec && (
                                <View style={styles.durationBadge}>
                                  <Text style={styles.durationText}>
                                    {Math.floor(durationSec / 60)}:{(durationSec % 60).toString().padStart(2, '0')}
                                  </Text>
                                </View>
                              )}
                              {isCompleted && (
                                <View style={styles.completedOverlay}>
                                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                </View>
                              )}
                            </View>
                            
                            <View style={styles.lectureInfo}>
                              <Text
                                style={[styles.lectureTitle, isCompleted && styles.lectureTitleCompleted]}
                                numberOfLines={2}
                              >
                                {lIdx + 1}. {lecture.title}
                              </Text>
                              <View style={styles.lectureMeta}>
                                {durationSec && (
                                  <Text style={styles.lectureMetaText}>
                                    {Math.floor(durationSec / 60)} min
                                  </Text>
                                )}
                                {!durationSec && lecture.duration && (
                                  <Text style={styles.lectureMetaText}>
                                    {lecture.duration} mins
                                  </Text>
                                )}
                                {hasVideo && (
                                  <View style={styles.youtubeBadge}>
                                    <Ionicons name="logo-youtube" size={12} color="#ef4444" />
                                    <Text style={styles.youtubeBadgeText}>YouTube</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            
                            {!isLocked && hasVideo && (
                              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  // Hero
  heroContainer: {
    height: 240,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadge: {
    position: "absolute",
    top: 48,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  heroSubject: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    lineHeight: 30,
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  // Description
  descriptionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  // Progress
  progressCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
  },
  // Enroll
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 20,
    gap: 8,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  // Syllabus
  syllabusCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  syllabusSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    marginTop: -6,
  },
  moduleContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f9fafb",
  },
  moduleInfo: {
    flex: 1,
  },
  moduleNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.primary,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  moduleProgress: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  moduleChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  moduleChevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  // Lectures
  lecturesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "white",
  },
  lectureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  lectureThumbnail: {
    width: 80,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
    position: "relative",
  },
  lectureThumbnailImg: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  lectureTitleCompleted: {
    color: "#6b7280",
  },
  lectureMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lectureMetaText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  youtubeBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    gap: 3,
  },
  youtubeBadgeText: {
    fontSize: 11,
    color: "#ef4444",
  },
});
