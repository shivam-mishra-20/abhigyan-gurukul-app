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
    Text,
    TextInput,
    View,
} from "react-native";

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
};

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
      return { text: "Enrolled", bg: "#dcfce7", color: THEME.primary };
    }
    if (course.isFree) {
      return { text: "Free", bg: "#dbeafe", color: "#2563eb" };
    }
    return { text: "Premium", bg: "#fef3c7", color: "#b45309" };
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-14 pb-6 px-6" style={{ backgroundColor: THEME.primary }}>
          <Text className="text-white text-2xl font-bold">Courses</Text>
          <Text className="text-white/80 text-sm mt-1">Explore and learn</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-gray-500 mt-3">Loading courses...</Text>
        </View>
      </View>
    );
  }

  return (
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
      <View className="pt-14 pb-6 px-6" style={{ backgroundColor: THEME.primary }}>
        <Text className="text-white text-2xl font-bold">Courses</Text>
        <Text className="text-white/80 text-sm mt-1">Explore and learn</Text>
        
        {/* Search */}
        <View className="mt-4 bg-white/20 rounded-xl flex-row items-center px-4 py-3">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            placeholder="Search courses..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-white"
          />
        </View>
      </View>

      {/* Filters */}
      <View className="flex-row px-4 py-3 gap-2">
        {(["all", "enrolled", "free"] as const).map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full ${
              activeFilter === filter ? "bg-emerald-600" : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`font-medium capitalize ${
                activeFilter === filter ? "text-white" : "text-gray-600"
              }`}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Course Grid */}
      <View className="px-4 pb-6">
        {filteredCourses.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="book-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 text-lg font-semibold mb-2">No Courses Found</Text>
            <Text className="text-gray-500 text-center">
              {searchQuery ? "Try a different search term" : "Check back later for new courses"}
            </Text>
          </View>
        ) : (
          filteredCourses.map((course) => {
            const badge = getStatusBadge(course);
            
            return (
              <Pressable
                key={course._id}
                onPress={() => router.push(`/(student)/course/${course._id}` as any)}
                className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98]"
              >
                {/* Thumbnail */}
                {course.thumbnail ? (
                  <Image
                    source={{ uri: course.thumbnail }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                ) : (
                  <View 
                    className="w-full h-40 items-center justify-center"
                    style={{ backgroundColor: THEME.primary + "20" }}
                  >
                    <Ionicons name="book" size={48} color={THEME.primary} />
                  </View>
                )}

                <View className="p-4">
                  {/* Badge */}
                  <View className="flex-row items-center mb-2">
                    <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: badge.bg }}>
                      <Text className="text-xs font-semibold" style={{ color: badge.color }}>
                        {badge.text}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs">{course.subject}</Text>
                  </View>

                  {/* Title */}
                  <Text className="text-gray-900 text-lg font-bold mb-2" numberOfLines={2}>
                    {course.title}
                  </Text>

                  {/* Description */}
                  {course.description && (
                    <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
                      {course.description}
                    </Text>
                  )}

                  {/* Meta */}
                  <View className="flex-row items-center flex-wrap gap-3">
                    {course.lectureCount !== undefined && (
                      <View className="flex-row items-center">
                        <Ionicons name="play-circle" size={16} color="#6b7280" />
                        <Text className="text-gray-600 text-sm ml-1">
                          {course.lectureCount} lectures
                        </Text>
                      </View>
                    )}
                    {course.duration !== undefined && (
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={16} color="#6b7280" />
                        <Text className="text-gray-600 text-sm ml-1">
                          {course.duration}h
                        </Text>
                      </View>
                    )}
                    {course.instructor?.name && (
                      <View className="flex-row items-center">
                        <Ionicons name="person" size={16} color="#6b7280" />
                        <Text className="text-gray-600 text-sm ml-1">
                          {course.instructor.name}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Progress */}
                  {course.isEnrolled && course.progressPercent !== undefined && (
                    <View className="mt-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-gray-500 text-xs">Progress</Text>
                        <Text className="text-emerald-600 text-xs font-semibold">
                          {course.progressPercent}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
