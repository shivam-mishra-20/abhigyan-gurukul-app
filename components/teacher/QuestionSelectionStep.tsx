/**
 * QuestionSelectionStep Component
 * Optimized question display with selection, filtering, and LaTeX rendering
 */

import MathText from "@/components/MathText";
import { getColors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface Question {
  _id: string;
  text: string;
  type: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  marks?: number;
  difficulty?: string;
  diagramUrl?: string;
  options?: { text: string; isCorrect?: boolean }[];
}

interface QuestionSelectionStepProps {
  selectedClass: string;
  selectedSubject: string;
  selectedChapters: string[];
  selectedQuestions: string[];
  onQuestionsChange: (questionIds: string[]) => void;
  onBack: () => void;
  onSave: () => void;
}

export default function QuestionSelectionStep({
  selectedClass,
  selectedSubject,
  selectedChapters,
  selectedQuestions,
  onQuestionsChange,
  onBack,
  onSave,
}: QuestionSelectionStepProps) {
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterType, setFilterType] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const allQuestions: Question[] = [];

        // Fetch questions for all selected chapters in parallel
        const promises = selectedChapters.map(async (chapter) => {
          const params = new URLSearchParams({
            subject: selectedSubject,
            chapter,
            class: selectedClass,
          });

          const res = (await apiFetch(
            `/api/exams/questions/for-paper?${params.toString()}`
          )) as { items?: Question[]; questions?: Question[] };

          return res?.items || res?.questions || [];
        });

        const results = await Promise.all(promises);
        results.forEach((list) => allQuestions.push(...list));

        // Remove duplicates
        const unique = Array.from(
          new Map(allQuestions.map((q) => [q._id, q])).values()
        );

        setQuestions(unique);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedClass, selectedSubject, selectedChapters]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        !searchTerm ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDifficulty =
        !filterDifficulty || q.difficulty === filterDifficulty;

      const matchesType = !filterType || q.type === filterType;

      return matchesSearch && matchesDifficulty && matchesType;
    });
  }, [questions, searchTerm, filterDifficulty, filterType]);

  // Get unique difficulties and types
  const { difficulties, types } = useMemo(() => {
    const diffSet = new Set<string>();
    const typeSet = new Set<string>();

    questions.forEach((q) => {
      if (q.difficulty) diffSet.add(q.difficulty);
      if (q.type) typeSet.add(q.type);
    });

    return {
      difficulties: Array.from(diffSet).sort(),
      types: Array.from(typeSet).sort(),
    };
  }, [questions]);

  // Toggle question
  const toggleQuestion = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      onQuestionsChange(selectedQuestions.filter((id) => id !== questionId));
    } else {
      onQuestionsChange([...selectedQuestions, questionId]);
    }
  };

  // Toggle question expansion
  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  // Select all filtered
  const handleSelectAll = () => {
    const allSelected = filteredQuestions.every((q) =>
      selectedQuestions.includes(q._id)
    );

    if (allSelected) {
      const filteredIds = filteredQuestions.map((q) => q._id);
      onQuestionsChange(
        selectedQuestions.filter((id) => !filteredIds.includes(id))
      );
    } else {
      const newSelected = [
        ...new Set([
          ...selectedQuestions,
          ...filteredQuestions.map((q) => q._id),
        ]),
      ];
      onQuestionsChange(newSelected);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "hard":
        return "#ef4444";
      default:
        return colors.gray400;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-2 text-sm" style={{ color: colors.gray500 }}>
          Loading questions...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search & Filters */}
      <View className="mb-4">
        {/* Selection counter badge */}
        {selectedQuestions.length > 0 && (
          <View className="mb-3 flex-row justify-center">
            <View
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.primary + "15" }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: colors.primary }}
              >
                {`${selectedQuestions.length} Question${
                  selectedQuestions.length !== 1 ? "s" : ""
                } Selected`}
              </Text>
            </View>
          </View>
        )}

        {/* Search with elegant styling */}
        <View
          className="flex-row items-center px-4 py-3 rounded-2xl border-2 mb-3 shadow-sm"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: searchTerm ? colors.primary : colors.border,
          }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Ionicons name="search" size={20} color={colors.primary} />
          </View>
          <TextInput
            placeholder="Search questions..."
            placeholderTextColor={colors.gray400}
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 text-base"
            style={{ color: isDark ? colors.gray100 : colors.gray900 }}
          />
          {searchTerm ? (
            <Pressable onPress={() => setSearchTerm("")}>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.gray200 }}
              >
                <Ionicons name="close" size={18} color={colors.gray600} />
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* Filter Chips - Elegant design */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            {/* Select All - Primary button */}
            <Pressable
              onPress={handleSelectAll}
              className="px-4 py-2.5 rounded-xl shadow-sm"
              style={{
                backgroundColor: colors.primary,
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    filteredQuestions.every((q) =>
                      selectedQuestions.includes(q._id)
                    )
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-sm font-semibold text-white">
                  {filteredQuestions.every((q) =>
                    selectedQuestions.includes(q._id)
                  )
                    ? "Deselect All"
                    : "Select All"}
                </Text>
              </View>
            </Pressable>

            {/* Difficulty Filter - Elegant chips */}
            {difficulties.map((diff) => (
              <Pressable
                key={diff}
                onPress={() =>
                  setFilterDifficulty(filterDifficulty === diff ? "" : diff)
                }
                className="px-4 py-2.5 rounded-xl shadow-sm"
                style={{
                  backgroundColor:
                    filterDifficulty === diff
                      ? getDifficultyColor(diff)
                      : colors.backgroundSecondary,
                  borderWidth: 1.5,
                  borderColor:
                    filterDifficulty === diff
                      ? getDifficultyColor(diff)
                      : colors.border,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color:
                      filterDifficulty === diff
                        ? "#FFFFFF"
                        : getDifficultyColor(diff),
                  }}
                >
                  {diff}
                </Text>
              </Pressable>
            ))}

            {/* Type Filter - Elegant chips */}
            {types.map((type) => (
              <Pressable
                key={type}
                onPress={() => setFilterType(filterType === type ? "" : type)}
                className="px-4 py-2.5 rounded-xl shadow-sm"
                style={{
                  backgroundColor:
                    filterType === type
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderWidth: 1.5,
                  borderColor:
                    filterType === type ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: filterType === type ? "#FFFFFF" : colors.gray600,
                  }}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Questions List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {filteredQuestions.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.gray400}
            />
            <Text className="mt-2 text-sm" style={{ color: colors.gray500 }}>
              No questions found
            </Text>
          </View>
        ) : (
          filteredQuestions.map((question, index) => {
            const isSelected = selectedQuestions.includes(question._id);
            const isExpanded = expandedQuestions.has(question._id);
            const hasMath = question.text?.includes("$");

            return (
              <View
                key={question._id}
                className="mb-3 rounded-2xl overflow-hidden shadow-sm"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                {/* Question Header */}
                <Pressable
                  onPress={() => toggleQuestion(question._id)}
                  className="flex-row items-start p-4"
                >
                  {/* Checkbox - Elegant design */}
                  <View className="mr-3 mt-1">
                    <View
                      className="w-7 h-7 rounded-lg items-center justify-center"
                      style={{
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.background,
                        borderWidth: 2,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.gray300,
                      }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </View>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    {/* Question Number & Badges */}
                    <View className="flex-row items-center flex-wrap gap-2 mb-3">
                      <View
                        className="px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: colors.primary }}
                        >
                          Q{String(index + 1)}
                        </Text>
                      </View>
                      {question.type && String(question.type).trim() && (
                        <View
                          className="px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: colors.gray700 + "15" }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: colors.gray700 }}
                          >
                            {String(question.type)}
                          </Text>
                        </View>
                      )}
                      {question.difficulty &&
                        String(question.difficulty).trim() && (
                          <View
                            className="px-3 py-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                getDifficultyColor(question.difficulty) + "20",
                            }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{
                                color: getDifficultyColor(question.difficulty),
                              }}
                            >
                              {String(question.difficulty)}
                            </Text>
                          </View>
                        )}
                      {question.marks && (
                        <View
                          className="px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: colors.warning + "15" }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: colors.warning }}
                          >
                            {String(question.marks)} marks
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Question Text - with Math rendering */}
                    {hasMath ? (
                      <View className="mb-2">
                        <MathText text={question.text} fontSize={15} />
                      </View>
                    ) : (
                      <Text
                        className="mb-2 leading-6"
                        style={{
                          color: isDark ? colors.gray100 : colors.gray900,
                          fontSize: 15,
                        }}
                        numberOfLines={isExpanded ? undefined : 3}
                      >
                        {question.text}
                      </Text>
                    )}

                    {/* Chapter/Topic - Elegant badges */}
                    {(question.chapter || question.topic) && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="bookmark-outline"
                          size={14}
                          color={colors.gray400}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          className="text-xs"
                          style={{ color: colors.gray500 }}
                        >
                          {[
                            question.chapter && String(question.chapter).trim(),
                            question.topic && String(question.topic).trim(),
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Expand Button - Better design */}
                  <Pressable
                    onPress={() => toggleExpanded(question._id)}
                    className="ml-2 w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.gray200 }}
                  >
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={colors.gray600}
                    />
                  </Pressable>
                </Pressable>

                {/* Expanded Content - Enhanced design */}
                {isExpanded && (
                  <View
                    className="px-4 pb-4 pt-3 border-t"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background + "80",
                    }}
                  >
                    {/* Diagram - Better styling */}
                    {question.diagramUrl && (
                      <Pressable
                        onPress={() => setViewingImage(question.diagramUrl!)}
                        className="mt-2 mb-3 rounded-xl overflow-hidden"
                        style={{
                          backgroundColor: colors.gray100,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Image
                          source={{ uri: question.diagramUrl }}
                          style={{
                            width: "100%",
                            height: 200,
                            borderRadius: 12,
                          }}
                          resizeMode="contain"
                        />
                        <View
                          className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full flex-row items-center"
                          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                        >
                          <Ionicons
                            name="expand-outline"
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 4 }}
                          />
                          <Text className="text-xs text-white font-medium">
                            View Full
                          </Text>
                        </View>
                      </Pressable>
                    )}

                    {/* Options - Elegant design */}
                    {question.options && question.options.length > 0 && (
                      <View className="mt-2">
                        <Text
                          className="font-bold mb-3 text-sm"
                          style={{
                            color: isDark ? colors.gray100 : colors.gray900,
                          }}
                        >
                          Answer Options:
                        </Text>
                        {question.options.map((opt, idx) => {
                          const optHasMath = opt.text?.includes("$");
                          return (
                            <View
                              key={idx}
                              className="p-3 mb-2 rounded-xl"
                              style={{
                                backgroundColor: opt.isCorrect
                                  ? "#10b981" + "15"
                                  : colors.backgroundSecondary,
                                borderWidth: 1.5,
                                borderColor: opt.isCorrect
                                  ? "#10b981"
                                  : colors.border,
                              }}
                            >
                              <View className="flex-row items-start">
                                <View
                                  className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                                  style={{
                                    backgroundColor: opt.isCorrect
                                      ? "#10b981"
                                      : colors.gray300,
                                  }}
                                >
                                  <Text
                                    className="text-xs font-bold"
                                    style={{
                                      color: opt.isCorrect
                                        ? "#FFFFFF"
                                        : colors.gray600,
                                    }}
                                  >
                                    {String.fromCharCode(65 + idx)}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  {optHasMath ? (
                                    <MathText text={opt.text} fontSize={14} />
                                  ) : (
                                    <Text
                                      className="leading-5"
                                      style={{
                                        color: opt.isCorrect
                                          ? "#059669"
                                          : isDark
                                          ? colors.gray100
                                          : colors.gray900,
                                        fontSize: 14,
                                      }}
                                    >
                                      {opt.text}
                                    </Text>
                                  )}
                                </View>
                                {opt.isCorrect && (
                                  <View
                                    className="ml-2 w-6 h-6 rounded-full items-center justify-center"
                                    style={{ backgroundColor: "#10b981" }}
                                  >
                                    <Ionicons
                                      name="checkmark"
                                      size={14}
                                      color="#FFFFFF"
                                    />
                                  </View>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Image Viewer Modal - Enhanced */}
      <Modal
        visible={!!viewingImage}
        transparent
        onRequestClose={() => setViewingImage(null)}
        animationType="fade"
      >
        <View className="flex-1 bg-black">
          <Pressable
            onPress={() => setViewingImage(null)}
            className="absolute top-12 right-6 z-10 w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          {viewingImage && (
            <View className="flex-1 items-center justify-center">
              <Image
                source={{ uri: viewingImage }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>

      {/* Bottom Action Bar - Elegant Design */}
      <View
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{
          backgroundColor: colors.background,
        }}
      >
        <View className="flex-row gap-3">
          <Pressable
            onPress={onBack}
            className="flex-1 py-4 rounded-2xl items-center border-2"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="arrow-back"
                size={18}
                color={isDark ? colors.gray100 : colors.gray900}
                style={{ marginRight: 6 }}
              />
              <Text
                className="font-bold text-base"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                Back
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={onSave}
            disabled={selectedQuestions.length === 0}
            className="flex-1 py-4 rounded-2xl items-center shadow-lg"
            style={{
              backgroundColor:
                selectedQuestions.length > 0 ? colors.primary : colors.gray400,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text className="text-white font-bold text-base">
                {`Continue (${selectedQuestions.length})`}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
