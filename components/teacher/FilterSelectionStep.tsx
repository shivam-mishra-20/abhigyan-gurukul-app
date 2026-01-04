/**
 * FilterSelectionStep Component
 * Elegant filter selection interface for exam creation
 */

import { getColors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface FilterOptions {
  subjects: string[];
  chapters: string[];
  topics: string[];
}

interface FilterSelectionStepProps {
  selectedClass: string;
  selectedSubject: string;
  selectedChapters: string[];
  onSubjectChange: (subject: string) => void;
  onChaptersChange: (chapters: string[]) => void;
  onNext: () => void;
}

export default function FilterSelectionStep({
  selectedClass,
  selectedSubject,
  selectedChapters,
  onSubjectChange,
  onChaptersChange,
  onNext,
}: FilterSelectionStepProps) {
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    subjects: [],
    chapters: [],
    topics: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch filters
  useEffect(() => {
    const loadFilters = async () => {
      if (!selectedClass) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedSubject) params.append("subject", selectedSubject);

        const res = (await apiFetch(
          `/api/ai/questions/class/${selectedClass}/filters?${params.toString()}`
        )) as { success: boolean; data: FilterOptions };

        if (res?.success && res.data) {
          setFilterOptions(res.data);
        }
      } catch (error) {
        console.error("Failed to load filters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
  }, [selectedClass, selectedSubject]);

  // Toggle chapter selection
  const toggleChapter = (chapter: string) => {
    if (selectedChapters.includes(chapter)) {
      onChaptersChange(selectedChapters.filter((c) => c !== chapter));
    } else {
      onChaptersChange([...selectedChapters, chapter]);
    }
  };

  // Select all chapters for a subject
  const selectAllChaptersForSubject = () => {
    const subjectChapters = filterOptions.chapters;
    const allSelected = subjectChapters.every((ch) =>
      selectedChapters.includes(ch)
    );

    if (allSelected) {
      onChaptersChange(
        selectedChapters.filter((ch) => !subjectChapters.includes(ch))
      );
    } else {
      const newChapters = [
        ...new Set([...selectedChapters, ...subjectChapters]),
      ];
      onChaptersChange(newChapters);
    }
  };

  const canProceed = selectedSubject && selectedChapters.length > 0;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-2 text-sm" style={{ color: colors.gray500 }}>
          Loading filters...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[colors.primary + "15", colors.primary + "05"]}
          className="mb-6 p-4 rounded-2xl"
        >
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: isDark ? colors.gray100 : colors.gray900 }}
          >
            Select Filters
          </Text>
          <Text className="text-sm" style={{ color: colors.gray500 }}>
            Choose subject and chapters for exam questions
          </Text>
        </LinearGradient>

        {/* Subject Selection - Elegant Cards */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-lg font-bold"
              style={{ color: isDark ? colors.gray100 : colors.gray900 }}
            >
              📚 Subject
            </Text>
            <View className="flex-row items-center gap-2">
              {selectedSubject && (
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Selected
                  </Text>
                </View>
              )}
              {selectedSubject && (
                <Pressable
                  onPress={() => onSubjectChange("")}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: colors.error + "20" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.error }}
                  >
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {filterOptions.subjects.map((subject) => {
              const isSelected = selectedSubject === subject;
              return (
                <Pressable
                  key={subject}
                  onPress={() => {
                    onSubjectChange(subject);
                    onChaptersChange([]); // Reset chapters when subject changes
                  }}
                  className="px-5 py-3 rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.backgroundSecondary,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  <View className="flex-row items-center">
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      className="font-bold"
                      style={{
                        color: isSelected
                          ? "#FFFFFF"
                          : isDark
                          ? colors.gray100
                          : colors.gray900,
                      }}
                    >
                      {subject}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {filterOptions.subjects.length === 0 && (
            <View
              className="p-4 rounded-xl"
              style={{ backgroundColor: colors.backgroundSecondary }}
            >
              <Text style={{ color: colors.gray500 }}>
                No subjects available for this class
              </Text>
            </View>
          )}
        </View>

        {/* Chapter Selection - Elegant List */}
        {selectedSubject && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-lg font-bold"
                style={{ color: isDark ? colors.gray100 : colors.gray900 }}
              >
                📖 Chapters
              </Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.primary }}
                  >
                    {selectedChapters.length} selected
                  </Text>
                </View>
                <Pressable
                  onPress={selectAllChaptersForSubject}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: colors.gray700 + "20" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.gray700 }}
                  >
                    {filterOptions.chapters.every((ch) =>
                      selectedChapters.includes(ch)
                    )
                      ? "Deselect All"
                      : "Select All"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="gap-3">
              {filterOptions.chapters.map((chapter) => {
                const isSelected = selectedChapters.includes(chapter);
                return (
                  <Pressable
                    key={chapter}
                    onPress={() => toggleChapter(chapter)}
                    className="flex-row items-center p-4 rounded-2xl shadow-sm"
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    {/* Checkbox - Elegant design */}
                    <View
                      className="w-7 h-7 rounded-lg items-center justify-center mr-3"
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

                    {/* Chapter Text */}
                    <Text
                      className="flex-1 font-medium text-base"
                      style={{
                        color: isDark ? colors.gray100 : colors.gray900,
                      }}
                    >
                      {chapter}
                    </Text>

                    {/* Check Icon */}
                    {isSelected && (
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {filterOptions.chapters.length === 0 && (
              <View
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.backgroundSecondary }}
              >
                <Text style={{ color: colors.gray500 }}>
                  No chapters available for {selectedSubject}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Info Message */}
        {!selectedSubject && (
          <View
            className="flex-row items-start p-4 rounded-xl"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8, marginTop: 2 }}
            />
            <Text className="flex-1 text-sm" style={{ color: colors.primary }}>
              Please select a subject to view available chapters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button - Elegant Design */}
      <View className="absolute bottom-0 left-0 right-0 p-4">
        <Pressable
          onPress={onNext}
          disabled={!canProceed}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: colors.background }}
        >
          <LinearGradient
            colors={
              canProceed
                ? [colors.primary, colors.primaryDark]
                : [colors.gray400, colors.gray400]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 16,
            }}
          />
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-base mr-2">
              Continue to Questions
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </Pressable>
        {!canProceed && (
          <Text
            className="text-xs text-center mt-2"
            style={{ color: colors.gray500 }}
          >
            Select subject and at least one chapter
          </Text>
        )}
      </View>
    </View>
  );
}
