import { getSchedule, getTodaySchedule, ScheduleItem } from "@/lib/enhancedApi";
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
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
};

export default function ScheduleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<ScheduleItem[]>([]);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");

  const loadData = async () => {
    try {
      const [today, week] = await Promise.all([
        getTodaySchedule(),
        getSchedule(),
      ]);
      setTodaySchedule(today);
      setWeekSchedule(week);
    } catch (error) {
      console.error("Error loading schedule:", error);
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

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "class": return { icon: "school", color: THEME.primary, bg: "#dcfce7" };
      case "exam": return { icon: "document-text", color: "#dc2626", bg: "#fee2e2" };
      case "event": return { icon: "calendar", color: "#7c3aed", bg: "#ede9fe" };
      case "holiday": return { icon: "sunny", color: "#f59e0b", bg: "#fef3c7" };
      default: return { icon: "time", color: "#6b7280", bg: "#f3f4f6" };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const currentSchedule = activeTab === "today" ? todaySchedule : weekSchedule;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-gray-900 font-bold text-lg">Class Schedule</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-4 gap-3">
        <Pressable
          onPress={() => setActiveTab("today")}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeTab === "today" ? "bg-emerald-600" : "bg-white border border-gray-200"
          }`}
        >
          <Text className={`font-semibold ${activeTab === "today" ? "text-white" : "text-gray-600"}`}>
            Today
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("week")}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeTab === "week" ? "bg-emerald-600" : "bg-white border border-gray-200"
          }`}
        >
          <Text className={`font-semibold ${activeTab === "week" ? "text-white" : "text-gray-600"}`}>
            This Week
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        <View className="px-4 pb-6">
          {currentSchedule.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-800 font-semibold mt-3">No Schedule</Text>
              <Text className="text-gray-500 text-center text-sm mt-1">
                {activeTab === "today" ? "No classes scheduled for today" : "No classes this week"}
              </Text>
            </View>
          ) : (
            currentSchedule.map((item) => {
              const config = getTypeConfig(item.type);
              return (
                <View
                  key={item._id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: config.bg }}
                    >
                      <Ionicons name={config.icon as any} size={24} color={config.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-900 font-bold">{item.title}</Text>
                        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: config.bg }}>
                          <Text className="text-xs font-medium capitalize" style={{ color: config.color }}>
                            {item.type}
                          </Text>
                        </View>
                      </View>
                      
                      {item.subject && (
                        <Text className="text-gray-600 text-sm mt-1">{item.subject}</Text>
                      )}
                      
                      <View className="flex-row items-center mt-2 flex-wrap gap-3">
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={14} color="#6b7280" />
                          <Text className="text-gray-500 text-sm ml-1">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </Text>
                        </View>
                        
                        {activeTab === "week" && (
                          <View className="flex-row items-center">
                            <Ionicons name="calendar" size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {formatDate(item.startTime)}
                            </Text>
                          </View>
                        )}
                        
                        {item.instructor?.name && (
                          <View className="flex-row items-center">
                            <Ionicons name="person" size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-sm ml-1">{item.instructor.name}</Text>
                          </View>
                        )}
                        
                        {item.location && (
                          <View className="flex-row items-center">
                            <Ionicons name="location" size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-sm ml-1">{item.location}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
