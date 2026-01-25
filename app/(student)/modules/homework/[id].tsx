import { useToast } from "@/lib/context";
import {
    addComment,
    getComments,
    getHomeworkDetail,
    Homework,
    MaterialComment,
    submitHomework,
} from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
};

export default function HomeworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homework, setHomework] = useState<Homework | null>(null);
  const [comments, setComments] = useState<MaterialComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [hwData, commentsData] = await Promise.all([
        getHomeworkDetail(id),
        getComments("homework", id),
      ]);
      setHomework(hwData);
      setComments(commentsData);
    } catch (error) {
      console.error("Error loading homework:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [id]);

  const handleSubmit = async () => {
    if (!submissionNotes.trim()) {
      Alert.alert("Error", "Please add submission notes");
      return;
    }

    setSubmitting(true);
    try {
      await submitHomework(id, { submissionNotes: submissionNotes.trim() });
      loadData();
      setSubmissionNotes("");
      Alert.alert("Success", "Homework submitted successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to submit homework");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        targetType: "homework",
        targetId: id,
        content: newComment.trim(),
      });
      setNewComment("");
      const commentsData = await getComments("homework", id);
      setComments(commentsData);
    } catch (error) {
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const handleOpenAttachment = (url: string) => {
    Linking.openURL(url);
  };

  const handleDownloadAttachment = async (
    url: string,
    fileName: string,
    mimeType: string,
    idx: number,
  ) => {
    setDownloadingIdx(idx);
    try {
      const fileUri = FileSystem.documentDirectory + fileName;
      toast.info("Downloading...");

      const result = await FileSystem.downloadAsync(url, fileUri);

      if (result.status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(result.uri, {
            mimeType: mimeType || "application/octet-stream",
            dialogTitle: `Save: ${fileName}`,
          });
          toast.success("File ready to save!");
        } else {
          Alert.alert("Downloaded", `File saved to: ${fileUri}`);
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download");
    } finally {
      setDownloadingIdx(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
      case "completed":
        return "#10b981";
      case "viewed":
        return "#f59e0b";
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

  if (!homework) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-gray-500 mt-3">Homework not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-emerald-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const status = homework.myProgress?.status || "not_started";
  const isSubmitted = status === "submitted";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text
              className="text-gray-900 font-bold text-lg flex-1"
              numberOfLines={1}
            >
              {homework.title}
            </Text>
          </View>
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
          {/* Homework Details */}
          <View className="bg-white m-4 rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">
                  {homework.subject} • {homework.classLevel}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  By {homework.createdBy?.name || "Teacher"}
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: getStatusColor(status) + "20" }}
              >
                <Text
                  style={{ color: getStatusColor(status) }}
                  className="text-sm font-medium capitalize"
                >
                  {status === "completed"
                    ? "Submitted"
                    : status.replace("_", " ")}
                </Text>
              </View>
            </View>

            {homework.description && (
              <Text className="text-gray-700 mb-4">{homework.description}</Text>
            )}

            {homework.instructions && (
              <View className="bg-blue-50 p-3 rounded-xl mb-4">
                <Text className="text-blue-800 font-medium mb-1">
                  Instructions
                </Text>
                <Text className="text-blue-700 text-sm">
                  {homework.instructions}
                </Text>
              </View>
            )}

            {/* Due Date */}
            {homework.dueDate && (
              <View className="flex-row items-center mb-4">
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text className="text-gray-600 ml-2">
                  Due: {new Date(homework.dueDate).toLocaleDateString()} at{" "}
                  {new Date(homework.dueDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}

            {/* Attachments */}
            {homework.attachments && homework.attachments.length > 0 && (
              <View className="mb-4">
                <Text className="text-gray-800 font-semibold mb-2">
                  Attachments
                </Text>
                {homework.attachments.map((att, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center bg-gray-50 p-3 rounded-xl mb-2"
                  >
                    <Ionicons
                      name={
                        att.mimeType?.includes("pdf")
                          ? "document-text"
                          : "image"
                      }
                      size={24}
                      color="#8b5cf6"
                    />
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-gray-700 font-medium"
                        numberOfLines={1}
                      >
                        {att.fileName}
                      </Text>
                      {att.fileSize && (
                        <Text className="text-gray-400 text-xs">
                          {(att.fileSize / 1024 / 1024).toFixed(1)} MB
                        </Text>
                      )}
                    </View>
                    {/* View Button */}
                    <Pressable
                      onPress={() => handleOpenAttachment(att.fileUrl)}
                      className="px-3 py-2 rounded-lg bg-blue-100 mr-2"
                    >
                      <Ionicons name="eye-outline" size={18} color="#2563eb" />
                    </Pressable>
                    {/* Save Button */}
                    <Pressable
                      onPress={() =>
                        handleDownloadAttachment(
                          att.fileUrl,
                          att.fileName,
                          att.mimeType,
                          idx,
                        )
                      }
                      disabled={downloadingIdx === idx}
                      className={`px-3 py-2 rounded-lg ${downloadingIdx === idx ? "bg-gray-200" : "bg-emerald-100"}`}
                    >
                      {downloadingIdx === idx ? (
                        <ActivityIndicator size="small" color="#059669" />
                      ) : (
                        <Ionicons
                          name="download-outline"
                          size={18}
                          color="#059669"
                        />
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Submit Homework */}
            {!isSubmitted && (
              <View className="bg-gray-50 p-4 rounded-xl mt-4">
                <Text className="text-gray-800 font-semibold mb-2">
                  Submit Homework
                </Text>
                <TextInput
                  value={submissionNotes}
                  onChangeText={setSubmissionNotes}
                  placeholder="Add submission notes..."
                  multiline
                  numberOfLines={3}
                  className="bg-white border border-gray-200 rounded-xl p-3 mb-3 text-gray-800"
                  textAlignVertical="top"
                />
                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting}
                  className={`py-3 rounded-xl items-center ${submitting ? "bg-gray-400" : "bg-emerald-600"}`}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Submit</Text>
                  )}
                </Pressable>
              </View>
            )}

            {isSubmitted && homework.myProgress && (
              <View className="bg-green-50 p-4 rounded-xl mt-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <Text className="text-green-800 font-semibold ml-2">
                    Submitted
                  </Text>
                </View>
                <Text className="text-green-700 text-sm">
                  Submitted on{" "}
                  {new Date(
                    homework.myProgress.submittedAt!,
                  ).toLocaleDateString()}
                </Text>
                {homework.myProgress.grade !== undefined && (
                  <View className="mt-2 bg-green-100 p-3 rounded-lg">
                    <Text className="text-green-800 font-medium">
                      Grade: {homework.myProgress.grade}
                      {homework.maxPoints ? `/${homework.maxPoints}` : ""}
                    </Text>
                    {homework.myProgress.feedback && (
                      <Text className="text-green-700 text-sm mt-1">
                        {homework.myProgress.feedback}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Comments Section */}
          <View className="mx-4 mb-4">
            <Text className="text-gray-800 font-bold text-lg mb-3">
              Comments
            </Text>

            {/* Add Comment */}
            <View className="bg-white rounded-xl p-3 mb-3 flex-row items-center border border-gray-100">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                className="flex-1 text-gray-800"
              />
              <Pressable onPress={handleAddComment} className="ml-2 p-2">
                <Ionicons name="send" size={20} color={THEME.primary} />
              </Pressable>
            </View>

            {/* Comments List */}
            {comments.length === 0 ? (
              <View className="bg-white rounded-xl p-4 items-center border border-gray-100">
                <Text className="text-gray-400">No comments yet</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View
                  key={comment._id}
                  className="bg-white rounded-xl p-3 mb-2 border border-gray-100"
                >
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-800 font-medium">
                      {comment.author.name}
                    </Text>
                    <Text className="text-gray-400 text-xs ml-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-gray-600">{comment.content}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
