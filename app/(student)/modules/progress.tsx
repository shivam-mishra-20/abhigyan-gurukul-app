import PerformanceCharts from "@/components/PerformanceCharts";
import { getMyProgress } from "@/lib/studentApi";
import type { StudentAnalytics } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  secondary: "#f59e0b",
  danger: "#ef4444",
  text: "#1f2937",
  subtext: "#6b7280",
};

export default function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [mode, setMode] = useState<"online" | "offline">("online");

  const loadData = useCallback(async () => {
    try {
      const data = await getMyProgress(mode);
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading progress:", error);
      Alert.alert("Error", "Failed to load progress data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View
          className="pt-14 pb-6 px-6"
          style={{ backgroundColor: THEME.primary }}
        >
          <Text className="text-white text-2xl font-bold">My Progress</Text>
          <Text className="text-white/80 text-sm mt-1">
            Track your performance over time
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-gray-500 mt-3">Loading analytics...</Text>
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
      <View
        className="pt-14 pb-6 px-6"
        style={{ backgroundColor: THEME.primary }}
      >
        <Text className="text-white text-2xl font-bold">My Progress</Text>
        <Text className="text-white/80 text-sm mt-1">
          Detailed performance analytics
        </Text>
      </View>

      {/* Toggle - Using pure styles to avoid css-interop crash */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setMode("online")}
          style={[
            styles.toggleButton,
            mode === "online" && styles.toggleButtonActive,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleButtonText,
              mode === "online" && styles.toggleButtonTextActive,
            ]}
          >
            Online Tests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("offline")}
          style={[
            styles.toggleButton,
            mode === "offline" && styles.toggleButtonActive,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleButtonText,
              mode === "offline" && styles.toggleButtonTextActive,
            ]}
          >
            Offline Results
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 py-5 pb-10">
        {/* Main Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center">
            <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-green-100">
              <Ionicons name="document-text" size={20} color={THEME.primary} />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              {analytics?.examsTaken || 0}
            </Text>
            <Text className="text-gray-500 text-xs">Exams</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center">
            <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="stats-chart" size={20} color="#f59e0b" />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              {analytics?.avgScore || 0}%
            </Text>
            <Text className="text-gray-500 text-xs">Avg Score</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center">
            <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="help-circle" size={20} color="#a855f7" />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              {analytics?.totalQuestionsPracticed || 0}
            </Text>
            <Text className="text-gray-500 text-xs">Questions</Text>
          </View>
        </View>

        <PerformanceCharts analytics={analytics} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#e5e7eb",
    padding: 4,
    borderRadius: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButtonText: {
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleButtonTextActive: {
    color: "#047857",
  },
});
