import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

const COLORS = {
  primary: "#5ab348",
  blue: "#3b82f6",
};

interface StudentPerformance {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentBatch: string;
  totalAttempts: number;
  avgScore: number;
  maxScore: number;
  accuracy: number;
}

interface BatchStat {
  batch: string;
  avgScore: number;
  totalAttempts: number;
  studentCount: number;
}

export default function TeacherPerformance() {
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [batchStats, setBatchStats] = useState<BatchStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  const fetchPerformance = useCallback(async () => {
    try {
      const params = selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : "";
      const res = await apiFetch(`/api/teacher/performance${params}`) as {
        performance: StudentPerformance[];
        batchStats: BatchStat[];
      };
      setPerformance(res?.performance || []);
      setBatchStats(res?.batchStats || []);
    } catch (error) {
      console.error("Error fetching performance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: "bg-green-100", text: "text-green-700" };
    if (score >= 50) return { bg: "bg-amber-100", text: "text-amber-700" };
    return { bg: "bg-red-100", text: "text-red-700" };
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-14 pb-6 px-6" style={{ backgroundColor: COLORS.blue }}>
        <Text className="text-white text-2xl font-bold">Performance</Text>
        <Text className="text-white/80 text-sm">
          Student analytics & reports
        </Text>
      </View>

      {/* Batch Filter */}
      {batchStats.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 py-4"
        >
          <Pressable
            onPress={() => setSelectedBatch("")}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedBatch === "" ? "bg-blue-500" : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`font-semibold ${
                selectedBatch === "" ? "text-white" : "text-gray-600"
              }`}
            >
              All
            </Text>
          </Pressable>
          {batchStats.map((stat) => (
            <Pressable
              key={stat.batch}
              onPress={() =>
                setSelectedBatch(selectedBatch === stat.batch ? "" : stat.batch)
              }
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedBatch === stat.batch
                  ? "bg-blue-500"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedBatch === stat.batch ? "text-white" : "text-gray-600"
                }`}
              >
                {stat.batch} ({stat.avgScore.toFixed(0)}%)
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPerformance();
            }}
            colors={[COLORS.blue]}
          />
        }
      >
        {/* Batch Stats Summary */}
        {batchStats.length > 0 && !selectedBatch && (
          <View className="mb-6">
            <Text className="text-gray-900 font-bold text-lg mb-3">
              Batch Overview
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {batchStats.map((stat) => {
                const scoreStyle = getScoreColor(stat.avgScore);
                return (
                  <Pressable
                    key={stat.batch}
                    onPress={() => setSelectedBatch(stat.batch)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1 min-w-[45%]"
                  >
                    <Text className="text-gray-900 font-bold mb-1">{stat.batch}</Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-500 text-sm">
                        {stat.studentCount} students
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${scoreStyle.bg}`}>
                        <Text className={`text-sm font-semibold ${scoreStyle.text}`}>
                          {stat.avgScore.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Student List */}
        {performance.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="bar-chart-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No performance data</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              Data will appear after students complete exams
            </Text>
          </View>
        ) : (
          <View>
            <Text className="text-gray-900 font-bold text-lg mb-3">
              Students {selectedBatch && `in ${selectedBatch}`}
            </Text>
            {performance.map((student) => {
              const scoreStyle = getScoreColor(student.avgScore);
              return (
                <View
                  key={student._id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
                >
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <Text className="text-blue-700 font-bold">
                        {student.studentName.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold">
                        {student.studentName}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {student.studentBatch}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${scoreStyle.bg}`}>
                      <Text className={`font-bold ${scoreStyle.text}`}>
                        {student.avgScore.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <View className="items-center flex-1">
                      <Text className="text-gray-400 text-xs">Attempts</Text>
                      <Text className="text-gray-900 font-semibold">
                        {student.totalAttempts}
                      </Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-gray-400 text-xs">Best Score</Text>
                      <Text className="text-gray-900 font-semibold">
                        {student.maxScore.toFixed(0)}%
                      </Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-gray-400 text-xs">Accuracy</Text>
                      <Text className="text-gray-900 font-semibold">
                        {student.accuracy.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
