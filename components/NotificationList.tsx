import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export function NotificationList() {
  const themeContext = useAppTheme();
  const colors = themeContext?.colors || {
    primary: "#059669",
    background: "#ffffff",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  };
  const isDark = themeContext?.isDark || false;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = (await apiFetch("/api/notifications")) as {
        notifications: NotificationItem[];
      };
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handlePress = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    // Handle navigation based on type/data if needed
    if (notification.type === "exam" && notification.data?.examId) {
      // Example: router.push(`/(student)/exams/${notification.data.examId}`);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={notifications}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              className="mt-4 text-base"
              style={{ color: colors.textSecondary }}
            >
              No notifications yet
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            className={`flex-row p-4 border-b ${
              !item.read ? "bg-opacity-5" : ""
            }`}
            style={{
              backgroundColor: !item.read
                ? colors.primary + "10"
                : "transparent",
              borderColor: colors.border,
            }}
          >
            <View
              className="w-10 h-10 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Ionicons
                name={
                  item.type === "exam"
                    ? "clipboard-outline"
                    : "notifications-outline"
                }
                size={20}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold text-base mb-1"
                style={{ color: colors.text }}
              >
                {item.title}
              </Text>
              <Text
                className="text-sm mb-2"
                style={{ color: colors.textSecondary }}
              >
                {item.message}
              </Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>
                {new Date(item.createdAt).toLocaleDateString()} •{" "}
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            {!item.read && (
              <View
                className="w-2 h-2 rounded-full mt-2"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
}
