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

export default function TeacherHome() {
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
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-600 pt-14 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-sm opacity-90">Hello,</Text>
            <Text className="text-white text-2xl font-bold">
              {user?.name || "Teacher"}
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
        <View className="flex-row justify-between gap-3">
          <View className="bg-white/20 rounded-xl p-4 flex-1">
            <Ionicons name="people" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">245</Text>
            <Text className="text-white text-xs opacity-90">
              Total Students
            </Text>
          </View>
          <View className="bg-white/20 rounded-xl p-4 flex-1">
            <Ionicons name="document-text" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">18</Text>
            <Text className="text-white text-xs opacity-90">Active Exams</Text>
          </View>
          <View className="bg-white/20 rounded-xl p-4 flex-1">
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">156</Text>
            <Text className="text-white text-xs opacity-90">Graded</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="px-6 py-6">
        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="add-circle" size={24} color="#8b5cf6" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Create Exam
              </Text>
              <Text className="text-gray-500 text-xs">Add new assessment</Text>
            </Pressable>

            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="people" size={24} color="#3b82f6" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                View Students
              </Text>
              <Text className="text-gray-500 text-xs">Manage classes</Text>
            </Pressable>

            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="bar-chart" size={24} color="#22c55e" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Analytics
              </Text>
              <Text className="text-gray-500 text-xs">
                Performance insights
              </Text>
            </Pressable>

            <Pressable className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <View className="bg-amber-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="folder-open" size={24} color="#f59e0b" />
              </View>
              <Text className="text-gray-900 font-semibold mb-1">
                Resources
              </Text>
              <Text className="text-gray-500 text-xs">Study materials</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Exams */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Recent Exams
            </Text>
            <Pressable>
              <Text className="text-purple-600 font-semibold">View All</Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-semibold mb-1">
                  Mathematics Final Exam
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    85 students • Class 10
                  </Text>
                </View>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-600 text-xs font-semibold">
                  Active
                </Text>
              </View>
            </View>
            <View className="border-t border-gray-100 pt-3 flex-row justify-between">
              <View>
                <Text className="text-gray-500 text-xs">Submissions</Text>
                <Text className="text-gray-900 font-semibold">68/85</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Graded</Text>
                <Text className="text-gray-900 font-semibold">52/68</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Avg Score</Text>
                <Text className="text-gray-900 font-semibold">78%</Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-semibold mb-1">
                  Science Mid-Term Test
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    92 students • Class 9
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-600 text-xs font-semibold">
                  Pending
                </Text>
              </View>
            </View>
            <View className="border-t border-gray-100 pt-3 flex-row justify-between">
              <View>
                <Text className="text-gray-500 text-xs">Submissions</Text>
                <Text className="text-gray-900 font-semibold">45/92</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Graded</Text>
                <Text className="text-gray-900 font-semibold">12/45</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Due Date</Text>
                <Text className="text-gray-900 font-semibold">Dec 20</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pending Tasks */}
        <View>
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Pending Tasks
          </Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
            <View className="flex-row items-center">
              <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  Grade pending submissions
                </Text>
                <Text className="text-gray-500 text-sm">
                  16 submissions waiting
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  Upload study materials
                </Text>
                <Text className="text-gray-500 text-sm">
                  For next week&apos;s class
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
