import { Course, getCourses } from "@/lib/enhancedApi";
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
    TextInput,
    View,
} from "react-native";

// Theme
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

// Get YouTube thumbnail from video URL or ID
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
  
  if (/^[a-zA-Z0-9_-]{11}$/.test(videoUrl)) {
    return `https://img.youtube.com/vi/${videoUrl}/mqdefault.jpg`;
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

export default function CoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "enrolled" | "free">("all");

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "enrolled") return matchesSearch && course.isEnrolled;
    if (activeFilter === "free") return matchesSearch && course.isFree;
    return matchesSearch;
  });

  const getStatusBadge = (course: Course) => {
    if (course.isEnrolled) {
      return { text: "Enrolled", bg: "#dcfce7", color: THEME.primary, icon: "checkmark-circle" as const };
    }
    if (course.isFree) {
      return { text: "Free", bg: "#dbeafe", color: "#2563eb", icon: "gift" as const };
    }
    return { text: "Premium", bg: "#fef3c7", color: "#b45309", icon: "star" as const };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="library" size={24} color="white" />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Courses</Text>
              <Text style={styles.headerSubtitle}>Explore & Learn</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
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
            <Ionicons name="library" size={24} color="white" />
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Courses</Text>
            <Text style={styles.headerSubtitle}>Explore & Learn</Text>
          </View>
          <Text style={styles.courseCount}>{courses.length} courses</Text>
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            placeholder="Search courses..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {(["all", "enrolled", "free"] as const).map((filter) => {
          const isActive = activeFilter === filter;
          const icons = { all: "grid", enrolled: "checkmark-done", free: "gift" } as const;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
            >
              <Ionicons 
                name={icons[filter]} 
                size={16} 
                color={isActive ? "white" : "#6b7280"} 
              />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter === "all" ? "All Courses" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filteredCourses.length} courses</Text>
        {searchQuery && (
          <Text style={styles.searchingFor}>for "{searchQuery}"</Text>
        )}
      </View>

      {/* Course Grid */}
      <View style={styles.courseList}>
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="book-outline" size={48} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "Try a different search term" : "Check back later for new courses"}
            </Text>
          </View>
        ) : (
          filteredCourses.map((course) => {
            const badge = getStatusBadge(course);
            const thumbnail = getCourseThumbnail(course);
            const lectureCount = course.syllabus?.reduce(
              (acc, mod) => acc + (mod.lectures?.length || 0), 0
            ) || course.lectureCount || 0;
            
            return (
              <Pressable
                key={course._id}
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
                      <Ionicons name="play-circle" size={40} color={THEME.primary} />
                    </View>
                  )}
                  {/* Play Button Overlay */}
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={20} color="white" style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                  {/* Badge */}
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon} size={12} color={badge.color} />
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  {/* Subject Chip */}
                  {course.subject && (
                    <View style={styles.subjectChip}>
                      <Text style={styles.subjectText}>{course.subject}</Text>
                    </View>
                  )}

                  {/* Title */}
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {course.title}
                  </Text>

                  {/* Description */}
                  {course.description && (
                    <Text style={styles.courseDescription} numberOfLines={2}>
                      {course.description}
                    </Text>
                  )}

                  {/* Meta Row */}
                  <View style={styles.metaRow}>
                    {lectureCount > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons name="videocam" size={14} color="#6b7280" />
                        <Text style={styles.metaText}>{lectureCount} videos</Text>
                      </View>
                    )}
                    {course.instructor?.name && (
                      <View style={styles.metaItem}>
                        <Ionicons name="person-circle" size={14} color="#6b7280" />
                        <Text style={styles.metaText}>{course.instructor.name}</Text>
                      </View>
                    )}
                  </View>

                  {/* Video Lecture Progress - Hidden for now */}
                  {/* {course.isEnrolled && course.progressPercent !== undefined && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{course.progressPercent}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[styles.progressFill, { width: `${course.progressPercent}%` }]}
                        />
                      </View>
                    </View>
                  )} */}
                </View>
              </Pressable>
            );
          })
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
  courseCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  searchContainer: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "white",
  },
  // Filters
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "white",
  },
  // Results
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  searchingFor: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  // Course List
  courseList: {
    paddingHorizontal: 16,
  },
  courseCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnailContainer: {
    position: "relative",
    height: 160,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardContent: {
    padding: 16,
  },
  subjectChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 22,
  },
  courseDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 19,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  progressContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: 3,
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
});
