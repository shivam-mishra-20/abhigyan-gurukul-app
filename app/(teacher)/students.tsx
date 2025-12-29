import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  classLevel?: string;
  batch?: string;
  groups?: string[];
}

export default function TeacherStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      // Use teacher endpoint which allows teachers to view students
      const res = (await apiFetch("/api/teacher/students")) as
        | { students?: Student[] }
        | Student[];

      if (Array.isArray(res)) {
        setStudents(res);
      } else if (res?.students) {
        setStudents(res.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || s.classLevel === filterClass;
    return matchesSearch && matchesClass;
  });

  const classes = [
    ...new Set(students.map((s) => s.classLevel).filter(Boolean)),
  ] as string[];

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
      <View
        className="pt-14 pb-6 px-6"
        style={{ backgroundColor: COLORS.teal }}
      >
        <Text className="text-white text-2xl font-bold">All Students</Text>
        <Text className="text-white/80 text-sm">
          {students.length} students enrolled
        </Text>
      </View>

      {/* Search & Filters */}
      <View className="px-5 py-4">
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-3 mb-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search students..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 py-3 px-2 text-gray-800"
          />
        </View>

        {classes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => setFilterClass("")}
              className={`px-3 py-1.5 rounded-full mr-2 ${
                !filterClass ? "bg-teal-500" : "bg-gray-100"
              }`}
            >
              <Text className={!filterClass ? "text-white" : "text-gray-600"}>
                All Classes
              </Text>
            </Pressable>
            {classes.sort().map((c) => (
              <Pressable
                key={c}
                onPress={() => setFilterClass(c === filterClass ? "" : c)}
                className={`px-3 py-1.5 rounded-full mr-2 ${
                  filterClass === c ? "bg-teal-500" : "bg-gray-100"
                }`}
              >
                <Text
                  className={filterClass === c ? "text-white" : "text-gray-600"}
                >
                  Class {c}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStudents();
            }}
            colors={[COLORS.teal]}
          />
        }
      >
        {filteredStudents.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">
              {searchTerm || filterClass
                ? "No students match"
                : "No students enrolled"}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <Pressable
              key={student._id}
              onPress={() =>
                router.push(
                  `/(teacher)/student-report?studentId=${student._id}`
                )
              }
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${COLORS.primary}20` }}
                >
                  <Text
                    style={{ color: COLORS.primary }}
                    className="font-bold text-lg"
                  >
                    {student.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base">
                    {student.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">{student.email}</Text>
                  <View className="flex-row items-center mt-1 flex-wrap gap-2">
                    {student.classLevel && (
                      <View className="bg-gray-100 px-2 py-0.5 rounded">
                        <Text className="text-gray-600 text-xs">
                          Class {student.classLevel}
                        </Text>
                      </View>
                    )}
                    {student.batch && (
                      <View className="bg-blue-100 px-2 py-0.5 rounded">
                        <Text className="text-blue-700 text-xs">
                          {student.batch}
                        </Text>
                      </View>
                    )}
                    {student.groups && student.groups.length > 0 && (
                      <Text className="text-gray-400 text-xs">
                        +{student.groups.length} groups
                      </Text>
                    )}
                  </View>
                </View>
                <View className="flex-row items-center">
                  {student.phone && (
                    <View className="bg-gray-100 p-2 rounded-full mr-2">
                      <Ionicons name="call" size={16} color="#6b7280" />
                    </View>
                  )}
                  <View className="bg-teal-100 p-2 rounded-full">
                    <Ionicons
                      name="stats-chart"
                      size={16}
                      color={COLORS.teal}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
