import { CheckCircle, PlusCircle } from "lucide-react-native";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ElegantDropdown } from "./ElegantDropdown";

interface Student {
  _id?: string;
  name: string;
  email?: string;
  classLevel?: string;
  batch?: string;
}

interface SingleEntryFormProps {
  // Dropdown options
  batchOptions: string[];
  classOptions: string[];
  studentOptions: Student[];
  subjects: string[];

  // Selected values
  selectedBatch: string;
  selectedClass: string;
  selectedStudent: string;
  subject: string;
  marks: string;
  outOf: string;
  remarks: string;
  testDate: string;

  // Callbacks
  onBatchChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onStudentChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onMarksChange: (value: string) => void;
  onOutOfChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  onTestDateChange: (value: string) => void;
  onSubmit: () => void;

  // State
  submitting: boolean;
}

export function SingleEntryForm({
  batchOptions,
  classOptions,
  studentOptions,
  subjects,
  selectedBatch,
  selectedClass,
  selectedStudent,
  subject,
  marks,
  outOf,
  remarks,
  testDate,
  onBatchChange,
  onClassChange,
  onStudentChange,
  onSubjectChange,
  onMarksChange,
  onOutOfChange,
  onRemarksChange,
  onTestDateChange,
  onSubmit,
  submitting,
}: SingleEntryFormProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 shadow-md border border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center gap-2 mb-5">
        <PlusCircle size={20} color="#10b981" strokeWidth={2.5} />
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Add New Result
        </Text>
      </View>

      <View className="space-y-4">
        {/* Batch Selector */}
        <ElegantDropdown
          label="Batch"
          value={selectedBatch}
          options={["", ...batchOptions]}
          onSelect={onBatchChange}
          placeholder="All Batches"
        />

        {/* Class Selector */}
        <ElegantDropdown
          label="Class"
          value={selectedClass}
          options={classOptions}
          onSelect={onClassChange}
          placeholder="Select Class"
          required
        />

        {/* Student Selector */}
        <ElegantDropdown
          label="Student"
          value={selectedStudent}
          options={studentOptions.map((student) => student.name)}
          onSelect={onStudentChange}
          placeholder="Select Student"
          required
        />

        {/* Subject */}
        <ElegantDropdown
          label="Subject"
          value={subject}
          options={subjects}
          onSelect={onSubjectChange}
          placeholder="Select Subject"
          required
        />

        {/* Marks and Out Of */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marks <Text className="text-emerald-500">*</Text>
            </Text>
            <TextInput
              value={marks}
              onChangeText={onMarksChange}
              keyboardType="numeric"
              placeholder="e.g., 85"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-medium"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Out Of <Text className="text-emerald-500">*</Text>
            </Text>
            <TextInput
              value={outOf}
              onChangeText={onOutOfChange}
              keyboardType="numeric"
              placeholder="e.g., 100"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-medium"
            />
          </View>
        </View>

        {/* Remarks */}
        <View>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Remarks
          </Text>
          <TextInput
            value={remarks}
            onChangeText={onRemarksChange}
            placeholder="Optional remarks"
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100"
          />
        </View>

        {/* Test Date */}
        <View>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Date <Text className="text-emerald-500">*</Text>
          </Text>
          <TextInput
            value={testDate}
            onChangeText={onTestDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={onSubmit}
          disabled={submitting}
          className={`py-4 rounded-xl mt-2 ${
            submitting
              ? "bg-gray-400"
              : "bg-emerald-500 dark:bg-emerald-600 shadow-lg shadow-emerald-500/50"
          }`}
        >
          <View className="flex-row items-center justify-center gap-2">
            {!submitting && (
              <CheckCircle size={18} color="white" strokeWidth={2.5} />
            )}
            <Text className="text-white text-center font-bold text-base">
              {submitting ? "Submitting..." : "Submit Result"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
