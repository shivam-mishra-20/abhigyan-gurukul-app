import { apiFetch } from "@/lib/api";
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

const COLORS = {
  primary: "#5ab348",
  purple: "#8b5cf6",
};

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  targetBatch?: string;
  createdAt: string;
}

interface BatchOption {
  name: string;
}

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal" as Announcement["priority"],
    targetBatch: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [announcementsRes, batchesRes] = await Promise.all([
        apiFetch("/api/announcements"),
        apiFetch("/api/teacher/batches"),
      ]);
      
      const annData = announcementsRes as { announcements?: Announcement[] } | Announcement[];
      setAnnouncements(Array.isArray(annData) ? annData : annData?.announcements || []);
      
      const batchData = batchesRes as { batches: BatchOption[] };
      setBatches(batchData?.batches || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert("Error", "Please fill in title and content");
      return;
    }
    
    setSaving(true);
    try {
      await apiFetch("/api/announcements", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          target: formData.targetBatch ? "batch" : "students",
          targetBatch: formData.targetBatch || undefined,
          isPublished: true,
        }),
      });
      setFormData({ title: "", content: "", priority: "normal", targetBatch: "" });
      setShowForm(false);
      fetchData();
      Alert.alert("Success", "Announcement sent successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to send announcement");
    } finally {
      setSaving(false);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { bg: "bg-red-100", text: "text-red-700" };
      case "high":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      case "normal":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-14 pb-6 px-6" style={{ backgroundColor: COLORS.purple }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">Announcements</Text>
            <Text className="text-white/80 text-sm">
              Send updates to students
            </Text>
          </View>
          <Pressable
            onPress={() => setShowForm(true)}
            className="bg-white p-3 rounded-full"
          >
            <Ionicons name="add" size={24} color={COLORS.purple} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            colors={[COLORS.purple]}
          />
        }
      >
        {announcements.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="megaphone-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No announcements yet</Text>
            <Pressable
              onPress={() => setShowForm(true)}
              className="mt-4 px-6 py-3 rounded-full"
              style={{ backgroundColor: COLORS.purple }}
            >
              <Text className="text-white font-semibold">Create First</Text>
            </Pressable>
          </View>
        ) : (
          announcements.map((announcement) => {
            const priorityStyle = getPriorityStyle(announcement.priority);
            return (
              <View
                key={announcement._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-3">
                      <Ionicons name="megaphone" size={20} color={COLORS.purple} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                        {announcement.title}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatDate(announcement.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${priorityStyle.bg}`}>
                    <Text className={`text-xs ${priorityStyle.text}`}>
                      {announcement.priority}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-700" numberOfLines={3}>
                  {announcement.content}
                </Text>

                {announcement.targetBatch && (
                  <View className="mt-3">
                    <View className="bg-gray-100 px-2 py-1 rounded self-start">
                      <Text className="text-gray-600 text-xs">
                        {announcement.targetBatch}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
        <View className="h-6" />
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                New Announcement
              </Text>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </Pressable>
            </View>

            <TextInput
              placeholder="Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-gray-800"
            />

            <TextInput
              placeholder="Message *"
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              multiline
              numberOfLines={4}
              className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-gray-800 h-24"
              textAlignVertical="top"
            />

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-600 text-sm mb-2">Priority</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["low", "normal", "high", "urgent"] as const).map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setFormData({ ...formData, priority: p })}
                      className={`px-3 py-2 rounded-lg ${
                        formData.priority === p
                          ? "bg-purple-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`capitalize ${
                          formData.priority === p
                            ? "text-purple-700"
                            : "text-gray-600"
                        }`}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 text-sm mb-2">Target Batch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Pressable
                  onPress={() => setFormData({ ...formData, targetBatch: "" })}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    formData.targetBatch === "" ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={
                      formData.targetBatch === ""
                        ? "text-purple-700"
                        : "text-gray-600"
                    }
                  >
                    All Students
                  </Text>
                </Pressable>
                {batches.map((batch) => (
                  <Pressable
                    key={batch.name}
                    onPress={() =>
                      setFormData({ ...formData, targetBatch: batch.name })
                    }
                    className={`px-4 py-2 rounded-lg mr-2 ${
                      formData.targetBatch === batch.name
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={
                        formData.targetBatch === batch.name
                          ? "text-purple-700"
                          : "text-gray-600"
                      }
                    >
                      {batch.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: saving ? "#9ca3af" : COLORS.purple }}
            >
              <Text className="text-white font-bold text-lg">
                {saving ? "Sending..." : "Send Announcement"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
