import { GRADIENTS, SHADOWS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Types
interface TestResult {
  _id?: string;
  testName: string;
  testDate: string;
  class: string;
  batch?: string;
  subject: string;
  maxMarks: number;
  studentResults: StudentResult[];
  createdBy?: string;
  createdAt?: string;
}

interface StudentResult {
  studentId: string;
  studentName: string;
  marksObtained: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

interface Student {
  _id: string;
  name: string;
  email?: string;
  classLevel?: string;
  batch?: string;
}

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Hindi",
  "Gujarati",
  "Social Science",
  "History",
  "Geography",
  "Political Science",
  "Economics",
  "Accounts",
  "BST",
  "OCM",
];

// Modern Action Card Component
const ActionCard = ({
  icon,
  title,
  description,
  colors,
  onPress,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: [string, string];
  onPress: () => void;
  badge?: number;
}) => (
  <Pressable onPress={onPress} style={styles.actionCard}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.actionCardGradient}
    >
      <View style={styles.actionCardContent}>
        <View style={styles.actionIconWrapper}>
          <Ionicons name={icon} size={28} color="white" />
          {badge !== undefined && badge > 0 && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionCardTitle}>{title}</Text>
          <Text style={styles.actionCardDesc}>{description}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color="rgba(255,255,255,0.7)"
        />
      </View>
    </LinearGradient>
  </Pressable>
);

// Stat Card Component
const StatCard = ({
  value,
  label,
  icon,
  color,
  isDark,
}: {
  value: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDark: boolean;
}) => (
  <View style={[styles.statCard, isDark && styles.statCardDark]}>
    <View style={[styles.statIconWrapper, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[styles.statValue, isDark && styles.statValueDark]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
      {label}
    </Text>
  </View>
);

// Test Card Component
const TestCard = ({
  test,
  onEdit,
  onView,
  onDelete,
  isDark,
}: {
  test: TestResult;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isDark: boolean;
}) => {
  const completedCount = test.studentResults.filter(
    (r) => r.marksObtained > 0,
  ).length;
  const totalCount = test.studentResults.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={[styles.testCard, isDark && styles.testCardDark]}>
      <View style={styles.testCardTop}>
        <View style={styles.testCardInfo}>
          <Text
            style={[styles.testCardTitle, isDark && styles.testCardTitleDark]}
          >
            {test.testName}
          </Text>
          <View style={styles.testCardMeta}>
            <View style={styles.testMetaItem}>
              <Ionicons
                name="school-outline"
                size={14}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text
                style={[styles.testMetaText, isDark && styles.testMetaTextDark]}
              >
                {test.class}
              </Text>
            </View>
            <View style={styles.testMetaDot} />
            <View style={styles.testMetaItem}>
              <Ionicons
                name="book-outline"
                size={14}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text
                style={[styles.testMetaText, isDark && styles.testMetaTextDark]}
              >
                {test.subject}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[styles.maxMarksBadge, isDark && styles.maxMarksBadgeDark]}
        >
          <Text
            style={[styles.maxMarksText, isDark && styles.maxMarksTextDark]}
          >
            {test.maxMarks}
          </Text>
          <Text
            style={[styles.maxMarksLabel, isDark && styles.maxMarksLabelDark]}
          >
            marks
          </Text>
        </View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: progress === 100 ? "#10B981" : "#4F46E5",
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
          {completedCount}/{totalCount} results entered
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.testCardActions}>
        <Pressable
          onPress={onEdit}
          style={[styles.testActionBtn, styles.testActionBtnPrimary]}
        >
          <Ionicons name="create-outline" size={18} color="white" />
          <Text style={styles.testActionBtnTextPrimary}>Enter Marks</Text>
        </Pressable>
        <Pressable
          onPress={onView}
          style={[
            styles.testActionBtn,
            styles.testActionBtnSecondary,
            isDark && styles.testActionBtnSecondaryDark,
          ]}
        >
          <Ionicons
            name="eye-outline"
            size={18}
            color={isDark ? "#A5B4FC" : "#4F46E5"}
          />
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={[styles.testActionBtn, styles.testActionBtnDanger]}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
};

