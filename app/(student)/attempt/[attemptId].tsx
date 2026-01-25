import MathText from "@/components/ui/MathText";
import {
    getAttempt,
    markForReview,
    saveAnswer,
    submitAttempt,
} from "@/lib/studentApi";
import type { Answer, AttemptDetailResponse, Question } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

type ResponseType = string | number | string[];

export default function AttemptPlayerScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptDetailResponse | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ResponseType>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set(),
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load attempt data
  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      const response = await getAttempt(attemptId!);
      setData(response);

      // Initialize answers from existing data
      const existingAnswers: Record<string, ResponseType> = {};
      const existingMarked = new Set<string>();

      response.attempt.answers?.forEach((ans: Answer) => {
        if (ans.chosenOptionId) {
          existingAnswers[ans.questionId] = ans.chosenOptionId;
        } else if (ans.selectedOptionIds?.length) {
          existingAnswers[ans.questionId] = ans.selectedOptionIds;
        } else if (ans.textAnswer) {
          existingAnswers[ans.questionId] = ans.textAnswer;
        }
        if (ans.markedForReview) {
          existingMarked.add(ans.questionId);
        }
      });

      setAnswers(existingAnswers);
      setMarkedForReview(existingMarked);

      // Calculate remaining time
      const durationMs = (response.exam.totalDurationMins || 60) * 60 * 1000;
      const startedAt = response.attempt.startedAt
        ? new Date(response.attempt.startedAt).getTime()
        : Date.now();
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeRemaining(remaining);
    } catch (error: any) {
      console.error("Error loading attempt:", error);
      Alert.alert("Error", "Failed to load exam. Please try again.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || loading) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, loading]);

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit Exam?",
        "Your progress is saved. You can resume later.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: () => router.back() },
        ],
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const handleAutoSubmit = async () => {
    Alert.alert("Time's Up!", "Your exam is being submitted automatically.", [
      { text: "OK", onPress: () => handleSubmit() },
    ]);
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (): string => {
    if (timeRemaining < 5 * 60 * 1000) return "#ef4444";
    if (timeRemaining < 15 * 60 * 1000) return "#f59e0b";
    return THEME.primary;
  };

  // Get current question
  const getCurrentQuestion = (): Question | null => {
    if (!data) return null;
    const sections = data.sections || [];
    if (sections.length === 0) return null;

    const section = sections[currentSectionIdx];
    if (!section) return null;

    const questionId = section.questionIds[currentQuestionIdx];
    return data.questions[questionId] || null;
  };

  const getCurrentQuestionId = (): string | null => {
    if (!data) return null;
    const sections = data.sections || [];
    const section = sections[currentSectionIdx];
    if (!section) return null;
    return section.questionIds[currentQuestionIdx] || null;
  };

  // Navigation
  const getTotalQuestions = (): number => {
    if (!data) return 0;
    return data.sections.reduce((sum, s) => sum + s.questionIds.length, 0);
  };

  const getGlobalQuestionIndex = (): number => {
    if (!data) return 0;
    let idx = 0;
    for (let i = 0; i < currentSectionIdx; i++) {
      idx += data.sections[i].questionIds.length;
    }
    return idx + currentQuestionIdx;
  };

  const goToQuestion = (globalIdx: number) => {
    if (!data) return;
    let remaining = globalIdx;
    for (let s = 0; s < data.sections.length; s++) {
      const sectionLen = data.sections[s].questionIds.length;
      if (remaining < sectionLen) {
        setCurrentSectionIdx(s);
        setCurrentQuestionIdx(remaining);
        setShowPalette(false);
        return;
      }
      remaining -= sectionLen;
    }
  };

  const goNext = () => {
    if (!data) return;
    const section = data.sections[currentSectionIdx];
    if (currentQuestionIdx < section.questionIds.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else if (currentSectionIdx < data.sections.length - 1) {
      setCurrentSectionIdx((prev) => prev + 1);
      setCurrentQuestionIdx(0);
    }
  };

  const goPrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    } else if (currentSectionIdx > 0 && data) {
      const prevSection = data.sections[currentSectionIdx - 1];
      setCurrentSectionIdx((prev) => prev - 1);
      setCurrentQuestionIdx(prevSection.questionIds.length - 1);
    }
  };

  // Answer handling
  const handleAnswerChange = useCallback(
    async (questionId: string, response: ResponseType) => {
      setAnswers((prev) => ({ ...prev, [questionId]: response }));

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await saveAnswer(attemptId!, questionId, response);
        } catch (error) {
          console.error("Error saving answer:", error);
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [attemptId],
  );

  const toggleMarkForReview = async () => {
    const questionId = getCurrentQuestionId();
    if (!questionId) return;

    const newMarked = !markedForReview.has(questionId);
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (newMarked) next.add(questionId);
      else next.delete(questionId);
      return next;
    });

    try {
      await markForReview(attemptId!, questionId, newMarked);
    } catch (error) {
      console.error("Error marking for review:", error);
    }
  };

  // Submit
  const handleSubmit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);

    try {
      await submitAttempt(attemptId!);
      Alert.alert("Success", "Your exam has been submitted successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(student)/learning" as any),
        },
      ]);
    } catch (error: any) {
      console.error("Error submitting:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Get question stats
  const getQuestionStats = () => {
    let answered = 0;
    let unanswered = 0;
    let marked = 0;

    data?.sections.forEach((section) => {
      section.questionIds.forEach((qid) => {
        if (answers[qid] !== undefined && answers[qid] !== "") {
          answered++;
        } else {
          unanswered++;
        }
        if (markedForReview.has(qid)) {
          marked++;
        }
      });
    });

    return { answered, unanswered, marked };
  };

  // Render question input
  const renderQuestionInput = () => {
    const question = getCurrentQuestion();
    const questionId = getCurrentQuestionId();
    if (!question || !questionId) return null;

    const currentAnswer = answers[questionId];

    switch (question.type) {
      case "mcq":
      case "mcq-single":
      case "true_false":
      case "true-false":
      case "truefalse":
        return (
          <View className="mt-4">
            {question.options?.map((opt, idx) => {
              const isSelected = currentAnswer === opt._id;
              return (
                <Pressable
                  key={opt._id}
                  onPress={() => handleAnswerChange(questionId, opt._id)}
                  className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                      isSelected ? "bg-emerald-500" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-bold text-base ${isSelected ? "text-white" : "text-gray-600"}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <MathText text={opt.text} fontSize={15} />
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={THEME.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        );

      case "multi_select":
      case "mcq-multi": {
        const selectedIds = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <View className="mt-4">
            <Text className="text-gray-500 text-sm mb-3 italic">
              Select all that apply
            </Text>
            {question.options?.map((opt, idx) => {
              const isSelected = selectedIds.includes(opt._id);
              return (
                <Pressable
                  key={opt._id}
                  onPress={() => {
                    const newSelection = isSelected
                      ? selectedIds.filter((id) => id !== opt._id)
                      : [...selectedIds, opt._id];
                    handleAnswerChange(questionId, newSelection);
                  }}
                  className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View
                    className={`w-7 h-7 rounded-md items-center justify-center mr-3 border-2 ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                  <View className="flex-1">
                    <MathText text={opt.text} fontSize={15} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      }

      case "assertion_reason":
      case "assertionreason":
        return (
          <View className="mt-4">
            <View className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
              <Text className="text-emerald-700 font-semibold mb-2">
                Assertion (A)
              </Text>
              <MathText text={question.assertionText || ""} fontSize={15} />
            </View>
            <View className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
              <Text className="text-purple-700 font-semibold mb-2">
                Reason (R)
              </Text>
              <MathText text={question.reasonText || ""} fontSize={15} />
            </View>
            {question.options?.map((opt, idx) => {
              const isSelected = currentAnswer === opt._id;
              return (
                <Pressable
                  key={opt._id}
                  onPress={() => handleAnswerChange(questionId, opt._id)}
                  className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isSelected ? "bg-emerald-500" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-bold ${isSelected ? "text-white" : "text-gray-600"}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <MathText text={opt.text} fontSize={14} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        );

      case "integer":
      case "numerical":
        return (
          <View className="mt-4">
            <TextInput
              keyboardType="numeric"
              className="border-2 border-gray-200 rounded-xl p-4 text-gray-900 text-base bg-white"
              placeholder="Enter your answer (number)"
              placeholderTextColor="#9ca3af"
              value={String(currentAnswer || "")}
              onChangeText={(val) => handleAnswerChange(questionId, val)}
            />
          </View>
        );

      case "subjective":
      case "short":
      case "long":
      case "text":
      case "essay":
        return (
          <View className="mt-4">
            <TextInput
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="border-2 border-gray-200 rounded-xl p-4 text-gray-900 text-base bg-white min-h-[150px]"
              placeholder="Type your answer here..."
              placeholderTextColor="#9ca3af"
              value={String(currentAnswer || "")}
              onChangeText={(val) => handleAnswerChange(questionId, val)}
            />
          </View>
        );

      default:
        return (
          <View className="mt-4 p-4 bg-gray-100 rounded-xl">
            <Text className="text-gray-600">
              This question type is not yet supported on mobile.
            </Text>
          </View>
        );
    }
  };

  // Loading
  if (loading || !data) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading exam...</Text>
      </SafeAreaView>
    );
  }

  const question = getCurrentQuestion();
  const questionId = getCurrentQuestionId();
  const globalIdx = getGlobalQuestionIndex();
  const totalQuestions = getTotalQuestions();
  const isFirstQuestion = globalIdx === 0;
  const isLastQuestion = globalIdx === totalQuestions - 1;
  const isMarked = questionId ? markedForReview.has(questionId) : false;
  const currentSection = data.sections[currentSectionIdx];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>
              {data.exam.title}
            </Text>
            <Text className="text-gray-500 text-sm">
              {currentSection?.title || "Section"}
            </Text>
          </View>
          <View className="flex-row items-center">
            {/* Timer */}
            <View
              className="flex-row items-center px-3 py-2 rounded-xl mr-2"
              style={{ backgroundColor: getTimerColor() + "20" }}
            >
              <Ionicons name="time" size={18} color={getTimerColor()} />
              <Text
                className="font-bold ml-1.5"
                style={{ color: getTimerColor() }}
              >
                {formatTime(timeRemaining)}
              </Text>
            </View>
            {/* Submit */}
            <Pressable
              onPress={() => setShowSubmitModal(true)}
              className="bg-red-500 px-4 py-2.5 rounded-xl"
            >
              <Text className="text-white font-semibold">Submit</Text>
            </Pressable>
          </View>
        </View>
        {saving && (
          <View className="flex-row items-center mt-2">
            <ActivityIndicator size="small" color={THEME.primary} />
            <Text style={{ color: THEME.primary }} className="text-xs ml-2">
              Saving...
            </Text>
          </View>
        )}
      </View>

      {/* Question */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* Question Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: THEME.primary }}
              >
                <Text className="text-white font-bold">{globalIdx + 1}</Text>
              </View>
              <Text className="text-gray-500 ml-3">of {totalQuestions}</Text>
            </View>
            <Pressable
              onPress={toggleMarkForReview}
              className={`flex-row items-center px-3 py-2 rounded-lg ${isMarked ? "bg-amber-100" : "bg-gray-100"}`}
            >
              <Ionicons
                name={isMarked ? "flag" : "flag-outline"}
                size={18}
                color={isMarked ? "#f59e0b" : "#6b7280"}
              />
              <Text
                className={`ml-1.5 text-sm font-medium ${isMarked ? "text-amber-600" : "text-gray-600"}`}
              >
                {isMarked ? "Marked" : "Mark"}
              </Text>
            </Pressable>
          </View>

          {/* Question Text */}
          <View className="mb-2">
            <MathText text={question?.text || ""} fontSize={16} />
          </View>

          {/* Diagram Image */}
          {question?.diagramUrl && (
            <View className="mb-4">
              <Image
                source={{ uri: question.diagramUrl }}
                style={{ width: "100%", height: 200 }}
                resizeMode="contain"
                className="rounded-lg"
              />
            </View>
          )}

          {/* Question Options */}
          {renderQuestionInput()}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={goPrev}
            disabled={isFirstQuestion}
            className={`flex-row items-center px-5 py-3 rounded-xl ${isFirstQuestion ? "bg-gray-100" : "bg-gray-200"}`}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isFirstQuestion ? "#9ca3af" : "#374151"}
            />
            <Text
              className={`font-semibold ml-1 ${isFirstQuestion ? "text-gray-400" : "text-gray-700"}`}
            >
              Previous
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowPalette(true)}
            className="px-5 py-3 rounded-xl flex-row items-center"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <Ionicons name="grid" size={20} color={THEME.primary} />
            <Text
              style={{ color: THEME.primary }}
              className="font-semibold ml-1.5"
            >
              {globalIdx + 1}/{totalQuestions}
            </Text>
          </Pressable>

          <Pressable
            onPress={goNext}
            disabled={isLastQuestion}
            className="flex-row items-center px-5 py-3 rounded-xl"
            style={{
              backgroundColor: isLastQuestion ? "#f3f4f6" : THEME.primary,
            }}
          >
            <Text
              className={`font-semibold mr-1 ${isLastQuestion ? "text-gray-400" : "text-white"}`}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isLastQuestion ? "#9ca3af" : "white"}
            />
          </Pressable>
        </View>
      </View>

      {/* Question Palette Modal */}
      <Modal visible={showPalette} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Question Navigator
              </Text>
              <Pressable onPress={() => setShowPalette(false)}>
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-3 mb-4">
              <View className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: THEME.primary }}
                />
                <Text className="text-gray-600 text-sm ml-1.5">Answered</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-gray-200" />
                <Text className="text-gray-600 text-sm ml-1.5">
                  Not Answered
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-amber-400" />
                <Text className="text-gray-600 text-sm ml-1.5">Marked</Text>
              </View>
            </View>

            <ScrollView className="flex-1">
              {data.sections.map((section, sIdx) => {
                let startIdx = 0;
                for (let i = 0; i < sIdx; i++) {
                  startIdx += data.sections[i].questionIds.length;
                }
                return (
                  <View key={section._id} className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">
                      {section.title}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {section.questionIds.map((qid, qIdx) => {
                        const gIdx = startIdx + qIdx;
                        const isAnswered =
                          answers[qid] !== undefined && answers[qid] !== "";
                        const isReviewMarked = markedForReview.has(qid);
                        const isCurrent = gIdx === globalIdx;

                        let bgColor = "#e5e7eb";
                        if (isReviewMarked) bgColor = "#fbbf24";
                        else if (isAnswered) bgColor = THEME.primary;

                        return (
                          <Pressable
                            key={qid}
                            onPress={() => goToQuestion(gIdx)}
                            className="w-11 h-11 rounded-lg items-center justify-center"
                            style={{
                              backgroundColor: bgColor,
                              borderWidth: isCurrent ? 2 : 0,
                              borderColor: isCurrent
                                ? THEME.primaryDark
                                : "transparent",
                            }}
                          >
                            <Text
                              className="font-bold"
                              style={{
                                color:
                                  isAnswered && !isReviewMarked
                                    ? "white"
                                    : "#374151",
                              }}
                            >
                              {gIdx + 1}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal visible={showSubmitModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                <Ionicons name="alert-circle" size={36} color="#ef4444" />
              </View>
              <Text className="text-gray-900 text-xl font-bold">
                Submit Exam?
              </Text>
            </View>

            {(() => {
              const stats = getQuestionStats();
              return (
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Answered</Text>
                    <Text
                      style={{ color: THEME.primary }}
                      className="font-bold"
                    >
                      {stats.answered}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Unanswered</Text>
                    <Text className="text-red-500 font-bold">
                      {stats.unanswered}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Marked for Review</Text>
                    <Text className="text-amber-500 font-bold">
                      {stats.marked}
                    </Text>
                  </View>
                </View>
              );
            })()}

            <Text className="text-gray-500 text-center text-sm mb-4">
              Once submitted, you cannot change your answers.
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowSubmitModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-red-500 py-3 rounded-xl"
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">
                    Submit
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
