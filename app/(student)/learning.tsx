import { Course, getEnrolledCourses } from "@/lib/enhancedApi";
import { getMyAttempts, getMyProgress } from "@/lib/studentApi";
import type { Attempt, ProgressDataPoint } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
};

export default function LearningScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [activeTab, setActiveTab] = useState<"courses" | "exams" | "analytics">("courses");

  const loadData = async () => {
    try {
      const [courses, progress, attemptsList] = await Promise.all([
        getEnrolledCourses().catch(() => []),
        getMyProgress().catch(() => []),
        getMyAttempts().catch(() => []),
      ]);
      setEnrolledCourses(courses);
      setProgressData(progress);
      setAttempts(attemptsList.filter((a) => a.status === "submitted" || a.status === "auto-submitted"));
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

  // Stats calculation
  const totalExams = attempts.length;
  const avgScore = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + (p.percent || 0), 0) / progressData.length)
    : 0;
  const totalTimeSpent = enrolledCourses.reduce((sum, c) => sum + ((c as any).timeSpent || 0), 0);
  const hoursSpent = Math.floor(totalTimeSpent / 60);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-14 pb-6 px-6" style={{ backgroundColor: THEME.primary }}>
          <Text className="text-white text-2xl font-bold">My Learning</Text>
          <Text className="text-white/80 text-sm mt-1">Track your progress</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-gray-500 mt-3">Loading...</Text>
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
        <Text className="text-white text-2xl font-bold">My Learning</Text>
        <Text className="text-white/80 text-sm mt-1">Track your progress</Text>
      </View>

      {/* Stats Cards */}
      <View className="px-4 py-4">
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Ionicons name="book" size={24} color={THEME.primary} />
            <Text className="text-gray-900 text-2xl font-bold mt-2">{enrolledCourses.length}</Text>
            <Text className="text-gray-500 text-sm">Courses</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text className="text-gray-900 text-2xl font-bold mt-2">{avgScore}%</Text>
            <Text className="text-gray-500 text-sm">Avg Score</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Ionicons name="time" size={24} color="#a855f7" />
            <Text className="text-gray-900 text-2xl font-bold mt-2">{hoursSpent}h</Text>
            <Text className="text-gray-500 text-sm">Learning</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 gap-2 mb-4">
        {(["courses", "exams", "analytics"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl flex-1 items-center ${
              activeTab === tab ? "bg-emerald-600" : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                activeTab === tab ? "text-white" : "text-gray-600"
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View className="px-4 pb-6">
        {activeTab === "courses" && (
          <>
            {enrolledCourses.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                  <Ionicons name="book-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-800 font-semibold mb-1">No Courses Yet</Text>
                <Text className="text-gray-500 text-center text-sm">
                  Enroll in a course to start learning
                </Text>
                <Pressable
                  onPress={() => router.push("/(student)/courses")}
                  className="mt-4 px-6 py-3 rounded-xl"
                  style={{ backgroundColor: THEME.primary }}
                >
                  <Text className="text-white font-semibold">Browse Courses</Text>
                </Pressable>
              </View>
            ) : (
              enrolledCourses.map((course) => (
                <Pressable
                  key={course._id}
                  onPress={() => router.push(`/(student)/course/${course._id}` as any)}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row"
                >
                  <View
                    className="w-16 h-16 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: THEME.primary + "20" }}
                  >
                    <Ionicons name="book" size={28} color={THEME.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold" numberOfLines={1}>
                      {course.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">{course.subject}</Text>
                    <View className="mt-2">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-gray-400 text-xs">Progress</Text>
                        <Text className="text-emerald-600 text-xs font-semibold">
                          {course.progressPercent || 0}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${course.progressPercent || 0}%` }}
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </>
        )}

        {activeTab === "exams" && (
          <>
            {attempts.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                  <Ionicons name="document-text-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-800 font-semibold mb-1">No Exams Taken</Text>
                <Text className="text-gray-500 text-center text-sm">
                  Take an exam to see your history
                </Text>
              </View>
            ) : (
              attempts.slice(0, 10).map((attempt) => {
                const percent = attempt.maxScore
                  ? Math.round(((attempt.totalScore || 0) / attempt.maxScore) * 100)
                  : 0;
                const color = percent >= 70 ? THEME.primary : percent >= 40 ? "#f59e0b" : "#ef4444";

                return (
                  <Pressable
                    key={attempt._id}
                    onPress={() => router.push(`/(student)/result/${attempt._id}` as any)}
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-bold" numberOfLines={1}>
                          {attempt.examTitle || "Exam"}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-900 font-bold">
                          {attempt.totalScore || 0}/{attempt.maxScore || 0}
                        </Text>
                        <View className="px-2 py-1 rounded-full mt-1" style={{ backgroundColor: color + "20" }}>
                          <Text style={{ color }} className="text-xs font-semibold">
                            {percent}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {activeTab === "analytics" && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-gray-900 text-lg font-bold mb-4">Performance Summary</Text>

            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600">Total Exams Taken</Text>
                <Text className="text-gray-900 font-bold">{totalExams}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600">Average Score</Text>
                <Text style={{ color: avgScore >= 70 ? THEME.primary : "#f59e0b" }} className="font-bold">
                  {avgScore}%
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600">Courses Enrolled</Text>
                <Text className="text-gray-900 font-bold">{enrolledCourses.length}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">Time Spent Learning</Text>
                <Text className="text-gray-900 font-bold">{hoursSpent} hours</Text>
              </View>
            </View>

            {progressData.length > 0 && (
              <>
                <Text className="text-gray-700 font-semibold mb-3 pt-3 border-t border-gray-100">
                  Recent Performance
                </Text>
                {progressData.slice(-5).reverse().map((item, idx) => {
                  const percent = item.percent || 0;
                  const color = percent >= 70 ? THEME.primary : percent >= 40 ? "#f59e0b" : "#ef4444";
                  return (
                    <View key={idx} className="flex-row items-center justify-between py-2">
                      <Text className="text-gray-600 flex-1" numberOfLines={1}>
                        {item.examTitle || "Exam"}
                      </Text>
                      <Text style={{ color }} className="font-semibold">
                        {percent}%
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
