import type { OfflineResult } from "@/lib/services/results.service";
import { ClipboardList, Search } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ElegantDropdown } from "./ElegantDropdown";
import { ResultCard } from "./ResultCard";

interface Student {
  _id?: string;
  name: string;
  email?: string;
  classLevel?: string;
  batch?: string;
}

type SortOption =
  | "date-desc"
  | "date-asc"
  | "marks-desc"
  | "marks-asc"
  | "subject";

interface ViewResultsSectionProps {
  students: Student[];
  viewClass: string;
  viewStudent: string;
  viewedResults: OfflineResult[];
  sortBy: SortOption;
  viewLoading: boolean;
  onClassChange: (value: string) => void;
  onStudentChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onViewResults: () => void;
  onEditResult: (result: OfflineResult) => void;
  onDeleteResult: (result: OfflineResult) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Latest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "marks-desc", label: "Highest Marks" },
  { value: "marks-asc", label: "Lowest Marks" },
  { value: "subject", label: "Subject A-Z" },
];

export function ViewResultsSection({
  students,
  viewClass,
  viewStudent,
  viewedResults,
  sortBy,
  viewLoading,
  onClassChange,
  onStudentChange,
  onSortChange,
  onViewResults,
  onEditResult,
  onDeleteResult,
}: ViewResultsSectionProps) {
  // Get unique classes
  const classOptions = [
    ...new Set(students.map((s) => s.classLevel).filter(Boolean)),
  ] as string[];

  // Get students filtered by class
  const filteredStudents = students.filter((s) => s.classLevel === viewClass);

  // Sort results
  const getSortedResults = () => {
    const sorted = [...viewedResults];
    switch (sortBy) {
      case "date-desc":
        return sorted.sort(
          (a, b) =>
            new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
        );
      case "date-asc":
        return sorted.sort(
          (a, b) =>
            new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
        );
      case "marks-desc":
        return sorted.sort((a, b) => b.marks - a.marks);
      case "marks-asc":
        return sorted.sort((a, b) => a.marks - b.marks);
      case "subject":
        return sorted.sort((a, b) => a.subject.localeCompare(b.subject));
      default:
        return sorted;
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center gap-2 mb-5">
        <ClipboardList size={20} color="#2563eb" strokeWidth={2.5} />
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
          View Student Results
        </Text>
      </View>

      <View className="space-y-4">
        {/* Class Selector */}
        <ElegantDropdown
          label="Select Class"
          value={viewClass}
          options={classOptions}
          onSelect={onClassChange}
          placeholder="Choose a class"
        />

        {/* Student Selector */}
        {viewClass && (
          <ElegantDropdown
            label="Select Student"
            value={viewStudent}
            options={filteredStudents.map((student) => student.name)}
            onSelect={onStudentChange}
            placeholder="Choose a student"
          />
        )}

        {/* Sort Options */}
        {viewedResults.length > 0 && (
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-2"
            >
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => onSortChange(option.value)}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    sortBy === option.value
                      ? "bg-blue-500 dark:bg-blue-600"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      sortBy === option.value
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* View Results Button */}
        <Pressable
          onPress={onViewResults}
          disabled={viewLoading || !viewClass || !viewStudent}
          className={`py-4 rounded-xl ${
            viewLoading || !viewClass || !viewStudent
              ? "bg-gray-400"
              : "bg-blue-500 dark:bg-blue-600 shadow-lg shadow-blue-500/50"
          }`}
        >
          <View className="flex-row items-center justify-center gap-2">
            {!viewLoading && (
              <Search size={18} color="white" strokeWidth={2.5} />
            )}
            <Text className="text-white text-center font-bold text-base">
              {viewLoading ? "Loading..." : "View Results"}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Results Display */}
      {viewedResults.length > 0 && (
        <View className="mt-5 space-y-3">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Found {viewedResults.length} Result
            {viewedResults.length !== 1 ? "s" : ""}
          </Text>
          {getSortedResults().map((result, idx) => (
            <ResultCard
              key={result._id}
              result={result}
              index={idx}
              onEdit={() => onEditResult(result)}
              onDelete={() => onDeleteResult(result)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
