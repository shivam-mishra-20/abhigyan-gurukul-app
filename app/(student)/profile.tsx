import { getUser, logout } from "@/lib/auth";
import { AttendanceSummary, getAttendanceSummary } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

const THEME = {
  primary: "#059669",
};

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  const loadData = async () => {
    try {
      const [userData, attendanceData] = await Promise.all([
        getUser(),
        getAttendanceSummary().catch(() => null),
      ]);
      setUser(userData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Error loading profile:", error);
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

  const handleLogout = async () => {
    await logout();
    router.replace("/splash");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const targetExams = user?.targetExams || [];

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
      <View className="pt-14 pb-10 px-6 rounded-b-3xl" style={{ backgroundColor: THEME.primary }}>
        <Text className="text-white text-2xl font-bold mb-6">My Profile</Text>
        
        {/* Profile Info */}
        <View className="items-center">
          <View className="bg-white/20 w-24 h-24 rounded-full items-center justify-center mb-3">
            <Ionicons name="person" size={48} color="white" />
          </View>
          <Text className="text-white text-xl font-bold">
            {user?.name || "Student"}
          </Text>
          <Text className="text-white/80 text-sm">{user?.email}</Text>
          
          {/* Badges */}
          <View className="flex-row mt-4 gap-2">
            {user?.classLevel && (
              <View className="bg-white/20 px-3 py-1.5 rounded-full">
                <Text className="text-white text-sm font-medium">{user.classLevel}</Text>
              </View>
            )}
            {user?.batch && (
              <View className="bg-white/20 px-3 py-1.5 rounded-full">
                <Text className="text-white text-sm font-medium">{user.batch}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="px-5 py-4" style={{ marginTop: -20 }}>
        {/* Target Exams */}
        {targetExams.length > 0 && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="school" size={20} color={THEME.primary} />
              <Text className="text-gray-900 font-bold ml-2">Target Exams</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {targetExams.map((exam: string, idx: number) => (
                <View key={idx} className="bg-emerald-100 px-4 py-2 rounded-full">
                  <Text className="text-emerald-700 font-semibold">{exam}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attendance Summary */}
        {attendance && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color={THEME.primary} />
                <Text className="text-gray-900 font-bold ml-2">Attendance</Text>
              </View>
              <Pressable onPress={() => router.push("/(student)/attendance")}>
                <Text style={{ color: THEME.primary }} className="font-semibold">View</Text>
              </Pressable>
            </View>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-gray-900 text-2xl font-bold">{attendance.percentage}%</Text>
                <Text className="text-gray-500 text-sm">Attendance</Text>
              </View>
              <View className="items-center">
                <Text className="text-emerald-600 text-2xl font-bold">{attendance.presentDays}</Text>
                <Text className="text-gray-500 text-sm">Present</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-600 text-2xl font-bold">{attendance.totalDays}</Text>
                <Text className="text-gray-500 text-sm">Total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Access */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
          <Text className="px-5 pt-4 pb-2 text-gray-900 font-bold">Quick Access</Text>
          <Pressable 
            onPress={() => router.push("/(student)/results")}
            className="flex-row items-center px-5 py-4 border-b border-gray-100"
          >
            <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="trophy" size={20} color="#7c3aed" />
            </View>
            <Text className="text-gray-900 ml-3 flex-1">My Results</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
          <Pressable 
            onPress={() => router.push("/(student)/progress")}
            className="flex-row items-center px-5 py-4 border-b border-gray-100"
          >
            <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="stats-chart" size={20} color="#f59e0b" />
            </View>
            <Text className="text-gray-900 ml-3 flex-1">Performance Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
          <Pressable 
            onPress={() => router.push("/(student)/leaderboard")}
            className="flex-row items-center px-5 py-4"
          >
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="podium" size={20} color="#2563eb" />
            </View>
            <Text className="text-gray-900 ml-3 flex-1">Leaderboard</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Settings */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
          <Text className="px-5 pt-4 pb-2 text-gray-900 font-bold">Settings</Text>
          <Pressable className="flex-row items-center px-5 py-4 border-b border-gray-100">
            <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="notifications" size={20} color="#6b7280" />
            </View>
            <Text className="text-gray-900 ml-3 flex-1">Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center px-5 py-4 border-b border-gray-100">
            <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="lock-closed" size={20} color="#6b7280" />
            </View>
            <Text className="text-gray-900 ml-3 flex-1">Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center px-5 py-4">
            <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="help-circle" size={20} color="#6b7280" />
            </View>
            <Text className="text-gray-900 ml-3 flex-1">Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="bg-red-500 rounded-2xl py-4 items-center mb-8"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Logout</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

