import { MathText } from "@/components/ui/MathText";
import { COLORS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
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

interface UserInfo {
  _id: string;
  name?: string;
  email?: string;
  classLevel?: string;
  batch?: string;
}

interface ExamInfo {
  _id: string;
  title: string;
}

interface PendingAttempt {
  _id: string;
  examId: string | ExamInfo;
  userId: string | UserInfo;
  submittedAt?: string;
  totalScore?: number;
  maxScore?: number;
  status: string;
  resultPublished?: boolean;
}

interface ReviewAnswer {
  questionId: string;
  textAnswer?: string;
  chosenOptionId?: string;
  scoreAwarded?: number;
}

interface ReviewQuestion {
  _id: string;
  text: string;
  options?: { _id: string; text: string; isCorrect?: boolean }[];
}

interface ReviewAttempt {
  _id: string;
  userId: string | UserInfo;
  totalScore?: number;
  maxScore?: number;
  status: string;
  answers: ReviewAnswer[];
}

interface ReviewView {
  attempt: ReviewAttempt;
  exam: { _id: string; title: string };
  sections: { _id: string; title: string; questionIds: string[] }[];
  questions: Record<string, ReviewQuestion>;
}

export default function TeacherReviews() {
  const [pending, setPending] = useState<PendingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReview, setActiveReview] = useState<ReviewView | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");

  const loadPending = useCallback(async () => {
    try {
      const data = await apiFetch("/api/attempts/review/pending");
      if (Array.isArray(data)) {
        setPending(data as PendingAttempt[]);
      } else {
        setPending([]);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setPending([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const openAttempt = async (id: string) => {
    try {
      const view = (await apiFetch(`/api/attempts/${id}/review`)) as ReviewView;
      setActiveReview(view);
    } catch (error) {
      console.error("Error opening review:", error);
      Alert.alert("Error", "Failed to load review details");
    }
  };

  const publishAttempt = async () => {
    if (!activeReview) return;

    Alert.alert(
      "Publish Result",
      "Are you sure you want to publish this result? The student will be able to see their score.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Publish",
          onPress: async () => {
            setPublishing(true);
            try {
              await apiFetch(
                `/api/attempts/${activeReview.attempt._id}/publish`,
                {
                  method: "POST",
                  body: JSON.stringify({ publish: true }),
                }
              );
              Alert.alert("Success", "Result published successfully");
              setActiveReview(null);
              loadPending();
            } catch (error) {
              console.error("Error publishing:", error);
              Alert.alert("Error", "Failed to publish result");
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  const getUser = (attempt: PendingAttempt) =>
    typeof attempt.userId === "object" ? attempt.userId : null;

  const getExam = (attempt: PendingAttempt) =>
    typeof attempt.examId === "object" ? attempt.examId : null;

  const getScorePercentage = (score: number, maxScore: number) =>
    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const filteredAttempts = pending.filter((a) => {
    if (filter === "pending") return !a.resultPublished;
    if (filter === "published") return a.resultPublished;
    return true;
  });

  const formatDate = (date?: string) => {
    if (!date) return "";
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Review Detail View
  if (activeReview) {
    const user =
      typeof activeReview.attempt.userId === "object"
        ? activeReview.attempt.userId
        : null;
    const score = activeReview.attempt.totalScore || 0;
    const maxScore = activeReview.attempt.maxScore || 0;
    const percentage = getScorePercentage(score, maxScore);

    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => setActiveReview(null)}
              className="w-10 h-10 items-center justify-center mr-3 rounded-xl bg-gray-100 active:bg-gray-200"
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.gray900} />
            </Pressable>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                Review Submission
              </Text>
              <Text className="text-sm text-gray-600">
                {activeReview.exam.title}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Student Info */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <Text
                  className="font-bold text-xl"
                  style={{ color: COLORS.primary }}
                >
                  {user?.name?.charAt(0) || "S"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">
                  {user?.name || "Student"}
                </Text>
                <Text className="text-sm text-gray-600">{user?.email}</Text>
                {user?.classLevel && (
                  <Text className="text-sm text-gray-500">
                    Class {user.classLevel} • {user.batch}
                  </Text>
                )}
              </View>
            </View>

            {/* Score */}
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600">Score</Text>
                <Text className="text-gray-900 font-bold text-lg">
                  {score} / {maxScore}
                </Text>
              </View>
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className={`h-full ${
                    percentage >= 80
                      ? "bg-green-500"
                      : percentage >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </View>
              <Text className="text-right mt-1 text-gray-500 text-sm">
                {percentage}%
              </Text>
            </View>
          </View>

          {/* Answers by Section */}
          {activeReview.sections.map((section, sIdx) => (
            <View key={section._id} className="mb-4">
              <Text className="text-gray-900 font-bold mb-3">
                {section.title || `Section ${sIdx + 1}`}
              </Text>

              {section.questionIds.map((qId, qIdx) => {
                const question = activeReview.questions[qId];
                const answer = activeReview.attempt.answers.find(
                  (a) => a.questionId === qId
                );

                if (!question) return null;

                return (
                  <View
                    key={qId}
                    className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-sm text-gray-600">Q{qIdx + 1}</Text>
                      {answer?.scoreAwarded !== undefined && (
                        <View className="bg-green-100 px-2 py-1 rounded-lg">
                          <Text className="text-green-700 text-xs font-semibold">
                            +{answer.scoreAwarded}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Question Text with MathText for equation rendering */}
                    <View className="mb-3">
                      <MathText text={question.text} fontSize={15} />
                    </View>

                    {/* Options */}
                    {question.options?.map((opt) => {
                      const isChosen = answer?.chosenOptionId === opt._id;
                      const isCorrect = opt.isCorrect;

                      const bgColor =
                        isChosen && isCorrect
                          ? "bg-green-50"
                          : isChosen && !isCorrect
                          ? "bg-red-50"
                          : isCorrect
                          ? "bg-green-50"
                          : "bg-gray-50";

                      return (
                        <View
                          key={opt._id}
                          className={`p-3 rounded-xl mb-2 flex-row items-center ${bgColor}`}
                        >
                          <View
                            className="w-6 h-6 rounded-full mr-3 items-center justify-center"
                            style={{
                              backgroundColor: isChosen
                                ? isCorrect
                                  ? COLORS.success
                                  : COLORS.error
                                : COLORS.gray200,
                            }}
                          >
                            {isChosen && (
                              <Ionicons
                                name={isCorrect ? "checkmark" : "close"}
                                size={12}
                                color="white"
                              />
                            )}
                          </View>
                          <View className="flex-1">
                            <MathText
                              text={opt.text}
                              fontSize={14}
                              style={{ fontWeight: isCorrect ? "600" : "400" }}
                            />
                          </View>
                          {isCorrect && !isChosen && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={COLORS.success}
                            />
                          )}
                        </View>
                      );
                    })}

                    {/* Text Answer */}
                    {answer?.textAnswer && (
                      <View className="bg-blue-50 p-3 rounded-xl mt-2">
                        <MathText text={answer.textAnswer} fontSize={14} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Publish Button */}
        <View className="px-4 py-4 bg-white border-t border-gray-100">
          <Pressable
            onPress={publishAttempt}
            disabled={publishing}
            className="rounded-2xl overflow-hidden active:opacity-80"
            style={{
              backgroundColor: publishing ? COLORS.gray300 : COLORS.primary,
            }}
          >
            <View className="py-4 items-center flex-row justify-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                {publishing ? "Publishing..." : "Publish Result"}
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 20,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray200,
          backgroundColor: COLORS.white,
        }}
      >
        <Text className="text-gray-900 font-semibold text-2xl">
          Review Dashboard
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          Grade and publish student submissions
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row px-4 py-4 gap-2">
        <View
          className="flex-1 rounded-2xl p-3.5"
          style={{ backgroundColor: COLORS.infoLight }}
        >
          <Text className="text-xs font-medium" style={{ color: COLORS.info }}>
            Total
          </Text>
          <Text className="text-2xl font-bold text-gray-900">
            {pending.length}
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-3.5"
          style={{ backgroundColor: COLORS.warningLight }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: COLORS.warning }}
          >
            Pending
          </Text>
          <Text className="text-2xl font-bold text-gray-900">
            {pending.filter((p) => !p.resultPublished).length}
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-3.5"
          style={{ backgroundColor: COLORS.successLight }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: COLORS.success }}
          >
            Published
          </Text>
          <Text className="text-2xl font-bold text-gray-900">
            {pending.filter((p) => p.resultPublished).length}
          </Text>
        </View>
      </View>

      {/* Filter */}
      <View className="px-4 pb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(["all", "pending", "published"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className="px-4 py-2.5 rounded-full mr-2"
              style={{
                backgroundColor: filter === f ? COLORS.primary : COLORS.gray100,
              }}
            >
              <Text
                className="capitalize font-semibold"
                style={{
                  color: filter === f ? COLORS.white : COLORS.gray600,
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPending();
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        {filteredAttempts.length === 0 ? (
          <View className="items-center py-16">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: COLORS.successLight }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={40}
                color={COLORS.success}
              />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              All caught up!
            </Text>
            <Text className="text-gray-500">No submissions to review</Text>
          </View>
        ) : (
          filteredAttempts.map((attempt) => {
            const user = getUser(attempt);
            const exam = getExam(attempt);
            const percentage = getScorePercentage(
              attempt.totalScore || 0,
              attempt.maxScore || 1
            );

            return (
              <Pressable
                key={attempt._id}
                onPress={() => openAttempt(attempt._id)}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 active:bg-gray-50"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: `${COLORS.primary}15` }}
                    >
                      <Text
                        className="font-bold text-lg"
                        style={{ color: COLORS.primary }}
                      >
                        {user?.name?.charAt(0) || "S"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {user?.name || "Student"}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        #{attempt._id.slice(-6)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: attempt.resultPublished
                        ? COLORS.successLight
                        : COLORS.warningLight,
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: attempt.resultPublished
                          ? COLORS.success
                          : COLORS.warning,
                      }}
                    >
                      {attempt.resultPublished ? "Published" : "Pending"}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                  <Text
                    className="text-sm font-semibold text-gray-700"
                    numberOfLines={1}
                  >
                    {exam?.title || "Exam"}
                  </Text>
                  {user?.classLevel && (
                    <Text className="text-xs text-gray-500 mt-1">
                      Class {user.classLevel} • {user.batch}
                    </Text>
                  )}
                </View>

                {/* Score Bar */}
                <View className="mb-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-sm text-gray-600">Score</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {attempt.totalScore || 0} / {attempt.maxScore || 0}
                    </Text>
                  </View>
                  <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor:
                          percentage >= 80
                            ? COLORS.success
                            : percentage >= 60
                            ? COLORS.warning
                            : COLORS.error,
                      }}
                    />
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500">
                    {formatDate(attempt.submittedAt)}
                  </Text>
                  <View className="flex-row items-center">
                    <Text
                      className="font-semibold mr-1"
                      style={{
                        color: attempt.resultPublished
                          ? COLORS.gray500
                          : COLORS.primary,
                      }}
                    >
                      {attempt.resultPublished ? "View" : "Review"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
