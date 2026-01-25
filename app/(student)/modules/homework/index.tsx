import { getHomework, Homework, markAsViewed } from "@/lib/enhancedApi";
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

export default function HomeworkScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homework, setHomework] = useState<Homework[]>([]);

  const loadHomework = async () => {
    try {
      const data = await getHomework();
      setHomework(data.homework || []);
    } catch (error) {
      console.error("Error loading homework:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomework();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomework();
  }, []);

  const handleHomeworkPress = async (item: Homework) => {
    // Mark as viewed
    try {
      await markAsViewed("homework", item._id);
    } catch (e) {
      // Ignore error
    }
    router.push(`/(student)/modules/homework/${item._id}` as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
      case "completed":
        return "#10b981"; // Green for both
      case "viewed":
        return "#f59e0b";
      case "in_progress":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
      case "completed":
        return "Submitted"; // Label both as Submitted
      case "viewed":
        return "Viewed";
      case "in_progress":
        return "In Progress";
      default:
        return "New";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading homework...</Text>
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
          <Text className="text-gray-900 font-bold text-lg">Homework</Text>
        </View>
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
        <View className="px-4 py-4">
          {homework.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="book-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-3 text-center">
                No homework assigned yet
              </Text>
            </View>
          ) : (
            homework.map((item) => {
              const status = item.myProgress?.status || "not_started";
              const overdue =
                isOverdue(item.dueDate) &&
                status !== "submitted" &&
                status !== "completed";

              return (
                <Pressable
                  key={item._id}
                  onPress={() => handleHomeworkPress(item)}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:scale-[0.98]"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-gray-900 font-bold text-base"
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {item.subject} • {item.classLevel}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: getStatusColor(status) + "20" }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getStatusColor(status) }}
                      >
                        {getStatusLabel(status)}
                      </Text>
                    </View>
                  </View>

                  {item.description && (
                    <Text
                      className="text-gray-600 text-sm mb-3"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6b7280"
                      />
                      <Text
                        className={`text-sm ml-1 ${overdue ? "text-red-500 font-medium" : "text-gray-500"}`}
                      >
                        {item.dueDate
                          ? `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                          : "No due date"}
                      </Text>
                      {overdue && (
                        <View className="bg-red-100 px-2 py-0.5 rounded ml-2">
                          <Text className="text-red-600 text-xs font-medium">
                            Overdue
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9ca3af"
                    />
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
