import { getAssignedExams, startExamAttempt } from "@/lib/studentApi";
import type { Attempt, Exam } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

type ExamStatus = "upcoming" | "active" | "ended" | "submitted" | "in_progress";

interface ExamWithAttempt extends Exam {
  attempt?: Attempt;
  status: ExamStatus;
}

export default function StudentExams() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamWithAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingExam, setStartingExam] = useState<string | null>(null);

  const loadExams = async () => {
    try {
      const assignedData = await getAssignedExams().catch(() => ({ exams: [], attempts: {} }));
      const examList = assignedData?.exams || [];
      const attempts: Record<string, Attempt> = assignedData?.attempts || {};
      const now = new Date();

      const processedExams: ExamWithAttempt[] = examList.map((exam) => {
        const attempt = attempts[exam._id];
        const startAt = exam.schedule?.startAt || exam.startAt;
        const endAt = exam.schedule?.endAt || exam.endAt;
        const startDate = startAt ? new Date(startAt) : null;
        const endDate = endAt ? new Date(endAt) : null;

        let status: ExamStatus = "active";
        
        if (attempt?.status === "submitted" || attempt?.status === "auto-submitted") {
          status = "submitted";
        } else if (attempt?.status === "in_progress") {
          status = "in_progress";
        } else if (startDate && now < startDate) {
          status = "upcoming";
        } else if (endDate && now > endDate) {
          status = "ended";
        }

        return { ...exam, attempt, status };
      });

      // Sort: in_progress first, then active, upcoming, then submitted
      processedExams.sort((a, b) => {
        const order: Record<ExamStatus, number> = {
          in_progress: 0,
          active: 1,
          upcoming: 2,
          submitted: 3,
          ended: 4,
        };
        return order[a.status] - order[b.status];
      });

      setExams(processedExams);
    } catch (error) {
      console.error("Error loading exams:", error);
      Alert.alert("Error", "Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadExams();
  }, []);

  const handleStartExam = async (exam: ExamWithAttempt) => {
    if (exam.attempt?.status === "in_progress") {
      router.push(`/(student)/attempt/${exam.attempt._id}` as any);
      return;
    }

    try {
      setStartingExam(exam._id);
      const { attemptId } = await startExamAttempt(exam._id);
      router.push(`/(student)/attempt/${attemptId}` as any);
    } catch (error: any) {
      console.error("Error starting exam:", error);
      Alert.alert("Error", error.message || "Failed to start exam. Please try again.");
    } finally {
      setStartingExam(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: ExamStatus) => {
    switch (status) {
      case "in_progress":
        return {
          label: "In Progress",
          bgColor: "#fef3c7",
          textColor: "#b45309",
          icon: "time" as const,
        };
      case "active":
        return {
          label: "Available",
          bgColor: "#dcfce7",
          textColor: THEME.primary,
          icon: "checkmark-circle" as const,
        };
      case "upcoming":
        return {
          label: "Upcoming",
          bgColor: "#e0f2fe",
          textColor: "#0284c7",
          icon: "calendar" as const,
        };
      case "submitted":
        return {
          label: "Submitted",
          bgColor: "#f3f4f6",
          textColor: "#6b7280",
          icon: "checkmark-done" as const,
        };
      case "ended":
        return {
          label: "Ended",
          bgColor: "#fee2e2",
          textColor: "#dc2626",
          icon: "close-circle" as const,
        };
    }
  };

  const renderActionButton = (exam: ExamWithAttempt) => {
    const isStarting = startingExam === exam._id;

    if (exam.status === "submitted") {
      return (
        <Pressable
          onPress={() => router.push(`/(student)/result/${exam.attempt?._id}` as any)}
          className="bg-gray-100 px-4 py-2.5 rounded-xl flex-row items-center"
        >
          <Ionicons name="eye" size={16} color="#6b7280" />
          <Text className="text-gray-600 font-semibold ml-2">View Result</Text>
        </Pressable>
      );
    }

    if (exam.status === "upcoming" || exam.status === "ended") {
      return (
        <View className="bg-gray-50 px-4 py-2.5 rounded-xl">
          <Text className="text-gray-400 font-medium">
            {exam.status === "upcoming" ? "Not Yet Available" : "Exam Ended"}
          </Text>
        </View>
      );
    }

    const isResume = exam.status === "in_progress";

    return (
      <Pressable
        onPress={() => handleStartExam(exam)}
        disabled={isStarting}
        className={`px-5 py-2.5 rounded-xl flex-row items-center ${isStarting ? "opacity-70" : ""}`}
        style={{ backgroundColor: isResume ? "#f59e0b" : THEME.primary }}
      >
        {isStarting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name={isResume ? "play" : "rocket"} size={16} color="white" />
            <Text className="text-white font-semibold ml-2">
              {isResume ? "Resume" : "Start Exam"}
            </Text>
          </>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-14 pb-6 px-6" style={{ backgroundColor: THEME.primary }}>
          <Text className="text-white text-2xl font-bold">My Exams</Text>
          <Text className="text-white/80 text-sm mt-1">View and manage your exams</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-gray-500 mt-3">Loading exams...</Text>
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
        <Text className="text-white text-2xl font-bold">My Exams</Text>
        <Text className="text-white/80 text-sm mt-1">View and manage your exams</Text>
      </View>

      <View className="px-4 py-5">
        {exams.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="document-text-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 text-lg font-semibold mb-2">No Exams Assigned</Text>
            <Text className="text-gray-500 text-center">
              You don't have any exams assigned yet. Check back later!
            </Text>
          </View>
        ) : (
          exams.map((exam) => {
            const statusConfig = getStatusConfig(exam.status);
            const startAt = exam.schedule?.startAt || exam.startAt;

            return (
              <View
                key={exam._id}
                className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
              >
                {/* Header Row */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-gray-900 text-lg font-bold" numberOfLines={2}>
                      {exam.title}
                    </Text>
                    {exam.subject && (
                      <Text className="text-gray-500 text-sm mt-0.5">{exam.subject}</Text>
                    )}
                  </View>
                  <View 
                    className="px-3 py-1.5 rounded-full flex-row items-center"
                    style={{ backgroundColor: statusConfig.bgColor }}
                  >
                    <Ionicons name={statusConfig.icon} size={14} color={statusConfig.textColor} />
                    <Text 
                      className="text-xs font-semibold ml-1"
                      style={{ color: statusConfig.textColor }}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Info Row */}
                <View className="flex-row flex-wrap gap-y-2 mb-4">
                  {exam.totalDurationMins && (
                    <View className="flex-row items-center mr-4">
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-1.5">{exam.totalDurationMins} mins</Text>
                    </View>
                  )}
                  {startAt && (
                    <View className="flex-row items-center mr-4">
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-1.5">
                        {formatDate(startAt)} {formatTime(startAt)}
                      </Text>
                    </View>
                  )}
                  {exam.classLevel && (
                    <View className="flex-row items-center">
                      <Ionicons name="school-outline" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm ml-1.5">{exam.classLevel}</Text>
                    </View>
                  )}
                </View>

                {/* Score if submitted */}
                {exam.status === "submitted" && exam.attempt?.totalScore !== undefined && (
                  <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600 font-medium">Your Score</Text>
                      <Text className="text-gray-900 text-lg font-bold">
                        {exam.attempt.totalScore}/{exam.attempt.maxScore}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Button */}
                <View className="items-end">{renderActionButton(exam)}</View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
