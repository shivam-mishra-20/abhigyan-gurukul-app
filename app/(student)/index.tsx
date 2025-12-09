import { getUser, logout } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function StudentHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/splash");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pt-14 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-sm opacity-90">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">
              {user?.name || "Student"}
            </Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="bg-white/20 p-3 rounded-full"
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between">
          <View className="bg-white/20 rounded-xl p-4 flex-1 mr-2">
            <Ionicons name="book" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">12</Text>
            <Text className="text-white text-xs opacity-90">
              Active Courses
            </Text>
          </View>
          <View className="bg-white/20 rounded-xl p-4 flex-1 ml-2">
            <Ionicons name="trophy" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">85%</Text>
            <Text className="text-white text-xs opacity-90">Avg Score</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="px-6 py-6">
        {/* Upcoming Exams */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Upcoming Exams
            </Text>
            <Pressable>
              <Text className="text-blue-500 font-semibold">View All</Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-semibold mb-1">
                  Mathematics Final Exam
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    Dec 15, 2025
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="time" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    2 hours • 100 marks
                  </Text>
                </View>
              </View>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-semibold">
                  In 6 days
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-semibold mb-1">
                  Science Mid-Term Test
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    Dec 20, 2025
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="time" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    1.5 hours • 80 marks
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-600 text-xs font-semibold">
                  In 11 days
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="document-text" size={24} color="#3b82f6" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Practice Tests
              </Text>
              <Text className="text-gray-500 text-xs">15 tests available</Text>
            </Pressable>

            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="bar-chart" size={24} color="#22c55e" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Performance
              </Text>
              <Text className="text-gray-500 text-xs">View analytics</Text>
            </Pressable>

            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="book" size={24} color="#a855f7" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Study Materials
              </Text>
              <Text className="text-gray-500 text-xs">Access resources</Text>
            </Pressable>

            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-amber-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="calendar" size={24} color="#f59e0b" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Attendance
              </Text>
              <Text className="text-gray-500 text-xs">
                Track your attendance
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Recent Activity
          </Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="checkmark" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  Completed Physics Quiz
                </Text>
                <Text className="text-gray-500 text-sm">Score: 18/20</Text>
              </View>
              <Text className="text-gray-400 text-xs">2h ago</Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="book" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  New study material uploaded
                </Text>
                <Text className="text-gray-500 text-sm">
                  Chemistry Chapter 5
                </Text>
              </View>
              <Text className="text-gray-400 text-xs">1d ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
