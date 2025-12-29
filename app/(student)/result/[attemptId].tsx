import MathText from "@/components/ui/MathText";
import { getAttempt } from "@/lib/studentApi";
import type { Answer, AttemptDetailResponse, Question } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

export default function ResultDetailScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptDetailResponse | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    try {
      const response = await getAttempt(attemptId!);
      setData(response);
    } catch (error: any) {
      console.error("Error loading result:", error);
      Alert.alert("Error", "Failed to load result details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getAnswerForQuestion = (questionId: string): Answer | undefined => {
    return data?.attempt.answers?.find((a) => a.questionId === questionId);
  };

  const getScoreColor = (isCorrect?: boolean, scoreAwarded?: number) => {
    if (isCorrect === true || (scoreAwarded && scoreAwarded > 0)) {
      return { bg: "bg-emerald-50", border: "border-emerald-200", icon: "checkmark-circle", iconColor: THEME.primary };
    } else if (isCorrect === false) {
      return { bg: "bg-red-50", border: "border-red-200", icon: "close-circle", iconColor: "#ef4444" };
    }
    return { bg: "bg-gray-50", border: "border-gray-200", icon: "remove-circle", iconColor: "#9ca3af" };
  };

  const getOptionLabel = (question: Question, optionId?: string): string => {
    if (!optionId || !question.options) return "—";
    const idx = question.options.findIndex((o) => o._id === optionId);
    if (idx === -1) return "—";
    return String.fromCharCode(65 + idx);
  };

  const getCorrectOptionId = (question: Question): string | undefined => {
    const correct = question.options?.find((o) => o.isCorrect);
    return correct?._id;
  };

  if (loading || !data) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading result...</Text>
      </SafeAreaView>
    );
  }

  const { attempt, exam, sections, questions } = data;
  const totalScore = attempt.totalScore ?? 0;
  const maxScore = attempt.maxScore ?? 0;
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Calculate stats
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  sections.forEach((section) => {
    section.questionIds.forEach((qid) => {
      const ans = getAnswerForQuestion(qid);
      if (!ans || (!ans.chosenOptionId && !ans.selectedOptionIds?.length && !ans.textAnswer)) {
        unattempted++;
      } else if (ans.isCorrect === true || (ans.scoreAwarded && ans.scoreAwarded > 0)) {
        correct++;
      } else {
        incorrect++;
      }
    });
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>
              {exam.title}
            </Text>
            <Text className="text-gray-500 text-sm">Result Details</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Score Summary Card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="items-center mb-4">
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  percent >= 70 ? "#dcfce7" : percent >= 40 ? "#fef3c7" : "#fee2e2",
              }}
            >
              <Text
                className="text-3xl font-bold"
                style={{
                  color: percent >= 70 ? THEME.primary : percent >= 40 ? "#b45309" : "#dc2626",
                }}
              >
                {percent}%
              </Text>
            </View>
            <Text className="text-gray-900 text-xl font-bold mt-3">
              {totalScore}/{maxScore}
            </Text>
            <Text className="text-gray-500 text-sm">Total Score</Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around pt-4 border-t border-gray-100">
            <View className="items-center">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color={THEME.primary} />
                <Text style={{ color: THEME.primary }} className="font-bold text-lg ml-1">
                  {correct}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs">Correct</Text>
            </View>
            <View className="items-center">
              <View className="flex-row items-center">
                <Ionicons name="close-circle" size={18} color="#ef4444" />
                <Text className="text-red-500 font-bold text-lg ml-1">{incorrect}</Text>
              </View>
              <Text className="text-gray-500 text-xs">Incorrect</Text>
            </View>
            <View className="items-center">
              <View className="flex-row items-center">
                <Ionicons name="remove-circle" size={18} color="#9ca3af" />
                <Text className="text-gray-500 font-bold text-lg ml-1">{unattempted}</Text>
              </View>
              <Text className="text-gray-500 text-xs">Skipped</Text>
            </View>
          </View>
        </View>

        {/* Questions List */}
        <View className="px-4 py-4">
          <Text className="text-gray-900 text-lg font-bold mb-3">Question Breakdown</Text>

          {sections.map((section, sIdx) => {
            let startIdx = 0;
            for (let i = 0; i < sIdx; i++) {
              startIdx += sections[i].questionIds.length;
            }

            return (
              <View key={section._id} className="mb-4">
                {sections.length > 1 && (
                  <Text className="text-gray-600 font-semibold mb-2">{section.title}</Text>
                )}

                {section.questionIds.map((qid, qIdx) => {
                  const question = questions[qid];
                  const answer = getAnswerForQuestion(qid);
                  const isExpanded = expandedQuestions.has(qid);
                  const colors = getScoreColor(answer?.isCorrect, answer?.scoreAwarded);
                  const globalIdx = startIdx + qIdx;

                  if (!question) return null;

                  const userOptionId = answer?.chosenOptionId;
                  const correctOptionId = getCorrectOptionId(question);

                  return (
                    <Pressable
                      key={qid}
                      onPress={() => toggleExpand(qid)}
                      className={`${colors.bg} ${colors.border} border rounded-xl mb-3 overflow-hidden`}
                    >
                      <View className="p-4">
                        <View className="flex-row items-start justify-between">
                          <View className="flex-row items-center flex-1">
                            <View className="bg-white w-8 h-8 rounded-full items-center justify-center mr-3 border border-gray-200">
                              <Text className="font-bold text-gray-700">{globalIdx + 1}</Text>
                            </View>
                            <View className="flex-1">
                              <MathText 
                                text={isExpanded ? (question.text || "") : ((question.text || "").substring(0, 120) + ((question.text?.length || 0) > 120 ? "..." : ""))} 
                                fontSize={14} 
                              />
                            </View>
                          </View>
                          <View className="flex-row items-center ml-2">
                            <Ionicons name={colors.icon as any} size={22} color={colors.iconColor} />
                            <Ionicons
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={20}
                              color="#6b7280"
                              style={{ marginLeft: 4 }}
                            />
                          </View>
                        </View>

                        {answer?.scoreAwarded !== undefined && (
                          <View className="flex-row items-center mt-2">
                            <Text className="text-gray-500 text-sm">Score: </Text>
                            <Text className="font-bold text-gray-800">{answer.scoreAwarded}</Text>
                          </View>
                        )}
                      </View>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <View className="px-4 pb-4 bg-white/50">
                          <View className="border-t border-gray-200 pt-4">
                            <Text className="text-gray-600 text-xs uppercase mb-2 font-semibold">Question</Text>
                            <View className="mb-4">
                              <MathText text={question.text || ""} fontSize={15} />
                            </View>

                            <View className="flex-row mb-3">
                              <Text className="text-gray-600 text-sm w-28">Your Answer:</Text>
                              <Text
                                className="font-semibold flex-1"
                                style={{ color: answer?.isCorrect ? THEME.primary : "#ef4444" }}
                              >
                                {userOptionId ? `(${getOptionLabel(question, userOptionId)}) ` : ""}
                                {question.options?.find((o) => o._id === userOptionId)?.text ||
                                  answer?.textAnswer ||
                                  "Not answered"}
                              </Text>
                            </View>

                            {!answer?.isCorrect && (
                              <View className="flex-row mb-3">
                                <Text className="text-gray-600 text-sm w-28">Correct:</Text>
                                <Text style={{ color: THEME.primary }} className="font-semibold flex-1">
                                  {correctOptionId ? `(${getOptionLabel(question, correctOptionId)}) ` : ""}
                                  {question.options?.find((o) => o._id === correctOptionId)?.text ||
                                    question.correctAnswer ||
                                    "—"}
                                </Text>
                              </View>
                            )}

                            {question.explanation && (
                              <View className="bg-emerald-50 rounded-lg p-3 mt-2">
                                <Text style={{ color: THEME.primaryDark }} className="font-semibold text-xs mb-1">
                                  Explanation
                                </Text>
                                <MathText text={question.explanation} fontSize={14} />
                              </View>
                            )}

                            {answer?.aiFeedback && (
                              <View className="bg-purple-50 rounded-lg p-3 mt-2">
                                <Text className="text-purple-700 font-semibold text-xs mb-1">AI Feedback</Text>
                                <Text className="text-purple-800 text-sm">{answer.aiFeedback}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
