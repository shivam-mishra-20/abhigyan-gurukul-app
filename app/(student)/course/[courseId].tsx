import { Course, enrollInCourse, getCourseDetail } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
};

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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading course...</Text>
      </SafeAreaView>
    );
  }

  const completedLectures = (course as any).completedLectures || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>
              Course Details
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Hero */}
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} className="w-full h-48" resizeMode="cover" />
        ) : (
          <View
            className="w-full h-48 items-center justify-center"
            style={{ backgroundColor: THEME.primary + "30" }}
          >
            <Ionicons name="book" size={64} color={THEME.primary} />
          </View>
        )}

        <View className="px-4 py-5">
          {/* Title & Meta */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <View className="flex-row items-center mb-2">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{ backgroundColor: course.isEnrolled ? "#dcfce7" : "#dbeafe" }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: course.isEnrolled ? THEME.primary : "#2563eb" }}
                >
                  {course.isEnrolled ? "Enrolled" : course.isFree ? "Free" : "Premium"}
                </Text>
              </View>
              <Text className="text-gray-500 text-sm">{course.subject}</Text>
            </View>

            <Text className="text-gray-900 text-xl font-bold mb-2">{course.title}</Text>

            {course.description && (
              <Text className="text-gray-600 mb-4">{course.description}</Text>
            )}

            {/* Stats */}
            <View className="flex-row flex-wrap gap-4 py-3 border-t border-gray-100">
              {course.lectureCount !== undefined && (
                <View className="flex-row items-center">
                  <Ionicons name="play-circle" size={20} color={THEME.primary} />
                  <Text className="text-gray-700 ml-2">{course.lectureCount} Lectures</Text>
                </View>
              )}
              {course.duration !== undefined && (
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color={THEME.primary} />
                  <Text className="text-gray-700 ml-2">{course.duration} Hours</Text>
                </View>
              )}
              {course.instructor?.name && (
                <View className="flex-row items-center">
                  <Ionicons name="person" size={20} color={THEME.primary} />
                  <Text className="text-gray-700 ml-2">{course.instructor.name}</Text>
                </View>
              )}
            </View>

            {/* Progress */}
            {course.isEnrolled && course.progressPercent !== undefined && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Your Progress</Text>
                  <Text className="text-emerald-600 font-bold">{course.progressPercent}%</Text>
                </View>
                <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </View>
              </View>
            )}

            {/* Enroll Button */}
            {!course.isEnrolled && (
              <Pressable
                onPress={handleEnroll}
                disabled={enrolling}
                className="mt-4 py-4 rounded-xl items-center"
                style={{ backgroundColor: THEME.primary }}
              >
                {enrolling ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    {course.isFree ? "Enroll for Free" : "Enroll Now"}
                  </Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Syllabus */}
          {course.syllabus && course.syllabus.length > 0 && (
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <Text className="text-gray-900 text-lg font-bold mb-4">Course Content</Text>

              {course.syllabus.map((section, sIdx) => {
                const isExpanded = expandedSections.has(sIdx);
                const sectionCompleted = section.lectures.filter((l) =>
                  completedLectures.includes(l._id)
                ).length;

                return (
                  <View key={sIdx} className="mb-3">
                    <Pressable
                      onPress={() => toggleSection(sIdx)}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100"
                    >
                      <View className="flex-1">
                        <Text className="text-gray-800 font-semibold">{section.title}</Text>
                        <Text className="text-gray-500 text-sm">
                          {sectionCompleted}/{section.lectures.length} completed
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6b7280"
                      />
                    </Pressable>

                    {isExpanded && (
                      <View className="pl-4 pt-2">
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
                                lectureId: lecture._id || `lecture-${lIdx}`,
                                courseId: courseId,
                                videoUrl: lecture.videoUrl,
                                title: lecture.title,
                              }
                            } as any);
                          };

                          return (
                            <Pressable
                              key={lIdx}
                              onPress={handleLecturePress}
                              className="flex-row items-center py-3 border-b border-gray-50 active:bg-gray-50"
                            >
                              <View
                                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                  isCompleted ? "bg-emerald-500" : isLocked ? "bg-gray-100" : "bg-emerald-100"
                                }`}
                              >
                                {isCompleted ? (
                                  <Ionicons name="checkmark" size={16} color="white" />
                                ) : isLocked ? (
                                  <Ionicons name="lock-closed" size={14} color="#9ca3af" />
                                ) : (
                                  <Ionicons name="play" size={14} color={THEME.primary} />
                                )}
                              </View>
                              <View className="flex-1">
                                <Text
                                  className={`${
                                    isCompleted ? "text-gray-500" : "text-gray-800"
                                  } font-medium`}
                                >
                                  {lecture.title}
                                </Text>
                                <View className="flex-row items-center mt-0.5">
                                  {lecture.duration && (
                                    <Text className="text-gray-400 text-xs">
                                      {lecture.duration} mins
                                    </Text>
                                  )}
                                  {hasVideo && (
                                    <View className="flex-row items-center ml-2">
                                      <Ionicons name="videocam" size={12} color="#10b981" />
                                      <Text className="text-emerald-600 text-xs ml-1">Video</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              {!isLocked && hasVideo && (
                                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
