import { useToast } from "@/lib/context";
import {
  deleteHomework,
  getHomework,
  Homework,
  updateHomework,
} from "@/lib/enhancedApi";
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
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
};

export default function TeacherHomeworkScreen() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [filter, setFilter] = useState<
    "all" | "draft" | "published" | "closed"
  >("all");

  const loadHomework = useCallback(async () => {
    try {
      const data = await getHomework(
        filter !== "all" ? { status: filter } : undefined,
      );
      setHomework(data.homework || []);
    } catch (error) {
      console.error("Error loading homework:", error);
      toast.error("Failed to load homework");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomework();
  }, [loadHomework]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Homework",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHomework(id);
              toast.success("Homework deleted");
              loadHomework();
            } catch {
              toast.error("Failed to delete");
            }
          },
        },
      ],
    );
  };

  const handlePublish = async (item: Homework) => {
    try {
      await updateHomework(item._id, { status: "published" });
      toast.success("Homework published!");
      loadHomework();
    } catch {
      toast.error("Failed to publish");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "#10b981";
      case "draft":
        return "#f59e0b";
      case "closed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-gray-900 font-bold text-lg">Homework</Text>
          </View>
          <Pressable
            onPress={() =>
              router.push("/(teacher)/more/homework/create" as any)
            }
            className="bg-emerald-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-medium ml-1">Create</Text>
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {(["all", "draft", "published", "closed"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: filter === f ? "#059669" : "#f3f4f6",
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  textTransform: "capitalize",
                  color: filter === f ? "white" : "#4b5563",
                }}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
          />
        }
      >
        <View className="px-4 py-4">
          {homework.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="clipboard-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">No homework found</Text>
              <Pressable
                onPress={() =>
                  router.push("/(teacher)/more/homework/create" as any)
                }
                className="mt-4 bg-emerald-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">Create Homework</Text>
              </Pressable>
            </View>
          ) : (
            homework.map((item) => (
              <View
                key={item._id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
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
                    {item.assignmentType && (
                      <Text className="text-gray-400 text-xs mt-1">
                        Assigned:{" "}
                        {item.assignmentType === "all"
                          ? "All Students"
                          : item.assignmentType === "class"
                            ? `Classes ${item.assignedClasses?.join(", ") || item.classLevel}`
                            : item.assignmentType === "batch"
                              ? `Batches: ${item.assignedBatches?.join(", ")}`
                              : "Specific Students"}
                      </Text>
                    )}
                  </View>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(item.status) + "20",
                    }}
                  >
                    <Text
                      style={{ color: getStatusColor(item.status) }}
                      className="text-xs font-medium capitalize"
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                {item.stats && (
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    <View className="bg-gray-100 px-2 py-1 rounded">
                      <Text className="text-gray-600 text-xs">
                        {item.stats.submitted}/{item.stats.totalAssigned}{" "}
                        submitted
                      </Text>
                    </View>
                    {item.stats.completed > 0 && (
                      <View className="bg-blue-100 px-2 py-1 rounded">
                        <Text className="text-blue-600 text-xs">
                          {item.stats.completed} completed
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Due Date */}
                {item.dueDate && (
                  <View className="flex-row items-center mb-3">
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6b7280"
                    />
                    <Text className="text-gray-500 text-sm ml-1">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row justify-end gap-2">
                  {item.status === "draft" && (
                    <Pressable
                      onPress={() => handlePublish(item)}
                      className="bg-emerald-100 px-3 py-2 rounded-lg flex-row items-center"
                    >
                      <Ionicons name="paper-plane" size={14} color="#059669" />
                      <Text className="text-emerald-700 text-sm font-medium ml-1">
                        Publish
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/(teacher)/more/homework/edit?id=${item._id}` as any,
                      )
                    }
                    className="bg-amber-100 px-3 py-2 rounded-lg flex-row items-center"
                  >
                    <Ionicons name="create" size={14} color="#d97706" />
                    <Text className="text-amber-700 text-sm font-medium ml-1">
                      Edit
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      router.push(`/(teacher)/more/homework/${item._id}` as any)
                    }
                    className="bg-blue-100 px-3 py-2 rounded-lg flex-row items-center"
                  >
                    <Ionicons name="eye" size={14} color="#3b82f6" />
                    <Text className="text-blue-700 text-sm font-medium ml-1">
                      View
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(item._id, item.title)}
                    className="bg-red-100 px-3 py-2 rounded-lg"
                  >
                    <Ionicons name="trash" size={14} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
