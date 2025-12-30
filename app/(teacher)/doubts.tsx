import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface Doubt {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    batch?: string;
  };
  subject: string;
  chapter?: string;
  question: string;
  status: "pending" | "in-progress" | "resolved";
  reply?: string;
  createdAt: string;
}

export default function TeacherDoubts() {
  const { isDark } = useAppTheme();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchDoubts = useCallback(async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = (await apiFetch(`/api/doubts/teacher${params}`)) as {
        doubts: Doubt[];
      };
      setDoubts(res?.doubts || []);
    } catch (error) {
      console.error("Error fetching doubts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const handleReply = async () => {
    if (!selectedDoubt || !reply.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/api/doubts/${selectedDoubt._id}/reply`, {
        method: "PUT",
        body: JSON.stringify({ reply }),
      });
      setReply("");
      setSelectedDoubt(null);
      fetchDoubts();
      Alert.alert("Success", "Reply sent successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiFetch(`/api/doubts/${id}/resolve`, { method: "PUT" });
      fetchDoubts();
      setSelectedDoubt(null);
    } catch (error) {
      Alert.alert("Error", "Failed to resolve doubt");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: isDark ? "bg-amber-900" : "bg-amber-100",
          text: isDark ? "text-amber-300" : "text-amber-700",
        };
      case "in-progress":
        return {
          bg: isDark ? "bg-blue-900" : "bg-blue-100",
          text: isDark ? "text-blue-300" : "text-blue-700",
        };
      case "resolved":
        return {
          bg: isDark ? "bg-green-900" : "bg-green-100",
          text: isDark ? "text-green-300" : "text-green-700",
        };
      default:
        return {
          bg: isDark ? "bg-gray-700" : "bg-gray-100",
          text: isDark ? "text-gray-300" : "text-gray-700",
        };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="pt-14 pb-6 px-6 bg-amber-500 dark:bg-amber-600">
        <Text className="text-white text-2xl font-bold">Doubts</Text>
        <Text className="text-white/80 text-sm">
          Help students with their questions
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 py-4 gap-2">
        {(["all", "pending", "resolved"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full ${
              filter === f
                ? "bg-amber-500"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                filter === f ? "text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDoubts();
            }}
            colors={["#f59e0b"]}
          />
        }
      >
        {doubts.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons
              name="help-circle-outline"
              size={64}
              color={isDark ? "#4b5563" : "#d1d5db"}
            />
            <Text className="text-gray-500 dark:text-gray-400 text-lg mt-4">
              No doubts found
            </Text>
          </View>
        ) : (
          doubts.map((doubt) => {
            const statusStyle = getStatusColor(doubt.status);
            return (
              <Pressable
                key={doubt._id}
                onPress={() => {
                  setSelectedDoubt(doubt);
                  setReply(doubt.reply || "");
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center mr-3">
                      <Text className="text-amber-700 dark:text-amber-300 font-bold">
                        {doubt.student.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-900 dark:text-gray-100 font-semibold">
                        {doubt.student.name}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        {doubt.student.batch} • {formatDate(doubt.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                    <Text className={`text-xs ${statusStyle.text}`}>
                      {doubt.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2 mb-2">
                  <View className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    <Text className="text-gray-600 dark:text-gray-300 text-xs">
                      {doubt.subject}
                    </Text>
                  </View>
                  {doubt.chapter && (
                    <View className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      <Text className="text-gray-600 dark:text-gray-300 text-xs">
                        {doubt.chapter}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  className="text-gray-700 dark:text-gray-300"
                  numberOfLines={2}
                >
                  {doubt.question}
                </Text>
              </Pressable>
            );
          })
        )}
        <View className="h-6" />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedDoubt} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Doubt Details
              </Text>
              <Pressable onPress={() => setSelectedDoubt(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#9ca3af" : "#9ca3af"}
                />
              </Pressable>
            </View>

            {selectedDoubt && (
              <ScrollView>
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center mr-3">
                    <Text className="text-amber-700 dark:text-amber-300 font-bold text-lg">
                      {selectedDoubt.student.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {selectedDoubt.student.name}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400">
                      {selectedDoubt.student.email}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                    Question
                  </Text>
                  <Text className="text-gray-800 dark:text-gray-200">
                    {selectedDoubt.question}
                  </Text>
                </View>

                {selectedDoubt.reply && (
                  <View className="bg-green-50 dark:bg-green-900 rounded-xl p-4 mb-4 border border-green-200 dark:border-green-700">
                    <Text className="text-green-700 dark:text-green-300 text-sm mb-1">
                      Your Reply
                    </Text>
                    <Text className="text-gray-800 dark:text-gray-200">
                      {selectedDoubt.reply}
                    </Text>
                  </View>
                )}

                {selectedDoubt.status !== "resolved" && (
                  <>
                    <TextInput
                      placeholder="Type your reply..."
                      placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
                      value={reply}
                      onChangeText={setReply}
                      multiline
                      numberOfLines={4}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 h-24"
                      textAlignVertical="top"
                    />

                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => handleResolve(selectedDoubt._id)}
                        className="flex-1 py-3 rounded-xl bg-green-100 dark:bg-green-900 items-center"
                      >
                        <Text className="text-green-700 dark:text-green-300 font-semibold">
                          Resolve
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={handleReply}
                        disabled={!reply.trim() || sending}
                        className={`flex-1 py-3 rounded-xl items-center ${
                          reply.trim()
                            ? "bg-amber-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <Text className="text-white font-semibold">
                          {sending ? "Sending..." : "Send Reply"}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
