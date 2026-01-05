import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Notification {
  _id: string;
  type: "exam" | "doubt" | "announcement" | "material" | "schedule" | "general";
  priority: "low" | "medium" | "high";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === "unread") {
        params.append("read", "false");
      }
      params.append("limit", "50");

      const data = (await apiFetch(
        `/api/notifications?${params.toString()}`
      )) as NotificationResponse;
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", {
        method: "PUT",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  const clearAllRead = async () => {
    Alert.alert(
      "Clear Read Notifications",
      "Are you sure you want to delete all read notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch("/api/notifications/read/clear", {
                method: "DELETE",
              });
              setNotifications((prev) => prev.filter((n) => !n.read));
            } catch (error) {
              console.error("Error clearing read notifications:", error);
              Alert.alert("Error", "Failed to clear notifications");
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      // Navigate to the action URL if provided
      router.push(notification.actionUrl as any);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "exam":
        return "document-text";
      case "doubt":
        return "help-circle";
      case "announcement":
        return "megaphone";
      case "material":
        return "book";
      case "schedule":
        return "calendar";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") return isDark ? "#F87171" : "#DC2626";
    switch (type) {
      case "exam":
        return isDark ? "#60A5FA" : "#3B82F6";
      case "doubt":
        return isDark ? "#FBBF24" : "#F59E0B";
      case "announcement":
        return isDark ? "#A78BFA" : "#8B5CF6";
      case "material":
        return isDark ? "#34D399" : "#10B981";
      case "schedule":
        return isDark ? "#F472B6" : "#EC4899";
      default:
        return isDark ? "#9CA3AF" : "#6B7280";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderNotification = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={() => handleNotificationPress(item)}
        className={`mx-4 mb-3 rounded-2xl overflow-hidden ${
          item.read
            ? "bg-white dark:bg-dark-card opacity-70"
            : "bg-white dark:bg-dark-card"
        }`}
      >
        <View className="flex-row p-4">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{
              backgroundColor: isDark
                ? getNotificationColor(item.type, item.priority) + "30"
                : getNotificationColor(item.type, item.priority) + "20",
            }}
          >
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={24}
              color={getNotificationColor(item.type, item.priority)}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text
                className={`flex-1 text-base font-semibold ${
                  item.read
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {!item.read && (
                <View className="w-2.5 h-2.5 rounded-full bg-primary-500 ml-2 mt-1" />
              )}
            </View>

            <Text
              className={`text-sm mb-2 ${
                item.read
                  ? "text-gray-500 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              numberOfLines={2}
            >
              {item.message}
            </Text>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {formatTime(item.createdAt)}
              </Text>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  Alert.alert(
                    "Delete Notification",
                    "Are you sure you want to delete this notification?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteNotification(item._id),
                      },
                    ]
                  );
                }}
                className="p-2"
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={isDark ? "#EF4444" : "#DC2626"}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-dark-background"
        edges={["top"]}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8BC53F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-dark-background"
      edges={["top"]}
    >
      {/* Header */}
      <View className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#F9FAFB" : "#000"}
              />
            </Pressable>
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </Text>
          </View>

          {unreadCount > 0 && (
            <View className="bg-primary-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-semibold">
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Filter and Actions */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <Pressable
              onPress={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${
                filter === "all" ? "bg-white dark:bg-gray-600" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === "all"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg ${
                filter === "unread" ? "bg-white dark:bg-gray-600" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === "unread"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Unread
              </Text>
            </Pressable>
          </View>

          <View className="flex-row">
            {unreadCount > 0 && (
              <Pressable
                onPress={markAllAsRead}
                className="mr-2 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
              >
                <Text className="text-sm font-medium text-primary-700 dark:text-primary-400">
                  Mark All Read
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={clearAllRead}
              className="px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg"
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={isDark ? "#FCA5A5" : "#DC2626"}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8BC53F"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-4">
              <Ionicons
                name="notifications-off"
                size={40}
                color={isDark ? "#9CA3AF" : "#9CA3AF"}
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-base font-medium">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {filter === "unread"
                ? "You're all caught up!"
                : "We'll notify you when something happens"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
