import { useToast } from "@/lib/context";
import {
  resultsService,
  type BulkResultEntry,
  type OfflineResult,
} from "@/lib/services/results.service";
import { StudentsService } from "@/lib/services/students.service";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Award, Calendar, ChevronDown, ClipboardList, Eye, FileEdit, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

interface Student {
  _id?: string;
  name: string;
  email?: string;
  classLevel?: string;
  batch?: string;
}

const BATCH_OPTIONS = ["Lakshya", "Aadharshila", "Basic", "Commerce"];

const SUBJECTS = [
  "English",
  "Social Science",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Hindi",
  "Gujarati",
  "History",
  "Geography",
  "Political Science",
  "Economics",
  "Civics",
  "Accounts",
  "OCM",
  "BST",
];

type PageView = "menu" | "single" | "bulk" | "view";

export default function OfflineResults() {
  const toast = useToast();
  const [currentView, setCurrentView] = useState<PageView>("menu");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Single entry state
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [outOf, setOutOf] = useState("");
  const [remarks, setRemarks] = useState("");
  const [testDate, setTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk entry state
  const [bulkBatch, setBulkBatch] = useState("");
  const [bulkClass, setBulkClass] = useState("");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkOutOf, setBulkOutOf] = useState("");
  const [bulkResults, setBulkResults] = useState<BulkResultEntry[]>([]);
  const [bulkTestDate, setBulkTestDate] = useState(new Date());
  const [showBulkDatePicker, setShowBulkDatePicker] = useState(false);

  // View results state
  const [viewClass, setViewClass] = useState("");
  const [viewStudent, setViewStudent] = useState("");
  const [viewedResults, setViewedResults] = useState<OfflineResult[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const fetchStudents = useCallback(
    async (classLevel?: string, batch?: string) => {
      try {
        setLoading(true);
        const data = await StudentsService.getAll({ classLevel, batch });
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch students when batch or class changes for SINGLE entry
  useEffect(() => {
    if (currentView === "single" && (selectedBatch || selectedClass)) {
      fetchStudents(selectedClass || undefined, selectedBatch || undefined);
    }
  }, [selectedBatch, selectedClass, currentView, fetchStudents]);

  // Fetch students when batch or class changes for BULK entry
  useEffect(() => {
    if (currentView === "bulk" && (bulkBatch || bulkClass)) {
      fetchStudents(bulkClass || undefined, bulkBatch || undefined);
    }
  }, [bulkBatch, bulkClass, currentView, fetchStudents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (currentView === "single") {
      await fetchStudents(selectedClass || undefined, selectedBatch || undefined);
    } else if (currentView === "bulk") {
      await fetchStudents(bulkClass || undefined, bulkBatch || undefined);
    } else {
      await fetchStudents();
    }
    setRefreshing(false);
  }, [fetchStudents, selectedClass, selectedBatch, bulkClass, bulkBatch, currentView]);

  const filteredStudentsForSingle = useCallback(() => {
    return students.filter((s) => {
      const batchMatch = !selectedBatch || s.batch === selectedBatch;
      const classMatch = !selectedClass || s.classLevel === selectedClass;
      return batchMatch && classMatch;
    });
  }, [students, selectedBatch, selectedClass]);

  const filteredStudentsForBulk = useCallback(() => {
    return students.filter((s) => {
      const batchMatch = !bulkBatch || s.batch === bulkBatch;
      const classMatch = !bulkClass || s.classLevel === bulkClass;
      return batchMatch && classMatch;
    });
  }, [students, bulkBatch, bulkClass]);

  const filteredClassesForSingle = useCallback(() => {
    const filtered = selectedBatch
      ? students.filter((s) => s.batch === selectedBatch)
      : students;
    return [
      ...new Set(filtered.map((s) => s.classLevel).filter(Boolean)),
    ] as string[];
  }, [students, selectedBatch]);

  const filteredClassesForBulk = useCallback(() => {
    const filtered = bulkBatch
      ? students.filter((s) => s.batch === bulkBatch)
      : students;
    return [
      ...new Set(filtered.map((s) => s.classLevel).filter(Boolean)),
    ] as string[];
  }, [students, bulkBatch]);

  useEffect(() => {
    if (currentView === "bulk" && bulkClass) {
      const studentsInClass = filteredStudentsForBulk();
      setBulkResults(
        studentsInClass.map((s) => ({
          name: s.name,
          class: s.classLevel || "",
          batch: s.batch || bulkBatch,
          subject: bulkSubject,
          marks: "",
          outOf: bulkOutOf,
          remarks: "",
          testDate: formatDateToYYYYMMDD(bulkTestDate),
        }))
      );
    }
  }, [currentView, bulkClass, bulkBatch, filteredStudentsForBulk, bulkSubject, bulkOutOf, bulkTestDate]);

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setTestDate(selectedDate);
    }
  };

  const handleBulkDateChange = (event: any, selectedDate?: Date) => {
    setShowBulkDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBulkTestDate(selectedDate);
    }
  };

  const handleSubmitSingle = async () => {
    if (!selectedStudent || !selectedClass || !subject || !marks || !outOf) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await resultsService.addResult({
        name: selectedStudent,
        class: selectedClass,
        batch: selectedBatch || undefined,
        subject,
        marks: parseFloat(marks),
        outOf: parseFloat(outOf),
        remarks: remarks || undefined,
        testDate: formatDateToYYYYMMDD(testDate),
      });
      toast.success("Result added successfully!");
      setSelectedStudent("");
      setSubject("");
      setMarks("");
      setOutOf("");
      setRemarks("");
      setTestDate(new Date());
    } catch (error: any) {
      toast.error(error.message || "Failed to add result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBulk = async () => {
    if (!bulkClass || !bulkSubject || !bulkOutOf || bulkResults.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const incomplete = bulkResults.filter((r) => !r.marks);
    if (incomplete.length > 0) {
      toast.error("Please enter marks for all students");
      return;
    }

    setSubmitting(true);
    try {
      const entries: BulkResultEntry[] = bulkResults.map((r) => ({
        name: r.name,
        marks: typeof r.marks === "string" ? parseFloat(r.marks) : r.marks,
        outOf: parseFloat(bulkOutOf),
        remarks: r.remarks,
      }));

      await resultsService.addBulkResults({
        class: bulkClass,
        batch: bulkBatch || undefined,
        subject: bulkSubject,
        testDate: formatDateToYYYYMMDD(bulkTestDate),
        results: entries,
      });

      toast.success(`Successfully added ${entries.length} results!`);
      setBulkResults([]);
      setBulkSubject("");
      setBulkOutOf("");
      setBulkTestDate(new Date());
    } catch (error: any) {
      toast.error(error.message || "Failed to add bulk results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = async () => {
    if (!viewClass || !viewStudent) {
      toast.error("Please select class and student");
      return;
    }

    setViewLoading(true);
    try {
      const response = await resultsService.getStudentResults(viewStudent, viewClass);
      setViewedResults(response.data || []);
      if ((response.data || []).length === 0) {
        toast.info("No results found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load results");
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteResult = (result: OfflineResult) => {
    Alert.alert("Delete Result", "Are you sure you want to delete this result?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await resultsService.deleteResult(result._id!);
            toast.success("Result deleted successfully!");
            handleViewResults();
          } catch (error: any) {
            toast.error(error.message || "Failed to delete result");
          }
        },
      },
    ]);
  };

  const handleViewChange = (view: PageView) => {
    setCurrentView(view);
    if (view === "menu") {
      // Reset single entry
      setSelectedStudent("");
      setSelectedBatch("");
      setSelectedClass("");
      setSubject("");
      setMarks("");
      setOutOf("");
      setRemarks("");
      setTestDate(new Date());
      // Reset bulk entry
      setBulkBatch("");
      setBulkClass("");
      setBulkSubject("");
      setBulkOutOf("");
      setBulkResults([]);
      setBulkTestDate(new Date());
      // Reset view
      setViewClass("");
      setViewStudent("");
      setViewedResults([]);
    }
  };

  const SimpleDropdown = ({ label, value, options, onSelect, placeholder, required }: any) => {
    const id = `dropdown-${label}`;
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Pressable onPress={() => setDropdownOpen(dropdownOpen === id ? null : id)} style={styles.dropdown}>
          <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
            {value || placeholder}
          </Text>
          <ChevronDown size={20} color="#6b7280" />
        </Pressable>
        <Modal visible={dropdownOpen === id} transparent animationType="fade" onRequestClose={() => setDropdownOpen(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setDropdownOpen(null)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
              </View>
              <ScrollView>
                {options.map((option: string) => (
                  <Pressable key={option} onPress={() => { onSelect(option); setDropdownOpen(null); }}
                    style={[styles.modalOption, value === option && styles.modalOptionSelected]}>
                    <Text style={value === option ? styles.modalOptionTextSelected : styles.modalOptionText}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  };

  const DatePickerField = ({ label, value, onChange, showPicker, setShowPicker }: any) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
        <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Calendar size={20} color="#10b981" strokeWidth={2.5} />
          <Text style={styles.dateButtonText}>{formatDateToYYYYMMDD(value)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChange}
          />
        )}
      </View>
    );
  };

  if (loading && students.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Award size={28} color="white" strokeWidth={2.5} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Offline Results</Text>
              <Text style={styles.headerSubtitle}>
                {currentView === "menu" && "Select an action"}
                {currentView === "single" && "Single Entry Mode"}
                {currentView === "bulk" && "Bulk Entry Mode"}
                {currentView === "view" && "View Results"}
              </Text>
            </View>
            {currentView !== "menu" && (
              <Pressable onPress={() => handleViewChange("menu")} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Menu View */}
          {currentView === "menu" && (
            <View>
              <Text style={styles.sectionTitle}>Choose an Action</Text>
              <Pressable onPress={() => handleViewChange("single")} style={[styles.menuCard, styles.menuCardGreen]}>
                <View style={styles.menuCardContent}>
                  <View style={[styles.menuIcon, styles.menuIconGreen]}>
                    <FileEdit size={28} color="#10b981" strokeWidth={2.5} />
                  </View>
                  <View style={styles.menuCardText}>
                    <Text style={styles.menuCardTitle}>Single Entry</Text>
                    <Text style={styles.menuCardDescription}>Add result for one student at a time</Text>
                  </View>
                  <Text style={styles.menuArrow}>→</Text>
                </View>
              </Pressable>

              <Pressable onPress={() => handleViewChange("bulk")} style={[styles.menuCard, styles.menuCardBlue]}>
                <View style={styles.menuCardContent}>
                  <View style={[styles.menuIcon, styles.menuIconBlue]}>
                    <ClipboardList size={28} color="#3b82f6" strokeWidth={2.5} />
                  </View>
                  <View style={styles.menuCardText}>
                    <Text style={styles.menuCardTitle}>Bulk Entry</Text>
                    <Text style={styles.menuCardDescription}>Add results for entire class quickly</Text>
                  </View>
                  <Text style={styles.menuArrow}>→</Text>
                </View>
              </Pressable>

              <Pressable onPress={() => handleViewChange("view")} style={[styles.menuCard, styles.menuCardPurple]}>
                <View style={styles.menuCardContent}>
                  <View style={[styles.menuIcon, styles.menuIconPurple]}>
                    <Eye size={28} color="#9333ea" strokeWidth={2.5} />
                  </View>
                  <View style={styles.menuCardText}>
                    <Text style={styles.menuCardTitle}>View Results</Text>
                    <Text style={styles.menuCardDescription}>View and manage student results</Text>
                  </View>
                  <Text style={styles.menuArrow}>→</Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* Single Entry */}
          {currentView === "single" && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <FileEdit size={20} color="#10b981" strokeWidth={2.5} />
                <Text style={styles.formTitle}>Single Entry</Text>
              </View>
              
              <SimpleDropdown label="Batch" value={selectedBatch} options={["", ...BATCH_OPTIONS]} onSelect={setSelectedBatch} placeholder="All Batches" />
              <SimpleDropdown label="Class" value={selectedClass} options={filteredClassesForSingle()} onSelect={setSelectedClass} placeholder="Select Class" required />
              <SimpleDropdown label="Student" value={selectedStudent} options={filteredStudentsForSingle().map(s => s.name)} onSelect={setSelectedStudent} placeholder="Select Student" required />
              <SimpleDropdown label="Subject" value={subject} options={SUBJECTS} onSelect={setSubject} placeholder="Select Subject" required />
              
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Marks <Text style={styles.required}>*</Text></Text>
                <TextInput value={marks} onChangeText={setMarks} keyboardType="numeric" placeholder="e.g., 85" placeholderTextColor="#9ca3af" style={styles.input} />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Out Of <Text style={styles.required}>*</Text></Text>
                <TextInput value={outOf} onChangeText={setOutOf} keyboardType="numeric" placeholder="e.g., 100" placeholderTextColor="#9ca3af" style={styles.input} />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Remarks (Optional)</Text>
                <TextInput value={remarks} onChangeText={setRemarks} placeholder="Any comments" placeholderTextColor="#9ca3af" style={styles.input} />
              </View>
              
              <DatePickerField label="Test Date" value={testDate} onChange={handleDateChange} showPicker={showDatePicker} setShowPicker={setShowDatePicker} />
              
              <Pressable onPress={handleSubmitSingle} disabled={submitting} style={[styles.submitButton, submitting && styles.submitButtonDisabled]}>
                <Text style={styles.submitButtonText}>{submitting ? "Submitting..." : "Submit Result"}</Text>
              </Pressable>
            </View>
          )}

          {/* Bulk Entry */}
          {currentView === "bulk" && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <ClipboardList size={20} color="#10b981" strokeWidth={2.5} />
                <Text style={styles.formTitle}>Bulk Entry</Text>
              </View>
              
              <SimpleDropdown label="Batch" value={bulkBatch} options={["", ...BATCH_OPTIONS]} onSelect={setBulkBatch} placeholder="All Batches" />
              <SimpleDropdown label="Class" value={bulkClass} options={filteredClassesForBulk()} onSelect={setBulkClass} placeholder="Select Class" required />
              <SimpleDropdown label="Subject" value={bulkSubject} options={SUBJECTS} onSelect={setBulkSubject} placeholder="Select Subject" required />
              
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Out Of <Text style={styles.required}>*</Text></Text>
                <TextInput value={bulkOutOf} onChangeText={setBulkOutOf} keyboardType="numeric" placeholder="e.g., 100" placeholderTextColor="#9ca3af" style={styles.input} />
              </View>
              
              <DatePickerField label="Test Date" value={bulkTestDate} onChange={handleBulkDateChange} showPicker={showBulkDatePicker} setShowPicker={setShowBulkDatePicker} />
              
              {bulkResults.length > 0 && (
                <View style={styles.bulkTable}>
                  <Text style={styles.bulkTableTitle}>Enter Marks ({bulkResults.length} students)</Text>
                  <ScrollView style={styles.bulkScrollView} nestedScrollEnabled>
                    {bulkResults.map((result, idx) => (
                      <View key={`${result.name}-${idx}`} style={styles.bulkRow}>
                        <Text style={styles.bulkStudentName}>{result.name}</Text>
                        <TextInput value={result.marks?.toString() || ""} onChangeText={(val) => {
                          const updated = [...bulkResults];
                          updated[idx].marks = val;
                          setBulkResults(updated);
                        }} keyboardType="numeric" placeholder="Marks" placeholderTextColor="#9ca3af" style={styles.bulkMarksInput} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <Pressable onPress={handleSubmitBulk} disabled={submitting || bulkResults.length === 0} style={[styles.submitButton, (submitting || bulkResults.length === 0) && styles.submitButtonDisabled]}>
                <Text style={styles.submitButtonText}>{submitting ? "Submitting..." : `Submit All (${bulkResults.length})`}</Text>
              </Pressable>
            </View>
          )}

          {/* View Results */}
          {currentView === "view" && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Eye size={20} color="#2563eb" strokeWidth={2.5} />
                <Text style={styles.formTitle}>View Student Results</Text>
              </View>
              
              <SimpleDropdown label="Class" value={viewClass} options={[...new Set(students.map(s => s.classLevel).filter(Boolean))] as string[]} onSelect={setViewClass} placeholder="Select Class" required />
              {viewClass && (
                <SimpleDropdown label="Student" value={viewStudent} options={students.filter(s => s.classLevel === viewClass).map(s => s.name)} onSelect={setViewStudent} placeholder="Select Student" required />
              )}
              
              <Pressable onPress={handleViewResults} disabled={viewLoading || !viewClass || !viewStudent} style={[styles.viewButton, (viewLoading || !viewClass || !viewStudent) && styles.submitButtonDisabled]}>
                <Text style={styles.submitButtonText}>{viewLoading ? "Loading..." : "View Results"}</Text>
              </Pressable>
              
              {viewedResults.length > 0 && (
                <View style={styles.resultsContainer}>
                  <Text style={styles.resultsTitle}>Found {viewedResults.length} Result{viewedResults.length !== 1 ? "s" : ""}</Text>
                  {viewedResults.map((result) => (
                    <View key={result._id} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultSubject}>{result.subject}</Text>
                        <Text style={styles.resultScore}>{result.marks}/{result.outOf}</Text>
                      </View>
                      <Text style={styles.resultDate}>Date: {result.testDate}</Text>
                      {result.remarks && <Text style={styles.resultRemarks}>{result.remarks}</Text>}
                      <View style={styles.resultActions}>
                        <Pressable onPress={() => handleDeleteResult(result)} style={styles.deleteButton}>
                          <Trash2 size={16} color="#ef4444" />
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#6b7280', fontSize: 14 },
  header: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 24, backgroundColor: '#10b981' },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2 },
  backButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  backButtonText: { color: 'white', fontWeight: '600' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  menuCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 2 },
  menuCardGreen: { borderColor: '#d1fae5' },
  menuCardBlue: { borderColor: '#dbeafe' },
  menuCardPurple: { borderColor: '#e9d5ff' },
  menuCardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  menuIconGreen: { backgroundColor: '#d1fae5' },
  menuIconBlue: { backgroundColor: '#dbeafe' },
  menuIconPurple: { backgroundColor: '#e9d5ff' },
  menuCardText: { flex: 1 },
  menuCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  menuCardDescription: { fontSize: 14, color: '#6b7280' },
  menuArrow: { fontSize: 30, color: '#9ca3af' },
  formCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  required: { color: '#10b981' },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: '#1f2937' },
  dropdownPlaceholder: { fontSize: 16, color: '#9ca3af' },
  input: { backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1f2937' },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  dateButtonText: { fontSize: 16, color: '#1f2937', fontWeight: '600' },
  submitButton: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 12, marginTop: 8 },
  submitButtonDisabled: { backgroundColor: '#9ca3af' },
  submitButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  viewButton: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 16, margin: 16, maxHeight: 384, width: '80%' },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  modalOption: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalOptionSelected: { backgroundColor: '#d1fae5' },
  modalOptionText: { fontSize: 16, color: '#374151' },
  modalOptionTextSelected: { fontSize: 16, color: '#10b981', fontWeight: '600' },
  bulkTable: { marginTop: 16 },
  bulkTableTitle: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 },
  bulkScrollView: { maxHeight: 384 },
  bulkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  bulkStudentName: { flex: 1, color: '#1f2937', fontWeight: '600' },
  bulkMarksInput: { width: 80, backgroundColor: 'white', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#1f2937' },
  resultsContainer: { marginTop: 20 },
  resultsTitle: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 },
  resultCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resultSubject: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  resultScore: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  resultDate: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  resultRemarks: { fontSize: 14, color: '#374151', marginTop: 4, fontStyle: 'italic' },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fee2e2', borderRadius: 8 },
  deleteButtonText: { fontSize: 14, color: '#ef4444', fontWeight: '600' },
});
