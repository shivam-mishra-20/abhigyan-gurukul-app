import { useToast } from "@/lib/context";
import {
    getHomeworkDetail,
    getHomeworkSubmissions,
    gradeHomework,
    Homework,
    StudentProgress,
} from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = { primary: "#059669" };

export default function HomeworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<StudentProgress[]>([]);

  // Grading modal
  const [gradeModal, setGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<StudentProgress | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [grading, setGrading] = useState(false);

  const loadData = async () => {
    try {
      const [hwData, subsData] = await Promise.all([
        getHomeworkDetail(id),
        getHomeworkSubmissions(id),
      ]);
      setHomework(hwData);
      setSubmissions(subsData);
    } catch (error) {
      console.error("Error loading:", error);
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

  const openGradeModal = (sub: StudentProgress) => {
    setSelectedSubmission(sub);
    setGradeValue(sub.grade?.toString() || "");
    setFeedbackValue(sub.feedback || "");
    setGradeModal(true);
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    const studentId =
      typeof selectedSubmission.student === "string"
        ? selectedSubmission.student
        : selectedSubmission.student._id;

    setGrading(true);
    try {
      await gradeHomework(id, studentId, {
        grade: parseInt(gradeValue),
        feedback: feedbackValue,
      });
      toast.success("Graded successfully!");
      setGradeModal(false);
      loadData();
    } catch {
      toast.error("Failed to grade");
    } finally {
      setGrading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
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
        <Text className="text-gray-500">Homework not found</Text>
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
        {/* Homework Info */}
        <View className="bg-white m-4 rounded-2xl p-4 border border-gray-100">
          <Text className="text-gray-500 text-sm mb-1">
            {homework.subject} • Class {homework.classLevel}
          </Text>
          {homework.description && (
            <Text className="text-gray-700 mb-3">{homework.description}</Text>
          )}
          {homework.dueDate && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 ml-1">
                Due: {new Date(homework.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        {homework.stats && (
          <View className="mx-4 mb-4">
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-gray-100 px-3 py-2 rounded-xl">
                <Text className="text-gray-500 text-xs">Total</Text>
                <Text className="text-gray-800 font-bold">
                  {homework.stats.totalAssigned}
                </Text>
              </View>
              <View className="bg-green-100 px-3 py-2 rounded-xl">
                <Text className="text-green-600 text-xs">Submitted</Text>
                <Text className="text-green-800 font-bold">
                  {homework.stats.submitted}
                </Text>
              </View>
              <View className="bg-amber-100 px-3 py-2 rounded-xl">
                <Text className="text-amber-600 text-xs">Viewed</Text>
                <Text className="text-amber-800 font-bold">
                  {homework.stats.viewed}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Submissions */}
        <View className="mx-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">
            Submissions
          </Text>
          {submissions.length === 0 ? (
            <View className="bg-white rounded-xl p-4 items-center border border-gray-100">
              <Text className="text-gray-400">No submissions yet</Text>
            </View>
          ) : (
            submissions.map((sub) => {
              const student =
                typeof sub.student === "string"
                  ? { name: "Student", classLevel: undefined, batch: undefined }
                  : sub.student;
              return (
                <View
                  key={sub._id}
                  className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-gray-800 font-medium">
                        {student.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {"classLevel" in student &&
                          student.classLevel &&
                          `Class ${student.classLevel}`}
                        {"batch" in student &&
                          student.batch &&
                          ` • ${student.batch}`}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: getStatusColor(sub.status) + "20",
                      }}
                    >
                      <Text
                        style={{ color: getStatusColor(sub.status) }}
                        className="text-xs font-medium capitalize"
                      >
                        {sub.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>

                  {sub.submittedAt && (
                    <Text className="text-gray-400 text-xs mb-2">
                      Submitted:{" "}
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </Text>
                  )}

                  {sub.submissionNotes && (
                    <View className="bg-gray-50 p-2 rounded-lg mb-2">
                      <Text className="text-gray-600 text-sm">
                        {sub.submissionNotes}
                      </Text>
                    </View>
                  )}

                  {sub.grade !== undefined ? (
                    <View className="bg-green-50 p-2 rounded-lg flex-row justify-between items-center">
                      <Text className="text-green-700 font-medium">
                        Grade: {sub.grade}
                        {homework.maxPoints ? `/${homework.maxPoints}` : ""}
                      </Text>
                      <Pressable onPress={() => openGradeModal(sub)}>
                        <Text className="text-blue-600 text-sm">Edit</Text>
                      </Pressable>
                    </View>
                  ) : sub.status === "submitted" ? (
                    <Pressable
                      onPress={() => openGradeModal(sub)}
                      className="bg-emerald-600 py-2 rounded-lg items-center"
                    >
                      <Text className="text-white font-medium">Grade</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Grade Modal */}
      <Modal visible={gradeModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-900 font-bold text-lg mb-4">
              Grade Submission
            </Text>
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Grade</Text>
              <TextInput
                value={gradeValue}
                onChangeText={setGradeValue}
                placeholder={
                  homework.maxPoints
                    ? `Out of ${homework.maxPoints}`
                    : "Enter grade"
                }
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl p-3"
              />
            </View>
            <View className="mb-6">
              <Text className="text-gray-600 mb-2">Feedback (optional)</Text>
              <TextInput
                value={feedbackValue}
                onChangeText={setFeedbackValue}
                placeholder="Add feedback for student"
                multiline
                numberOfLines={3}
                className="border border-gray-200 rounded-xl p-3"
                textAlignVertical="top"
              />
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setGradeModal(false)}
                className="flex-1 py-3 rounded-xl items-center bg-gray-200"
              >
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleGrade}
                disabled={grading || !gradeValue}
                className={`flex-1 py-3 rounded-xl items-center ${
                  grading || !gradeValue ? "bg-gray-400" : "bg-emerald-600"
                }`}
              >
                {grading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium">Save Grade</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
