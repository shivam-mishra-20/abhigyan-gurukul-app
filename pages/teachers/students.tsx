import { apiFetch } from "@/lib/api";
import { useRouter } from "expo-router";
import { BarChart3, Phone, Search, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Users size={28} color="white" strokeWidth={2.5} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Students</Text>
            <Text style={styles.headerSubtitle}>
              {students.length} students enrolled
            </Text>
          </View>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" strokeWidth={2} />
          <TextInput
            placeholder="Search students..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {classes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => setFilterClass("")}
              style={[
                styles.filterChip,
                !filterClass && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !filterClass && styles.filterChipTextActive,
                ]}
              >
                All Classes
              </Text>
            </Pressable>
            {classes.sort().map((c) => (
              <Pressable
                key={c}
                onPress={() => setFilterClass(c === filterClass ? "" : c)}
                style={[
                  styles.filterChip,
                  filterClass === c && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterClass === c && styles.filterChipTextActive,
                  ]}
                >
                  Class {c}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStudents();
            }}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
      >
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Users size={48} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchTerm || filterClass
                ? "No students match"
                : "No students enrolled"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchTerm || filterClass
                ? "Try adjusting your filters"
                : "Students will appear here once enrolled"}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <Pressable
              key={student._id}
              onPress={() =>
                router.push(
                  `/(teacher)/student-report?studentId=${student._id}` as any
                )
              }
              style={styles.studentCard}
            >
              <View style={styles.studentCardContent}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                  <View style={styles.studentTags}>
                    {student.classLevel && (
                      <View style={styles.studentTagGray}>
                        <Text style={styles.studentTagTextGray}>
                          Class {student.classLevel}
                        </Text>
                      </View>
                    )}
                    {student.batch && (
                      <View style={styles.studentTagBlue}>
                        <Text style={styles.studentTagTextBlue}>
                          {student.batch}
                        </Text>
                      </View>
                    )}
                    {student.groups && student.groups.length > 0 && (
                      <Text style={styles.studentGroupsText}>
                        +{student.groups.length} groups
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.studentActions}>
                  {student.phone && (
                    <View style={styles.actionButton}>
                      <Phone size={16} color="#6b7280" strokeWidth={2} />
                    </View>
                  )}
                  <View style={styles.actionButtonPrimary}>
                    <BarChart3 size={16} color="#10b981" strokeWidth={2} />
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: "#3b82f6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 2,
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterChipTextActive: {
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  studentCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studentAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  studentTags: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  studentTagGray: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  studentTagTextGray: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "500",
  },
  studentTagBlue: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  studentTagTextBlue: {
    fontSize: 11,
    color: "#1e40af",
    fontWeight: "500",
  },
  studentGroupsText: {
    fontSize: 11,
    color: "#9ca3af",
  },
  studentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPrimary: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
});