export default function OfflineResultsNew() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [currentView, setCurrentView] = useState<
    "menu" | "create" | "enter" | "view"
  >("menu");

  // Common state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);

  // Dynamic options fetched from DB
  const [classes, setClasses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  // Create test state
  const [testName, setTestName] = useState("");
  const [testDate, setTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [maxMarks, setMaxMarks] = useState("");

  // Enter results state
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [resultsData, setResultsData] = useState<StudentResult[]>([]);

  // View results state
  const [viewTest, setViewTest] = useState<TestResult | null>(null);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
    loadTests();
  }, []);

  useEffect(() => {
    if (currentView === "create" && (selectedClass || selectedBatch)) {
      loadStudents(selectedClass || undefined, selectedBatch || undefined);
    }
  }, [selectedClass, selectedBatch, currentView]);

  useEffect(() => {
    if (selectedClass) {
      const classBatches = students
        .filter((s) => s.classLevel === selectedClass)
        .map((s) => s.batch)
        .filter(Boolean);
      setAvailableBatches([...new Set(classBatches)] as string[]);
    } else {
      setAvailableBatches(batches);
    }
  }, [selectedClass, students, batches]);

  const loadStudents = async (classFilter?: string, batchFilter?: string) => {
    try {
      const params = new URLSearchParams();
      if (classFilter) params.append("classLevel", classFilter);
      if (batchFilter) params.append("batch", batchFilter);
      params.append("status", "approved");

      const res = (await apiFetch(
        `/api/teacher/students?${params.toString()}`,
      )) as { students?: Student[] } | Student[];

      const studentList = Array.isArray(res) ? res : res?.students || [];
      setStudents(studentList);

      if (!classFilter && !batchFilter) {
        const uniqueClasses = [
          ...new Set(studentList.map((s) => s.classLevel).filter(Boolean)),
        ].sort() as string[];
        const uniqueBatches = [
          ...new Set(studentList.map((s) => s.batch).filter(Boolean)),
        ] as string[];
        setClasses(uniqueClasses);
        setBatches(uniqueBatches);
        setAvailableBatches(uniqueBatches);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = (await apiFetch(
        "/api/offline-results/tests",
      )) as TestResult[];
      setTests(response || []);
    } catch (error) {
      console.error("Failed to load tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStudents(), loadTests()]);
    setRefreshing(false);
  }, []);

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const handleCreateTest = async () => {
    if (
      !testName ||
      !selectedClass ||
      !selectedSubject ||
      !maxMarks ||
      parseFloat(maxMarks) <= 0
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill all required fields to create a test.",
      );
      return;
    }

    try {
      setLoading(true);
      const classStudents = students.filter(
        (s) =>
          s.classLevel === selectedClass &&
          (!selectedBatch || s.batch === selectedBatch),
      );

      const testData = {
        testName,
        testDate: testDate.toISOString().split("T")[0],
        class: selectedClass,
        batch: selectedBatch || undefined,
        subject: selectedSubject,
        maxMarks: parseFloat(maxMarks),
        studentResults: classStudents.map((s) => ({
          studentId: s._id,
          studentName: s.name,
          marksObtained: 0,
          percentage: 0,
          grade: "F",
          remarks: "",
        })),
      };

      await apiFetch("/api/offline-results/tests", {
        method: "POST",
        body: JSON.stringify(testData),
      });

      Alert.alert(
        "Success",
        "Test created successfully! You can now enter student marks.",
      );
      await loadTests();
      navigateToMenu();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterResults = async () => {
    if (!selectedTest) return;

    const incomplete = resultsData.filter((r) => r.marksObtained === 0);
    if (incomplete.length > 0) {
      Alert.alert(
        "Incomplete Results",
        `${incomplete.length} student(s) have 0 marks. Do you want to continue?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save Anyway", onPress: () => submitResults() },
        ],
      );
      return;
    }

    await submitResults();
  };

  const submitResults = async () => {
    if (!selectedTest) return;

    try {
      setLoading(true);
      await apiFetch(`/api/offline-results/tests/${selectedTest._id}/results`, {
        method: "PUT",
        body: JSON.stringify({ studentResults: resultsData }),
      });

      Alert.alert("Success", "Results saved successfully!");
      await loadTests();
      navigateToMenu();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save results");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = (test: TestResult) => {
    Alert.alert(
      "Delete Test",
      `Are you sure you want to delete "${test.testName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/offline-results/tests/${test._id}`, {
                method: "DELETE",
              });
              Alert.alert("Deleted", "Test has been deleted successfully.");
              await loadTests();
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Failed to delete test");
            }
          },
        },
      ],
    );
  };

  const resetCreateForm = () => {
    setTestName("");
    setTestDate(new Date());
    setSelectedClass("");
    setSelectedBatch("");
    setSelectedSubject("");
    setMaxMarks("");
    setDropdownOpen(null);
  };

  const navigateToMenu = () => {
    resetCreateForm();
    setSelectedTest(null);
    setResultsData([]);
    setViewTest(null);
    setDropdownOpen(null);
    setCurrentView("menu");
    loadStudents();
  };

  const handleSelectTest = (test: TestResult) => {
    setSelectedTest(test);
    setResultsData(
      test.studentResults.map((r) => ({
        ...r,
        marksObtained: r.marksObtained || 0,
      })),
    );
    setCurrentView("enter");
  };

  const updateMarks = (index: number, marks: string) => {
    const marksNum = parseFloat(marks) || 0;
    const maxM = selectedTest?.maxMarks || 100;
    if (marksNum > maxM) {
      Alert.alert("Invalid Marks", `Marks cannot exceed maximum (${maxM})`);
      return;
    }

    const percentage = (marksNum / maxM) * 100;
    const grade = calculateGrade(percentage);

    const updated = [...resultsData];
    updated[index] = {
      ...updated[index],
      marksObtained: marksNum,
      percentage: parseFloat(percentage.toFixed(2)),
      grade,
    };
    setResultsData(updated);
  };

  // Dropdown Component
  const Dropdown = ({
    label,
    value,
    options,
    onSelect,
    placeholder,
    required = true,
  }: any) => {
    const id = `dropdown-${label}`;
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Pressable
          onPress={() => setDropdownOpen(dropdownOpen === id ? null : id)}
          style={[styles.selectButton, isDark && styles.selectButtonDark]}
        >
          <Text
            style={
              value
                ? [styles.selectText, isDark && styles.selectTextDark]
                : styles.selectPlaceholder
            }
          >
            {value || placeholder}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </Pressable>

        <Modal
          visible={dropdownOpen === id}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownOpen(null)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDropdownOpen(null)}
          >
            <View
              style={[styles.dropdownModal, isDark && styles.dropdownModalDark]}
            >
              <View
                style={[
                  styles.dropdownHeader,
                  isDark && styles.dropdownHeaderDark,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownTitle,
                    isDark && styles.dropdownTitleDark,
                  ]}
                >
                  Select {label}
                </Text>
                <Pressable
                  onPress={() => setDropdownOpen(null)}
                  style={styles.closeBtn}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </Pressable>
              </View>
              <ScrollView
                style={styles.dropdownScroll}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option: string) => (
                  <Pressable
                    key={option || "empty"}
                    onPress={() => {
                      onSelect(option);
                      setDropdownOpen(null);
                    }}
                    style={[
                      styles.dropdownOption,
                      value === option && styles.dropdownOptionSelected,
                      isDark && styles.dropdownOptionDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        value === option && styles.dropdownOptionTextSelected,
                        isDark &&
                          value !== option &&
                          styles.dropdownOptionTextDark,
                      ]}
                    >
                      {option || "All (Optional)"}
                    </Text>
                    {value === option && (
                      <Ionicons name="checkmark" size={20} color="#4F46E5" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  };

  // Header Component
  const renderHeader = () => (
    <LinearGradient
      colors={GRADIENTS.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() =>
              currentView === "menu" ? router.back() : navigateToMenu()
            }
            style={styles.headerBackBtn}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {currentView === "menu" && "Offline Results"}
              {currentView === "create" && "New Test"}
              {currentView === "enter" && "Enter Marks"}
              {currentView === "view" && "View Results"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentView === "menu" && "Manage institute test results"}
              {currentView === "create" && "Create a new test for your class"}
              {currentView === "enter" &&
                (selectedTest ? selectedTest.testName : "Select a test")}
              {currentView === "view" &&
                (viewTest ? viewTest.testName : "Select a test")}
            </Text>
          </View>
          {currentView === "menu" && (
            <Pressable onPress={onRefresh} style={styles.headerRefreshBtn}>
              <Ionicons name="refresh" size={20} color="white" />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // Menu View
  const renderMenu = () => (
    <View style={styles.menuWrapper}>
      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Quick Actions
        </Text>
      </View>

      <ActionCard
        icon="add-circle-outline"
        title="Create New Test"
        description="Set up a new test with class and subject"
        colors={["#4F46E5", "#7C3AED"]}
        onPress={() => {
          resetCreateForm();
          setCurrentView("create");
        }}
      />

      <ActionCard
        icon="create-outline"
        title="Enter Results"
        description="Add marks for existing tests"
        colors={["#10B981", "#059669"]}
        onPress={() => {
          setSelectedTest(null);
          setResultsData([]);
          setCurrentView("enter");
        }}
        badge={
          tests.filter((t) =>
            t.studentResults.some((r) => r.marksObtained === 0),
          ).length
        }
      />

      <ActionCard
        icon="bar-chart-outline"
        title="View Analytics"
        description="See detailed test performance"
        colors={["#F59E0B", "#D97706"]}
        onPress={() => {
          setViewTest(null);
          setCurrentView("view");
        }}
      />

      {/* Recent Tests */}
      {tests.length > 0 && (
        <>
          <View style={[styles.sectionHeader, { marginTop: 28 }]}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Recent Tests
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                isDark && styles.sectionSubtitleDark,
              ]}
            >
              {tests.length} test{tests.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {tests.slice(0, 5).map((test) => (
            <TestCard
              key={test._id}
              test={test}
              onEdit={() => handleSelectTest(test)}
              onView={() => {
                setViewTest(test);
                setCurrentView("view");
              }}
              onDelete={() => handleDeleteTest(test)}
              isDark={isDark}
            />
          ))}
        </>
      )}

      {tests.length === 0 && !loading && (
        <View style={styles.emptyCard}>
          <View
            style={[
              styles.emptyIconWrapper,
              isDark && styles.emptyIconWrapperDark,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={48}
              color={isDark ? "#4B5563" : "#9CA3AF"}
            />
          </View>
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            No Tests Yet
          </Text>
          <Text style={[styles.emptyDesc, isDark && styles.emptyDescDark]}>
            Create your first test to start managing offline results
          </Text>
        </View>
      )}
    </View>
  );

  // Create Test View
  const renderCreateTest = () => (
    <View style={styles.formWrapper}>
      <View style={[styles.formCard, isDark && styles.formCardDark]}>
        <View style={styles.formHeader}>
          <View style={styles.formIconWrapper}>
            <Ionicons name="document-text" size={24} color="#4F46E5" />
          </View>
          <Text style={[styles.formTitle, isDark && styles.formTitleDark]}>
            Test Details
          </Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>
            Test Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={testName}
            onChangeText={setTestName}
            placeholder="e.g., Unit Test 1, Mid-term Exam"
            placeholderTextColor="#9CA3AF"
            style={[styles.textInput, isDark && styles.textInputDark]}
          />
        </View>

        <Dropdown
          label="Class"
          value={selectedClass}
          options={classes}
          onSelect={(value: string) => {
            setSelectedClass(value);
            setSelectedBatch("");
          }}
          placeholder="Select Class"
        />

        <Dropdown
          label="Batch"
          value={selectedBatch}
          options={["", ...availableBatches]}
          onSelect={setSelectedBatch}
          placeholder="All Batches"
          required={false}
        />

        <Dropdown
          label="Subject"
          value={selectedSubject}
          options={SUBJECTS}
          onSelect={setSelectedSubject}
          placeholder="Select Subject"
        />

        <View style={styles.fieldRow}>
          <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>
              Maximum Marks <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={maxMarks}
              onChangeText={setMaxMarks}
              placeholder="100"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              style={[styles.textInput, isDark && styles.textInputDark]}
            />
          </View>

          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>
              Test Date <Text style={styles.required}>*</Text>
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.datePickerBtn, isDark && styles.datePickerBtnDark]}
            >
              <Ionicons name="calendar-outline" size={20} color="#4F46E5" />
              <Text
                style={[
                  styles.datePickerText,
                  isDark && styles.datePickerTextDark,
                ]}
              >
                {testDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={testDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setTestDate(date);
                }}
              />
            )}
          </View>
        </View>

        {/* Student count info */}
        {selectedClass && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <Ionicons name="people" size={20} color="#4F46E5" />
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {
                students.filter(
                  (s) =>
                    s.classLevel === selectedClass &&
                    (!selectedBatch || s.batch === selectedBatch),
                ).length
              }{" "}
              students will be added to this test
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleCreateTest}
          disabled={loading}
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Create Test</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );

  // Enter Results View
  const renderEnterResults = () => {
    if (!selectedTest && tests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconWrapper,
              isDark && styles.emptyIconWrapperDark,
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={56}
              color={isDark ? "#4B5563" : "#9CA3AF"}
            />
          </View>
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            No Tests Available
          </Text>
          <Text style={[styles.emptyDesc, isDark && styles.emptyDescDark]}>
            Create a test first to enter results
          </Text>
          <Pressable
            onPress={() => {
              resetCreateForm();
              setCurrentView("create");
            }}
            style={styles.emptyButton}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.emptyButtonText}>Create Test</Text>
          </Pressable>
        </View>
      );
    }

    if (!selectedTest) {
      return (
        <View style={styles.testListWrapper}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Select a Test
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                isDark && styles.sectionSubtitleDark,
              ]}
            >
              {tests.length} available
            </Text>
          </View>
          {tests.map((test) => (
            <Pressable
              key={test._id}
              onPress={() => handleSelectTest(test)}
              style={[
                styles.testSelectCard,
                isDark && styles.testSelectCardDark,
              ]}
            >
              <View style={styles.testSelectInfo}>
                <Text
                  style={[
                    styles.testSelectTitle,
                    isDark && styles.testSelectTitleDark,
                  ]}
                >
                  {test.testName}
                </Text>
                <Text
                  style={[
                    styles.testSelectMeta,
                    isDark && styles.testSelectMetaDark,
                  ]}
                >
                  {test.class} • {test.subject} • Max: {test.maxMarks}
                </Text>
              </View>
              <View style={styles.testSelectRight}>
                <View
                  style={[
                    styles.testSelectBadge,
                    test.studentResults.every((r) => r.marksObtained > 0)
                      ? styles.testSelectBadgeComplete
                      : styles.testSelectBadgePending,
                  ]}
                >
                  <Text style={styles.testSelectBadgeText}>
                    {
                      test.studentResults.filter((r) => r.marksObtained > 0)
                        .length
                    }
                    /{test.studentResults.length}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#6B7280" : "#9CA3AF"}
                />
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <FlatList
          data={resultsData}
          keyExtractor={(item, index) => `${item.studentId}-${index}`}
          contentContainerStyle={styles.resultsListContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View
              style={[styles.enterHeader, isDark && styles.enterHeaderDark]}
            >
              <View style={styles.enterHeaderTop}>
                <View>
                  <Text
                    style={[
                      styles.enterHeaderTitle,
                      isDark && styles.enterHeaderTitleDark,
                    ]}
                  >
                    {selectedTest.testName}
                  </Text>
                  <Text
                    style={[
                      styles.enterHeaderMeta,
                      isDark && styles.enterHeaderMetaDark,
                    ]}
                  >
                    {selectedTest.class} • {selectedTest.subject}
                  </Text>
                </View>
                <View style={styles.enterHeaderRight}>
                  <View
                    style={[
                      styles.maxMarksPill,
                      isDark && styles.maxMarksPillDark,
                    ]}
                  >
                    <Text style={styles.maxMarksPillText}>
                      Max: {selectedTest.maxMarks}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedTest(null)}
                    style={[
                      styles.changeTestBtn,
                      isDark && styles.changeTestBtnDark,
                    ]}
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={16}
                      color={isDark ? "#A5B4FC" : "#4F46E5"}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.enterProgress}>
                <Text
                  style={[
                    styles.enterProgressText,
                    isDark && styles.enterProgressTextDark,
                  ]}
                >
                  Progress:{" "}
                  {resultsData.filter((r) => r.marksObtained > 0).length} of{" "}
                  {resultsData.length} completed
                </Text>
                <View style={styles.enterProgressBar}>
                  <View
                    style={[
                      styles.enterProgressFill,
                      {
                        width: `${resultsData.length > 0 ? (resultsData.filter((r) => r.marksObtained > 0).length / resultsData.length) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          }
          renderItem={({ item: result, index }) => (
            <View style={[styles.studentRow, isDark && styles.studentRowDark]}>
              <View style={styles.studentRowLeft}>
                <View
                  style={[
                    styles.studentAvatar,
                    { backgroundColor: `hsl(${(index * 40) % 360}, 70%, 80%)` },
                  ]}
                >
                  <Text style={styles.studentAvatarText}>
                    {result.studentName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text
                    style={[
                      styles.studentName,
                      isDark && styles.studentNameDark,
                    ]}
                    numberOfLines={1}
                  >
                    {result.studentName}
                  </Text>
                  {result.marksObtained > 0 && (
                    <View style={styles.studentGradeRow}>
                      <View
                        style={[
                          styles.gradeChip,
                          result.percentage >= 40
                            ? styles.gradeChipPass
                            : styles.gradeChipFail,
                        ]}
                      >
                        <Text style={styles.gradeChipText}>{result.grade}</Text>
                      </View>
                      <Text
                        style={[
                          styles.percentageLabel,
                          isDark && styles.percentageLabelDark,
                        ]}
                      >
                        {result.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TextInput
                value={
                  result.marksObtained > 0
                    ? result.marksObtained.toString()
                    : ""
                }
                onChangeText={(text) => updateMarks(index, text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.marksInput,
                  isDark && styles.marksInputDark,
                  result.marksObtained > 0 && styles.marksInputFilled,
                ]}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>
          )}
          ListFooterComponent={
            <Pressable
              onPress={handleEnterResults}
              disabled={loading}
              style={[
                styles.primaryButton,
                styles.saveResultsBtn,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Save All Results</Text>
                </>
              )}
            </Pressable>
          }
        />
      </KeyboardAvoidingView>
    );
  };

  // View Results
  const renderViewResults = () => {
    if (!viewTest && tests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconWrapper,
              isDark && styles.emptyIconWrapperDark,
            ]}
          >
            <Ionicons
              name="bar-chart-outline"
              size={56}
              color={isDark ? "#4B5563" : "#9CA3AF"}
            />
          </View>
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            No Results Available
          </Text>
          <Text style={[styles.emptyDesc, isDark && styles.emptyDescDark]}>
            Create a test and enter results first
          </Text>
        </View>
      );
    }

    if (!viewTest) {
      return (
        <View style={styles.testListWrapper}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Select a Test
            </Text>
          </View>
          {tests.map((test) => (
            <Pressable
              key={test._id}
              onPress={() => setViewTest(test)}
              style={[
                styles.testSelectCard,
                isDark && styles.testSelectCardDark,
              ]}
            >
              <View style={styles.testSelectInfo}>
                <Text
                  style={[
                    styles.testSelectTitle,
                    isDark && styles.testSelectTitleDark,
                  ]}
                >
                  {test.testName}
                </Text>
                <Text
                  style={[
                    styles.testSelectMeta,
                    isDark && styles.testSelectMetaDark,
                  ]}
                >
                  {test.class} • {test.subject}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#6B7280" : "#9CA3AF"}
              />
            </Pressable>
          ))}
        </View>
      );
    }

    const sortedResults = [...viewTest.studentResults].sort(
      (a, b) => b.marksObtained - a.marksObtained,
    );
    const totalStudents = sortedResults.length;
    const avgMarks =
      totalStudents > 0
        ? sortedResults.reduce((acc, r) => acc + r.marksObtained, 0) /
          totalStudents
        : 0;
    const passCount = sortedResults.filter((r) => r.percentage >= 40).length;
    const topScore = sortedResults[0]?.marksObtained || 0;

    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.viewResultsContent}
      >
        {/* Test Info Header */}
        <View
          style={[
            styles.viewResultsHeader,
            isDark && styles.viewResultsHeaderDark,
          ]}
        >
          <View style={styles.viewResultsHeaderTop}>
            <View>
              <Text
                style={[
                  styles.viewResultsTitle,
                  isDark && styles.viewResultsTitleDark,
                ]}
              >
                {viewTest.testName}
              </Text>
              <Text
                style={[
                  styles.viewResultsMeta,
                  isDark && styles.viewResultsMetaDark,
                ]}
              >
                {viewTest.class} • {viewTest.subject} • {viewTest.testDate}
              </Text>
            </View>
            <Pressable
              onPress={() => setViewTest(null)}
              style={[styles.backToListBtn, isDark && styles.backToListBtnDark]}
            >
              <Ionicons
                name="list"
                size={18}
                color={isDark ? "#A5B4FC" : "#4F46E5"}
              />
            </Pressable>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              value={totalStudents}
              label="Students"
              icon="people"
              color="#4F46E5"
              isDark={isDark}
            />
            <StatCard
              value={avgMarks.toFixed(1)}
              label="Avg Marks"
              icon="stats-chart"
              color="#10B981"
              isDark={isDark}
            />
            <StatCard
              value={`${totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(0) : 0}%`}
              label="Pass Rate"
              icon="checkmark-circle"
              color="#F59E0B"
              isDark={isDark}
            />
            <StatCard
              value={topScore}
              label="Top Score"
              icon="trophy"
              color="#EC4899"
              isDark={isDark}
            />
          </View>
        </View>

        {/* Results List */}
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Student Rankings
          </Text>
        </View>

        {sortedResults.map((result, index) => (
          <View
            key={`${result.studentId}-${index}`}
            style={[styles.rankCard, isDark && styles.rankCardDark]}
          >
            <View
              style={[
                styles.rankBadge,
                index === 0
                  ? styles.rankBadgeGold
                  : index === 1
                    ? styles.rankBadgeSilver
                    : index === 2
                      ? styles.rankBadgeBronze
                      : styles.rankBadgeDefault,
              ]}
            >
              <Text style={styles.rankBadgeText}>#{index + 1}</Text>
            </View>
            <View style={styles.rankInfo}>
              <Text style={[styles.rankName, isDark && styles.rankNameDark]}>
                {result.studentName}
              </Text>
              <View style={styles.rankStats}>
                <Text
                  style={[styles.rankMarks, isDark && styles.rankMarksDark]}
                >
                  {result.marksObtained}/{viewTest.maxMarks}
                </Text>
                <View
                  style={[
                    styles.rankGradeBadge,
                    result.percentage >= 90
                      ? styles.rankGradeA
                      : result.percentage >= 70
                        ? styles.rankGradeB
                        : result.percentage >= 40
                          ? styles.rankGradeC
                          : styles.rankGradeF,
                  ]}
                >
                  <Text style={styles.rankGradeText}>{result.grade}</Text>
                </View>
                <Text
                  style={[
                    styles.rankPercentage,
                    { color: result.percentage >= 40 ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {result.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  if (loading && tests.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, isDark && styles.containerDark]}
        edges={["top"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Loading tests...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {renderHeader()}
      {currentView === "enter" ? (
        <View style={styles.contentArea}>{renderEnterResults()}</View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4F46E5"]}
              tintColor="#4F46E5"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {currentView === "menu" && renderMenu()}
          {currentView === "create" && renderCreateTest()}
          {currentView === "view" && renderViewResults()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  containerDark: {
    backgroundColor: "#0F172A",
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  loadingTextDark: {
    color: "#94A3B8",
  },

  // Header
  header: {
    paddingBottom: 20,
  },
  headerSafe: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  headerRefreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  scrollContent: {
    paddingBottom: 32,
  },
  contentArea: {
    flex: 1,
  },

  // Menu
  menuWrapper: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionTitleDark: {
    color: "#F1F5F9",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  sectionSubtitleDark: {
    color: "#94A3B8",
  },

  // Action Cards
  actionCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  actionCardGradient: {
    padding: 18,
  },
  actionCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
    marginBottom: 3,
  },
  actionCardDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },

  // Test Cards
  testCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  testCardDark: {
    backgroundColor: "#1E293B",
  },
  testCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  testCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  testCardTitleDark: {
    color: "#F1F5F9",
  },
  testCardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  testMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  testMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  testMetaText: {
    fontSize: 13,
    color: "#64748B",
  },
  testMetaTextDark: {
    color: "#94A3B8",
  },
  maxMarksBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  maxMarksBadgeDark: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  maxMarksText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
  },
  maxMarksTextDark: {
    color: "#A5B4FC",
  },
  maxMarksLabel: {
    fontSize: 10,
    color: "#6366F1",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  maxMarksLabelDark: {
    color: "#A5B4FC",
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  progressTextDark: {
    color: "#94A3B8",
  },
  testCardActions: {
    flexDirection: "row",
    gap: 8,
  },
  testActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  testActionBtnPrimary: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  testActionBtnTextPrimary: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  testActionBtnSecondary: {
    backgroundColor: "#EEF2FF",
  },
  testActionBtnSecondaryDark: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  testActionBtnDanger: {
    backgroundColor: "#FEF2F2",
  },

  // Empty States
  emptyCard: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIconWrapperDark: {
    backgroundColor: "#1E293B",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: "#F1F5F9",
  },
  emptyDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyDescDark: {
    color: "#94A3B8",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  // Form Styles
  formWrapper: {
    padding: 16,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.md,
  },
  formCardDark: {
    backgroundColor: "#1E293B",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  formIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  formTitleDark: {
    color: "#F1F5F9",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  fieldLabelDark: {
    color: "#CBD5E1",
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  textInputDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    color: "#F1F5F9",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectButtonDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  selectText: {
    fontSize: 15,
    color: "#1E293B",
  },
  selectTextDark: {
    color: "#F1F5F9",
  },
  selectPlaceholder: {
    fontSize: 15,
    color: "#94A3B8",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerBtnDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  datePickerTextDark: {
    color: "#F1F5F9",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  infoCardDark: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#4338CA",
    fontWeight: "500",
  },
  infoTextDark: {
    color: "#A5B4FC",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
  },

  // Dropdown Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownModal: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 340,
    maxHeight: "70%",
    overflow: "hidden",
  },
  dropdownModalDark: {
    backgroundColor: "#1E293B",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dropdownHeaderDark: {
    borderBottomColor: "#334155",
  },
  dropdownTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  dropdownTitleDark: {
    color: "#F1F5F9",
  },
  closeBtn: {
    padding: 4,
  },
  dropdownScroll: {
    maxHeight: 320,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownOptionDark: {
    borderBottomColor: "#334155",
  },
  dropdownOptionSelected: {
    backgroundColor: "#EEF2FF",
  },
  dropdownOptionText: {
    fontSize: 15,
    color: "#475569",
  },
  dropdownOptionTextDark: {
    color: "#CBD5E1",
  },
  dropdownOptionTextSelected: {
    color: "#4F46E5",
    fontWeight: "600",
  },

  // Test List
  testListWrapper: {
    padding: 16,
  },
  testSelectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  testSelectCardDark: {
    backgroundColor: "#1E293B",
  },
  testSelectInfo: {
    flex: 1,
  },
  testSelectTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  testSelectTitleDark: {
    color: "#F1F5F9",
  },
  testSelectMeta: {
    fontSize: 13,
    color: "#64748B",
  },
  testSelectMetaDark: {
    color: "#94A3B8",
  },
  testSelectRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  testSelectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  testSelectBadgeComplete: {
    backgroundColor: "#D1FAE5",
  },
  testSelectBadgePending: {
    backgroundColor: "#FEF3C7",
  },
  testSelectBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },

  // Enter Results
  resultsListContent: {
    paddingBottom: 32,
  },
  enterHeader: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  enterHeaderDark: {
    backgroundColor: "#1E293B",
  },
  enterHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  enterHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  enterHeaderTitleDark: {
    color: "#F1F5F9",
  },
  enterHeaderMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },
  enterHeaderMetaDark: {
    color: "#94A3B8",
  },
  enterHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  maxMarksPill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  maxMarksPillDark: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  maxMarksPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },
  changeTestBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  changeTestBtnDark: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  enterProgress: {
    gap: 6,
  },
  enterProgressText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  enterProgressTextDark: {
    color: "#94A3B8",
  },
  enterProgressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  enterProgressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },

  // Student Rows
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    ...SHADOWS.sm,
  },
  studentRowDark: {
    backgroundColor: "#1E293B",
  },
  studentRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studentAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  studentNameDark: {
    color: "#F1F5F9",
  },
  studentGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  gradeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gradeChipPass: {
    backgroundColor: "#D1FAE5",
  },
  gradeChipFail: {
    backgroundColor: "#FEE2E2",
  },
  gradeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
  },
  percentageLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  percentageLabelDark: {
    color: "#94A3B8",
  },
  marksInput: {
    width: 72,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E293B",
  },
  marksInputDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    color: "#F1F5F9",
  },
  marksInputFilled: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  saveResultsBtn: {
    marginHorizontal: 16,
    marginTop: 16,
  },

  // View Results
  viewResultsContent: {
    paddingBottom: 32,
  },
  viewResultsHeader: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.md,
  },
  viewResultsHeaderDark: {
    backgroundColor: "#1E293B",
  },
  viewResultsHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  viewResultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  viewResultsTitleDark: {
    color: "#F1F5F9",
  },
  viewResultsMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  viewResultsMetaDark: {
    color: "#94A3B8",
  },
  backToListBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  backToListBtnDark: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: (SCREEN_WIDTH - 32 - 40 - 30) / 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  statCardDark: {
    backgroundColor: "#0F172A",
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  statValueDark: {
    color: "#F1F5F9",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  statLabelDark: {
    color: "#94A3B8",
  },

  // Rank Cards
  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    ...SHADOWS.sm,
  },
  rankCardDark: {
    backgroundColor: "#1E293B",
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rankBadgeGold: {
    backgroundColor: "#FEF3C7",
  },
  rankBadgeSilver: {
    backgroundColor: "#E2E8F0",
  },
  rankBadgeBronze: {
    backgroundColor: "#FFEDD5",
  },
  rankBadgeDefault: {
    backgroundColor: "#F1F5F9",
  },
  rankBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 5,
  },
  rankNameDark: {
    color: "#F1F5F9",
  },
  rankStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankMarks: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  rankMarksDark: {
    color: "#94A3B8",
  },
  rankGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rankGradeA: {
    backgroundColor: "#D1FAE5",
  },
  rankGradeB: {
    backgroundColor: "#DBEAFE",
  },
  rankGradeC: {
    backgroundColor: "#FEF3C7",
  },
  rankGradeF: {
    backgroundColor: "#FEE2E2",
  },
  rankGradeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
  },
  rankPercentage: {
    fontSize: 13,
    fontWeight: "700",
  },
});
