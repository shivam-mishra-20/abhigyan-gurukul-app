import { getMyAttempts, getMyProgress } from "@/lib/studentApi";
import type { Attempt, ProgressDataPoint } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    View
} from "react-native";

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
};

export default function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const loadData = async () => {
    try {
      const [progress, attemptsList] = await Promise.all([
        getMyProgress(),
        getMyAttempts(),
      ]);
      setProgressData(progress);
      setAttempts(attemptsList.filter((a) => a.status === "submitted" || a.status === "graded"));
    } catch (error) {
      console.error("Error loading progress:", error);
      Alert.alert("Error", "Failed to load progress data.");
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

  // Calculate stats
  const totalExams = attempts.length;
  const averageScore =
    progressData.length > 0
      ? Math.round(progressData.reduce((sum, p) => sum + (p.percent || 0), 0) / progressData.length)
      : 0;
  const bestScore = progressData.length > 0
    ? Math.max(...progressData.map((p) => p.percent || 0))
    : 0;

  // Prepare chart data (last 10 attempts)
  const chartData = progressData.slice(-10).map((p, idx) => ({
    label: p.examTitle?.substring(0, 8) || `#${idx + 1}`,
    value: p.percent || 0,
  }));

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 100);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-14 pb-6 px-6" style={{ backgroundColor: THEME.primary }}>
          <Text className="text-white text-2xl font-bold">My Progress</Text>
          <Text className="text-white/80 text-sm mt-1">Track your performance over time</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-gray-500 mt-3">Loading progress...</Text>
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
        <Text className="text-white text-2xl font-bold">My Progress</Text>
        <Text className="text-white/80 text-sm mt-1">Track your performance over time</Text>
      </View>

      <View className="px-4 py-5">
        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: "#dcfce7" }}
            >
              <Ionicons name="document-text" size={20} color={THEME.primary} />
            </View>
            <Text className="text-gray-900 text-2xl font-bold">{totalExams}</Text>
            <Text className="text-gray-500 text-sm">Exams Taken</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="stats-chart" size={20} color="#f59e0b" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold">{averageScore}%</Text>
            <Text className="text-gray-500 text-sm">Average Score</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="trophy" size={20} color="#a855f7" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold">{bestScore}%</Text>
            <Text className="text-gray-500 text-sm">Best Score</Text>
          </View>
        </View>

        {/* Performance Chart */}
        {chartData.length > 0 ? (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">Score Trend</Text>

            {/* Simple Bar Chart */}
            <View className="flex-row items-end h-40 mb-3">
              {chartData.map((item, idx) => {
                const barHeight = (item.value / maxChartValue) * 140;
                const barColor =
                  item.value >= 70
                    ? THEME.primary
                    : item.value >= 40
                    ? "#f59e0b"
                    : "#ef4444";

                return (
                  <View key={idx} className="flex-1 items-center mx-0.5">
                    <Text className="text-gray-600 text-xs mb-1 font-medium">{item.value}%</Text>
                    <View
                      style={{
                        width: "70%",
                        height: Math.max(barHeight, 8),
                        backgroundColor: barColor,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                );
              })}
            </View>

            {/* X-axis Labels */}
            <View className="flex-row">
              {chartData.map((item, idx) => (
                <View key={idx} className="flex-1 items-center">
                  <Text className="text-gray-400 text-[10px]" numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100 mb-6">
            <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <Ionicons name="analytics-outline" size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 font-semibold mb-1">No Data Yet</Text>
            <Text className="text-gray-500 text-center text-sm">
              Complete exams to see your progress chart
            </Text>
          </View>
        )}

        {/* Recent Performance */}
        {progressData.length > 0 && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-gray-900 text-lg font-bold mb-4">Recent Performance</Text>

            {progressData.slice(-5).reverse().map((item, idx) => {
              const percent = item.percent || 0;
              const color = percent >= 70 ? THEME.primary : percent >= 40 ? "#f59e0b" : "#ef4444";

              return (
                <View
                  key={idx}
                  className="flex-row items-center py-3 border-b border-gray-100"
                  style={{ borderBottomWidth: idx === Math.min(progressData.length - 1, 4) ? 0 : 1 }}
                >
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium" numberOfLines={1}>
                      {item.examTitle || "Exam"}
                    </Text>
                    {item.submittedAt && (
                      <Text className="text-gray-400 text-xs">
                        {new Date(item.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 mr-2">
                      {item.totalScore}/{item.maxScore}
                    </Text>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: color + "20" }}
                    >
                      <Text style={{ color, fontWeight: "600" }}>{percent}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
