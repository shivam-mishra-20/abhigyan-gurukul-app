/**
 * StudentSelector Component
 * Professional student selection interface with filtering
 */

import { getColors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface Student {
  _id: string;
  name: string;
  email: string;
  classLevel?: string;
  batch?: string;
}

interface StudentSelectorProps {
  selectedStudents: string[];
  onSelectionChange: (studentIds: string[]) => void;
  classFilter?: string;
  batchFilter?: string;
}

export default function StudentSelector({
  selectedStudents,
  onSelectionChange,
  classFilter,
  batchFilter,
}: StudentSelectorProps) {
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  // Use filter props directly
  const filterClass = classFilter;
  const filterBatch = batchFilter || selectedBatch;

  // Fetch available batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = (await apiFetch("/api/teacher/batches")) as {
          batches?: { name: string }[];
        };
        const batchNames = res?.batches?.map((b) => b.name) || [];
        setBatches(batchNames);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };
    fetchBatches();
  }, []);

  // Fetch students from users collection with role, batch, and classLevel filters
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        // Add classLevel filter if provided
        if (filterClass) params.append("classLevel", filterClass);
        // Add batch filter only if a specific batch is selected (empty = all batches)
        if (filterBatch) params.append("batch", filterBatch);

        const res = (await apiFetch(
          `/api/teacher/students?${params.toString()}`
        )) as { students?: Student[]; total?: number } | Student[];

        const studentList = Array.isArray(res) ? res : res?.students || [];
        console.log(`Fetched ${studentList.length} students with filters:`, {
          role: "student",
          classLevel: filterClass || "all",
          batch: filterBatch || "all",
        });
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [filterClass, filterBatch]);

  // Get unique classes and batches (for future use)
  useMemo(() => {
    const classSet = new Set<string>();
    const batchSet = new Set<string>();

    students.forEach((s) => {
      if (s.classLevel) classSet.add(s.classLevel);
      if (s.batch) batchSet.add(s.batch);
    });

    return {
      classes: Array.from(classSet).sort(),
      batches: Array.from(batchSet).sort(),
    };
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [students, searchTerm]);

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      onSelectionChange(selectedStudents.filter((id) => id !== studentId));
    } else {
      onSelectionChange([...selectedStudents, studentId]);
    }
  };

  // Select/Deselect all
  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
      setSelectAll(false);
    } else {
      onSelectionChange(filteredStudents.map((s) => s._id));
      setSelectAll(true);
    }
  };

  // Update selectAll state when selection changes
  useEffect(() => {
    const allSelected =
      filteredStudents.length > 0 &&
      filteredStudents.every((s) => selectedStudents.includes(s._id));
    setSelectAll(allSelected);
  }, [selectedStudents, filteredStudents]);

  if (loading) {
    return (
      <View className="items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-2 text-sm" style={{ color: colors.gray500 }}>
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search Bar */}
      <View className="mb-3">
        <View
          className="flex-row items-center px-4 py-3 rounded-xl border"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.gray400}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search students..."
            placeholderTextColor={colors.gray400}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, color: isDark ? colors.gray100 : colors.gray900 }}
          />
          {searchTerm ? (
            <Pressable onPress={() => setSearchTerm("")}>
              <Ionicons name="close-circle" size={20} color={colors.gray400} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Batch Filter - Only show if not filtered by prop */}
      {!batchFilter && batches.length > 0 && (
        <View className="mb-3">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.gray700 }}
          >
            Filter by Batch
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            <Pressable
              onPress={() => setSelectedBatch("")}
              className="px-4 py-2 rounded-xl"
              style={{
                backgroundColor: !selectedBatch
                  ? colors.primary
                  : colors.backgroundSecondary,
                borderWidth: 1,
                borderColor: !selectedBatch ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: !selectedBatch ? "#FFFFFF" : colors.gray600,
                }}
              >
                All Batches
              </Text>
            </Pressable>
            {batches.map((batch) => (
              <Pressable
                key={batch}
                onPress={() => setSelectedBatch(batch)}
                className="px-4 py-2 rounded-xl"
                style={{
                  backgroundColor:
                    selectedBatch === batch
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor:
                    selectedBatch === batch ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: selectedBatch === batch ? "#FFFFFF" : colors.gray600,
                  }}
                >
                  {batch}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Select All */}
      <View className="flex-row items-center justify-between mb-3 px-2">
        <Text className="text-sm font-medium" style={{ color: colors.gray500 }}>
          {selectedStudents.length} of {filteredStudents.length} selected
        </Text>
        <Pressable onPress={handleSelectAll} className="flex-row items-center">
          <Ionicons
            name={selectAll ? "checkbox" : "square-outline"}
            size={20}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text
            className="text-sm font-medium"
            style={{ color: colors.primary }}
          >
            Select All
          </Text>
        </Pressable>
      </View>

      {/* Student List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredStudents.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="person-outline" size={48} color={colors.gray400} />
            <Text className="mt-2 text-sm" style={{ color: colors.gray500 }}>
              No students found
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const isSelected = selectedStudents.includes(student._id);
            return (
              <Pressable
                key={student._id}
                onPress={() => toggleStudent(student._id)}
                className="flex-row items-center p-3 rounded-xl mb-2 border"
                style={{
                  backgroundColor: isSelected
                    ? colors.primaryBg
                    : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                {/* Checkbox */}
                <View className="mr-3">
                  <Ionicons
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={24}
                    color={isSelected ? colors.primary : colors.gray400}
                  />
                </View>

                {/* Avatar */}
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary + "30" }}
                >
                  <Text className="font-bold" style={{ color: colors.primary }}>
                    {student.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text
                    className="font-semibold mb-1"
                    style={{ color: isDark ? colors.gray100 : colors.gray900 }}
                  >
                    {student.name}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.gray500 }}>
                    {student.email}
                  </Text>
                  {(student.classLevel || student.batch) && (
                    <View className="flex-row gap-2 mt-1">
                      {student.classLevel && (
                        <View
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: colors.primaryBg }}
                        >
                          <Text
                            className="text-xs"
                            style={{ color: colors.primary }}
                          >
                            {student.classLevel}
                          </Text>
                        </View>
                      )}
                      {student.batch && (
                        <View
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: colors.successLight }}
                        >
                          <Text
                            className="text-xs"
                            style={{ color: colors.success }}
                          >
                            {student.batch}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
