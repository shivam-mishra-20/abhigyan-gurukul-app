import { getMyAttempts } from "@/lib/studentApi";
import type { Attempt } from "@/lib/types";
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
};

export default function StudentResults() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadResults = async () => {
    try {
      const data = await getMyAttempts();
      const submittedAttempts = data.filter(
        (a) => a.status === "submitted" || a.status === "graded"
      );
      submittedAttempts.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });
      setAttempts(submittedAttempts);
    } catch (error) {
      console.error("Error loading results:", error);
      Alert.alert("Error", "Failed to load results. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResults();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScorePercentage = (score?: number, maxScore?: number): number => {
    if (score === undefined || maxScore === undefined || maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 70) return { bg: "#dcfce7", text: THEME.primary, bar: THEME.primary };
    if (percent >= 40) return { bg: "#fef3c7", text: "#b45309", bar: "#f59e0b" };
    return { bg: "#fee2e2", text: "#dc2626", bar: "#ef4444" };
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-14 pb-6 px-6" style={{ backgroundColor: THEME.primary }}>
          <Text className="text-white text-2xl font-bold">My Results</Text>
          <Text className="text-white/80 text-sm mt-1">Track your performance</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-gray-500 mt-3">Loading results...</Text>
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
        <Text className="text-white text-2xl font-bold">My Results</Text>
        <Text className="text-white/80 text-sm mt-1">Track your performance</Text>
      </View>

      <View className="px-4 py-5">
        {attempts.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="trophy-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 text-lg font-semibold mb-2">No Results Yet</Text>
            <Text className="text-gray-500 text-center">
              Complete an exam to see your results here.
            </Text>
          </View>
        ) : (
          attempts.map((attempt) => {
            const percent = getScorePercentage(attempt.totalScore, attempt.maxScore);
            const colors = getScoreColor(percent);
            const isPublished = attempt.resultPublished !== false;

            return (
              <Pressable
                key={attempt._id}
                onPress={() => {
                  if (isPublished) {
                    router.push(`/(student)/result/${attempt._id}` as any);
                  } else {
                    Alert.alert("Pending", "Results are not published yet.");
                  }
                }}
                className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 active:scale-[0.98]"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-gray-900 text-lg font-bold" numberOfLines={2}>
                      {attempt.examTitle || "Exam"}
                    </Text>
                    <View className="flex-row items-center mt-1.5">
                      <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-sm ml-1.5">
                        {formatDate(attempt.submittedAt)}
                      </Text>
                    </View>
                  </View>
                  {!isPublished ? (
                    <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                      <Text className="text-gray-600 text-xs font-semibold">Pending</Text>
                    </View>
                  ) : (
                    <View 
                      className="px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: colors.text }}>
                        {percent}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* Score Display */}
                {isPublished && attempt.totalScore !== undefined && (
                  <View className="mt-2">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600 font-medium">Score</Text>
                      <Text className="text-gray-900 text-lg font-bold">
                        {attempt.totalScore}/{attempt.maxScore}
                      </Text>
                    </View>
                    {/* Progress Bar */}
                    <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: colors.bar,
                        }}
                      />
                    </View>
                  </View>
                )}

                {/* View Details */}
                {isPublished && (
                  <View className="flex-row items-center justify-end mt-4">
                    <Text style={{ color: THEME.primary }} className="font-semibold mr-1">
                      View Details
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={THEME.primary} />
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
