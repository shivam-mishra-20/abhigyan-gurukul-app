import { getColors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import modular components
import FilterSelectionStep from "@/components/teacher/FilterSelectionStep";
import QuestionSelectionStep from "@/components/teacher/QuestionSelectionStep";
import StudentSelector from "@/components/teacher/StudentSelector";

// ============================================================================
// Types
// ============================================================================

interface ExamSection {
  title: string;
  questionIds: string[];
  sectionDurationMins: number;
}

interface Exam {
  _id: string;
  title: string;
  classLevel?: string;
  batch?: string;
  totalDurationMins?: number;
  sections?: ExamSection[];
  isPublished?: boolean;
  assignedTo?: {
    users?: string[];
    groups?: string[];
  };
}

// ============================================================================
// Main Component
// ============================================================================

export default function BuildExamEnhanced() {
  const router = useRouter();
  const { examId } = useLocalSearchParams<{ examId?: string }>();
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  // Step Management
  const [currentStep, setCurrentStep] = useState<
    "basic" | "filters" | "questions" | "students" | "review"
  >("basic");

  // Exam Data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic Info
  const [examTitle, setExamTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [totalDuration, setTotalDuration] = useState("60");

  // Step 2: Filters
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  // Step 3: Questions
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Step 4: Students
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignToAll, setAssignToAll] = useState(false);

  // Load exam if editing
  useEffect(() => {
    if (examId) {
      loadExam();
    } else {
      setLoading(false);
    }
  }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExam = async () => {
    try {
      const data = (await apiFetch(`/api/exams/${examId}`)) as Exam;
      setExam(data); // Will be used for pre-filling form in future
      setExamTitle(data.title);
      setSelectedClass(data.classLevel || "");
      setTotalDuration(String(data.totalDurationMins || 60));

      // Extract question IDs from sections
      if (data.sections && data.sections.length > 0) {
        const questionIds = data.sections.flatMap((s) => s.questionIds);
        setSelectedQuestions(questionIds);
      }

      // Load assigned students
      if (data.assignedTo?.users) {
        setSelectedStudents(data.assignedTo.users);
      }
    } catch (error) {
      console.error("Failed to load exam:", error);
      Alert.alert("Error", "Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  // Navigation between steps
  const handleNext = () => {
    if (currentStep === "basic" && !examTitle.trim()) {
      Alert.alert("Required", "Please enter exam title");
      return;
    }
    if (currentStep === "basic" && !selectedClass) {
      Alert.alert("Required", "Please select a class");
      return;
    }

    const steps: (typeof currentStep)[] = [
      "basic",
      "filters",
      "questions",
      "students",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: (typeof currentStep)[] = [
      "basic",
      "filters",
      "questions",
      "students",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  // Save exam
  const handleSave = async (publish: boolean = false) => {
    if (!examTitle.trim()) {
      Alert.alert("Error", "Exam title is required");
      return;
    }

    if (selectedQuestions.length === 0) {
      Alert.alert("Error", "Please select at least one question");
      return;
    }

    setSaving(true);
    try {
      const examData = {
        title: examTitle.trim(),
        classLevel: selectedClass,
        totalDurationMins: parseInt(totalDuration) || 60,
        sections: [
          {
            title: "Section A",
            questionIds: selectedQuestions,
            sectionDurationMins: parseInt(totalDuration) || 60,
          },
        ],
        isPublished: publish,
        assignedTo: assignToAll
          ? { groups: [selectedClass] }
          : { users: selectedStudents },
      };

      if (examId) {
        await apiFetch(`/api/exams/${examId}`, {
          method: "PUT",
          body: JSON.stringify(examData),
        });
        Alert.alert("Success", "Exam updated successfully");
      } else {
        await apiFetch("/api/exams", {
          method: "POST",
          body: JSON.stringify(examData),
        });
        Alert.alert("Success", "Exam created successfully");
      }

      router.back();
    } catch (error) {
      console.error("Failed to save exam:", error);
      Alert.alert("Error", "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header - Clean and minimal */}
      <View
        className="px-6 py-4 border-b"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable onPress={handleBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? colors.gray100 : colors.gray900}
            />
          </Pressable>
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? colors.gray100 : colors.gray900 }}
          >
            {examId ? "Edit Exam" : "Create Exam"}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-4">
        {/* Step 1: Basic Info */}
        {currentStep === "basic" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6">
              <Text
                className="text-2xl font-bold mb-2"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                Basic Information
              </Text>
              <Text className="text-sm" style={{ color: colors.gray500 }}>
                Set up the basic details for your exam
              </Text>
            </View>

            {/* Exam Title */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                Exam Title *
              </Text>
              <TextInput
                value={examTitle}
                onChangeText={setExamTitle}
                placeholder="e.g., Mathematics Mid-Term Exam"
                placeholderTextColor={colors.gray400}
                className="px-4 py-3 rounded-xl border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  color: isDark ? colors.gray100 : colors.gray900,
                }}
              />
            </View>

            {/* Class Selection */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                Class *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "Class 6",
                  "Class 7",
                  "Class 8",
                  "Class 9",
                  "Class 10",
                  "Class 11",
                  "Class 12",
                ].map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <Pressable
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      className="px-4 py-3 rounded-xl border"
                      style={{
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.backgroundSecondary,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      }}
                    >
                      <Text
                        className="font-semibold"
                        style={{
                          color: isSelected
                            ? "#FFFFFF"
                            : isDark
                            ? colors.gray100
                            : colors.gray900,
                        }}
                      >
                        {cls}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                Total Duration (minutes)
              </Text>
              <TextInput
                value={totalDuration}
                onChangeText={setTotalDuration}
                placeholder="60"
                keyboardType="numeric"
                placeholderTextColor={colors.gray400}
                className="px-4 py-3 rounded-xl border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  color: isDark ? colors.gray100 : colors.gray900,
                }}
              />
            </View>

            {/* Next Button */}
            <Pressable
              onPress={handleNext}
              disabled={!examTitle.trim() || !selectedClass}
              className="py-4 rounded-xl items-center mt-4"
              style={{
                backgroundColor:
                  examTitle.trim() && selectedClass
                    ? colors.primary
                    : colors.gray400,
              }}
            >
              <Text className="text-white font-semibold text-base">
                Next: Select Filters
              </Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Step 2: Filters */}
        {currentStep === "filters" && (
          <FilterSelectionStep
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            onSubjectChange={setSelectedSubject}
            onChaptersChange={setSelectedChapters}
            onNext={handleNext}
          />
        )}

        {/* Step 3: Questions */}
        {currentStep === "questions" && (
          <QuestionSelectionStep
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            selectedQuestions={selectedQuestions}
            onQuestionsChange={setSelectedQuestions}
            onBack={handleBack}
            onSave={handleNext}
          />
        )}

        {/* Step 4: Student Assignment */}
        {currentStep === "students" && (
          <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-6">
                <Text
                  className="text-2xl font-bold mb-2"
                  style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                >
                  Assign Students
                </Text>
                <Text className="text-sm" style={{ color: colors.gray500 }}>
                  Choose which students can take this exam
                </Text>
              </View>

              {/* Assign to All Toggle */}
              <Pressable
                onPress={() => setAssignToAll(!assignToAll)}
                className="flex-row items-center justify-between p-4 rounded-xl border mb-4"
                style={{
                  backgroundColor: assignToAll
                    ? colors.primary + "20"
                    : colors.backgroundSecondary,
                  borderColor: assignToAll ? colors.primary : colors.border,
                }}
              >
                <View className="flex-1 mr-3">
                  <Text
                    className="font-semibold mb-1"
                    style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                  >
                    Assign to All Students in {selectedClass}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.gray500 }}>
                    All students in this class can take the exam
                  </Text>
                </View>
                <Ionicons
                  name={assignToAll ? "checkbox" : "square-outline"}
                  size={24}
                  color={assignToAll ? colors.primary : colors.gray400}
                />
              </Pressable>

              {/* Individual Student Selection */}
              {!assignToAll && (
                <View className="flex-1">
                  <StudentSelector
                    selectedStudents={selectedStudents}
                    onSelectionChange={setSelectedStudents}
                    classFilter={selectedClass}
                  />
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View
              className="p-4 border-t"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleBack}
                  className="flex-1 py-4 rounded-xl items-center border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                  >
                    Back
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleNext}
                  className="flex-1 py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold">Next: Review</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Step 5: Review & Save */}
        {currentStep === "review" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6">
              <Text
                className="text-2xl font-bold mb-2"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                Review & Save
              </Text>
              <Text className="text-sm" style={{ color: colors.gray500 }}>
                Review your exam details before saving
              </Text>
            </View>

            {/* Summary Cards */}
            <View className="gap-4">
              {/* Basic Info Card */}
              <View
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="font-bold mb-3"
                  style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                >
                  Basic Information
                </Text>
                <View className="gap-2">
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Title:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {examTitle}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Class:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {selectedClass}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Duration:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {totalDuration} minutes
                    </Text>
                  </View>
                </View>
              </View>

              {/* Questions Card */}
              <View
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="font-bold mb-3"
                  style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                >
                  Questions
                </Text>
                <View className="gap-2">
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Subject:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {selectedSubject}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Chapters:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {selectedChapters.length}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Total:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {selectedQuestions.length} questions
                    </Text>
                  </View>
                </View>
              </View>

              {/* Assignment Card */}
              <View
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="font-bold mb-3"
                  style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                >
                  Assignment
                </Text>
                <View className="gap-2">
                  <View className="flex-row">
                    <Text className="w-24" style={{ color: colors.gray500 }}>
                      Assigned:
                    </Text>
                    <Text
                      className="flex-1 font-medium"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {assignToAll
                        ? `All students in ${selectedClass}`
                        : `${selectedStudents.length} individual students`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={handleBack}
                className="flex-1 py-4 rounded-xl items-center border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                >
                  Back
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSave(false)}
                disabled={saving}
                className="flex-1 py-4 rounded-xl items-center"
                style={{
                  backgroundColor: colors.gray600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold">Save Draft</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => handleSave(true)}
                disabled={saving}
                className="flex-1 py-4 rounded-xl items-center"
                style={{
                  backgroundColor: colors.primary,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold">Publish</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
