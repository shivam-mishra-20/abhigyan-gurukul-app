import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

const COLORS = {
  primary: "#5ab348",
  teal: "#0B7077",
};

interface BatchData {
  name: string;
  studentCount: number;
  examCount: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  classLevel?: string;
  batch?: string;
  phone?: string;
}

export default function TeacherBatches() {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBatches = useCallback(async () => {
    try {
      const res = await apiFetch("/api/teacher/batches") as { batches: BatchData[] };
      setBatches(res?.batches || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const fetchStudents = async (batch: string) => {
    setStudentsLoading(true);
    try {
      const res = await apiFetch(`/api/teacher/students?batch=${encodeURIComponent(batch)}`) as { students: Student[] };
      setStudents(res?.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleBatchClick = (batchName: string) => {
    if (selectedBatch === batchName) {
      setSelectedBatch(null);
      setStudents([]);
    } else {
      setSelectedBatch(batchName);
      fetchStudents(batchName);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = batches.reduce((acc, b) => acc + b.studentCount, 0);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-14 pb-6 px-6" style={{ backgroundColor: COLORS.teal }}>
        <Text className="text-white text-2xl font-bold">Batches</Text>
        <Text className="text-white/80 text-sm">
          {batches.length} batches • {totalStudents} students
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchBatches();
            }}
            colors={[COLORS.teal]}
          />
        }
      >
        {batches.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No batches assigned</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              Contact admin to get batch assignments
            </Text>
          </View>
        ) : (
          batches.map((batch) => (
            <View key={batch.name} className="mb-4">
              <Pressable
                onPress={() => handleBatchClick(batch.name)}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${
                  selectedBatch === batch.name
                    ? "border-teal-500"
                    : "border-gray-100"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                        selectedBatch === batch.name ? "bg-teal-500" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xl font-bold ${
                          selectedBatch === batch.name ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {batch.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-900 font-bold text-lg">
                        {batch.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {batch.studentCount} students • {batch.examCount} exams
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={selectedBatch === batch.name ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#9ca3af"
                  />
                </View>
              </Pressable>

              {selectedBatch === batch.name && (
                <View className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <View className="flex-row items-center mb-4">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                      placeholder="Search students..."
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      className="flex-1 ml-2 text-gray-800"
                    />
                  </View>

                  {studentsLoading ? (
                    <ActivityIndicator color={COLORS.teal} />
                  ) : filteredStudents.length === 0 ? (
                    <Text className="text-gray-500 text-center py-4">
                      {searchTerm ? "No students match" : "No students"}
                    </Text>
                  ) : (
                    filteredStudents.map((student) => (
                      <View
                        key={student._id}
                        className="flex-row items-center py-3 border-b border-gray-100"
                      >
                        <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                          <Text style={{ color: COLORS.primary }} className="font-bold">
                            {student.name.charAt(0)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-medium">
                            {student.name}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {student.email}
                          </Text>
                        </View>
                        {student.classLevel && (
                          <View className="bg-gray-100 px-2 py-1 rounded">
                            <Text className="text-gray-600 text-xs">
                              {student.classLevel}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
