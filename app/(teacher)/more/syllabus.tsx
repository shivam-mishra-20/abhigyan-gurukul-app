import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
  secondary: "#10b981",
  background: "#f9fafb",
  card: "#ffffff",
  text: "#1f2937",
  textLight: "#6b7280",
  border: "#e5e7eb",
  error: "#ef4444",
  success: "#10b981",
};

// Professional dropdown options
// Constants removed - using dynamic metadata

interface SyllabusTopic {
  _id?: string;
  name: string;
  completed: boolean;
  completedDate?: string;
}

interface SyllabusChapter {
  _id?: string;
  name: string;
  order: number;
  topics: SyllabusTopic[];
}

interface Syllabus {
  _id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  classLevel: string;
  batch?: string;
  academicYear: string;
  chapters: SyllabusChapter[];
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SyllabusManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    classLevel: "11",
    batch: "",
    academicYear: new Date().getFullYear().toString(),
    chapters: [] as SyllabusChapter[],
  });
  const [newChapter, setNewChapter] = useState({ name: "" });
  const [newTopic, setNewTopic] = useState({ name: "", chapterIndex: -1 });

  // Dropdown visibility states
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Progress editing states
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [manualProgress, setManualProgress] = useState("");
  const [editingProgressSyllabus, setEditingProgressSyllabus] =
    useState<Syllabus | null>(null);

  // Detail view modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSyllabus, setDetailSyllabus] = useState<Syllabus | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);

  // Dynamic metadata from database
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Generate academic years dynamically (current previous year to next 3 years)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 1 + i).toString(),
  );

  const fetchSyllabi = useCallback(async () => {
    try {
      const data = await apiFetch("/api/syllabus");
      // Normalize data: handle backward compatibility with old 'items' field
      const normalized = Array.isArray(data)
        ? data.map((s: any) => ({
            ...s,
            chapters: (s.chapters || s.items || []).map((ch: any) => ({
              ...ch,
              topics: ch.topics || [],
            })),
          }))
        : [];
      setSyllabi(normalized);
    } catch (error) {
      console.error("Error fetching syllabi:", error);
      Alert.alert("Error", "Failed to load syllabi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  interface SyllabusMetadata {
    subjects: string[];
    classes: string[];
    batches: string[];
  }
  // ...
  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const metadata = (await apiFetch(
        "/api/syllabus/metadata",
      )) as SyllabusMetadata;
      if (metadata) {
        setAvailableSubjects(metadata.subjects || []);
        setAvailableClasses(metadata.classes || []);
        setAvailableBatches(metadata.batches || []);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      // Fallback defaults
      setAvailableSubjects([
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "Hindi",
        "Computer Science",
        "Economics",
      ]);
      setAvailableClasses(["11", "12"]);
      setAvailableBatches(["A", "B"]);
    } finally {
      setLoadingMetadata(false);
    }
  };

  useEffect(() => {
    fetchSyllabi();
    fetchMetadata();
  }, [fetchSyllabi]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSyllabi();
    fetchMetadata();
  };

  const handleCreateSyllabus = async () => {
    if (!formData.subject || !formData.classLevel || !formData.academicYear) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (formData.chapters.length === 0) {
      Alert.alert("Error", "Please add at least one chapter");
      return;
    }
    if (formData.chapters.some((ch) => ch.topics.length === 0)) {
      Alert.alert("Error", "Each chapter must have at least one topic");
      return;
    }
    try {
      await apiFetch("/api/syllabus", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      Alert.alert("Success", "Syllabus created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchSyllabi();
      fetchMetadata();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create syllabus");
    }
  };

  const handleUpdateSyllabus = async () => {
    if (!editingSyllabus) return;
    try {
      await apiFetch(`/api/syllabus/${editingSyllabus._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      Alert.alert("Success", "Syllabus updated successfully");
      setShowEditModal(false);
      setEditingSyllabus(null);
      resetForm();
      fetchSyllabi();
      fetchMetadata();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update syllabus");
    }
  };

  // Progress calculation helper
  function getTotalAndCompletedTopics(chapters: SyllabusChapter[]) {
    let total = 0;
    let completed = 0;
    chapters.forEach((ch) => {
      total += ch.topics.length;
      completed += ch.topics.filter((t) => t.completed).length;
    });
    return { total, completed };
  }

  const openProgressEditor = (syllabus: Syllabus) => {
    setEditingProgressSyllabus(syllabus);
    setManualProgress(syllabus.progressPercentage.toString());
    setShowProgressModal(true);
  };

  // Open detail modal to view and manage topics
  const openDetailModal = (syllabus: Syllabus) => {
    setDetailSyllabus(JSON.parse(JSON.stringify(syllabus))); // Deep copy
    setShowDetailModal(true);
  };

  // Toggle topic completion in detail view
  const toggleTopicCompletion = (chapterIndex: number, topicIndex: number) => {
    if (!detailSyllabus) return;
    const updatedChapters = [...detailSyllabus.chapters];
    const topic = updatedChapters[chapterIndex].topics[topicIndex];
    topic.completed = !topic.completed;
    topic.completedDate = topic.completed
      ? new Date().toISOString()
      : undefined;

    // Recalculate progress
    const { total, completed } = getTotalAndCompletedTopics(updatedChapters);
    const progressPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    setDetailSyllabus({
      ...detailSyllabus,
      chapters: updatedChapters,
      completedTopics: completed,
      progressPercentage,
    });
  };

  // Save progress from detail modal
  const saveDetailProgress = async () => {
    if (!detailSyllabus) return;
    setSavingProgress(true);
    try {
      await apiFetch(`/api/syllabus/${detailSyllabus._id}`, {
        method: "PUT",
        body: JSON.stringify({
          subject: detailSyllabus.subject,
          classLevel: detailSyllabus.classLevel,
          batch: detailSyllabus.batch,
          academicYear: detailSyllabus.academicYear,
          chapters: detailSyllabus.chapters,
        }),
      });
      Alert.alert("Success", "Progress saved successfully");
      setShowDetailModal(false);
      setDetailSyllabus(null);
      fetchSyllabi();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleManualProgressUpdate = async () => {
    if (!editingProgressSyllabus) return;
    const progress = parseInt(manualProgress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      Alert.alert("Error", "Please enter a valid progress percentage (0-100)");
      return;
    }
    try {
      // Calculate how many topics should be marked as completed based on percentage
      const { total: totalTopics } = getTotalAndCompletedTopics(
        editingProgressSyllabus.chapters,
      );
      let targetCompleted = 0;
      if (progress === 100) {
        targetCompleted = totalTopics;
      } else {
        targetCompleted = Math.floor((progress / 100) * totalTopics);
      }
      // Update topics to match the target
      let completedCount = 0;
      const updatedChapters = editingProgressSyllabus.chapters.map((ch) => {
        const updatedTopics = ch.topics.map((topic) => {
          if (completedCount < targetCompleted) {
            completedCount++;
            return {
              ...topic,
              completed: true,
              completedDate: new Date().toISOString(),
            };
          } else {
            return { ...topic, completed: false, completedDate: undefined };
          }
        });
        return { ...ch, topics: updatedTopics };
      });
      await apiFetch(`/api/syllabus/${editingProgressSyllabus._id}`, {
        method: "PUT",
        body: JSON.stringify({
          subject: editingProgressSyllabus.subject,
          classLevel: editingProgressSyllabus.classLevel,
          batch: editingProgressSyllabus.batch,
          academicYear: editingProgressSyllabus.academicYear,
          chapters: updatedChapters,
        }),
      });
      Alert.alert("Success", "Progress updated successfully");
      setShowProgressModal(false);
      setEditingProgressSyllabus(null);
      setManualProgress("");
      fetchSyllabi();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update progress");
    }
  };

  const handleDeleteSyllabus = (syllabusId: string) => {
    Alert.alert(
      "Delete Syllabus",
      "Are you sure you want to delete this syllabus?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/syllabus/${syllabusId}`, {
                method: "DELETE",
              });
              fetchSyllabi();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete syllabus",
              );
            }
          },
        },
      ],
    );
  };

  const openEditModal = (syllabus: Syllabus) => {
    setEditingSyllabus(syllabus);
    setFormData({
      subject: syllabus.subject,
      classLevel: syllabus.classLevel,
      batch: syllabus.batch || "",
      academicYear: syllabus.academicYear,
      chapters: syllabus.chapters,
    });
    setShowEditModal(true);
  };

  const addChapter = () => {
    if (!newChapter.name.trim()) {
      Alert.alert("Error", "Chapter name is required");
      return;
    }
    const chapter: SyllabusChapter = {
      name: newChapter.name,
      order: formData.chapters.length + 1,
      topics: [],
    };
    setFormData({ ...formData, chapters: [...formData.chapters, chapter] });
    setNewChapter({ name: "" });
  };

  const addTopic = (chapterIndex: number) => {
    if (!newTopic.name.trim()) {
      Alert.alert("Error", "Topic name is required");
      return;
    }
    const topic: SyllabusTopic = {
      name: newTopic.name,
      completed: false,
    };
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].topics.push(topic);
    setFormData({ ...formData, chapters: updatedChapters });
    setNewTopic({ name: "", chapterIndex: -1 });
  };

  const removeChapter = (index: number) => {
    const updatedChapters = formData.chapters.filter((_, i) => i !== index);
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const removeTopic = (chapterIndex: number, topicIndex: number) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].topics = updatedChapters[
      chapterIndex
    ].topics.filter((_, i) => i !== topicIndex);
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      classLevel: "11",
      batch: "",
      academicYear: new Date().getFullYear().toString(),
      chapters: [],
    });
    setNewTopic({ name: "", chapterIndex: -1 });
    setShowSubjectDropdown(false);
    setShowClassDropdown(false);
    setShowBatchDropdown(false);
    setShowYearDropdown(false);
    // Refresh metadata when form is reset
    fetchMetadata();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Syllabus Management</Text>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={THEME.primary} />
        </Pressable>
      </View>

      {/* Syllabi List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {syllabi.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={THEME.textLight} />
            <Text style={styles.emptyText}>No syllabi created yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first syllabus to get started
            </Text>
          </View>
        ) : (
          syllabi.map((syllabus) => (
            <Pressable
              key={syllabus._id}
              style={styles.syllabusCard}
              onPress={() => openDetailModal(syllabus)}
            >
              <View style={styles.syllabusHeader}>
                <View style={styles.syllabusInfo}>
                  <Text style={styles.syllabusSubject}>{syllabus.subject}</Text>
                  <Text style={styles.syllabusDetails}>
                    Class {syllabus.classLevel}{" "}
                    {syllabus.batch && `• ${syllabus.batch}`} •{" "}
                    {syllabus.academicYear}
                  </Text>
                </View>
                <View style={styles.syllabusActions}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      openEditModal(syllabus);
                    }}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={THEME.primary}
                    />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteSyllabus(syllabus._id);
                    }}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={THEME.error}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <View style={styles.progressPercentageBox}>
                    <Text style={styles.progressPercentageText}>
                      {syllabus.progressPercentage}%
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${syllabus.progressPercentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {syllabus.completedTopics}/{syllabus.totalTopics} topics
                  completed
                </Text>
              </View>

              {/* Chapter summary */}
              <View style={styles.chapterSummary}>
                <Text style={styles.chapterSummaryTitle}>
                  {syllabus.chapters.length} Chapter
                  {syllabus.chapters.length !== 1 ? "s" : ""}
                </Text>
                {syllabus.chapters.slice(0, 2).map((chapter, idx) => (
                  <View
                    key={chapter._id || idx}
                    style={styles.chapterPreviewItem}
                  >
                    <Ionicons
                      name="book-outline"
                      size={14}
                      color={THEME.textLight}
                    />
                    <Text style={styles.chapterPreviewText} numberOfLines={1}>
                      {chapter.name} (
                      {chapter.topics.filter((t) => t.completed).length}/
                      {chapter.topics.length})
                    </Text>
                  </View>
                ))}
                {syllabus.chapters.length > 2 && (
                  <Text style={styles.moreChapters}>
                    +{syllabus.chapters.length - 2} more chapter
                    {syllabus.chapters.length - 2 !== 1 ? "s" : ""}
                  </Text>
                )}
              </View>

              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>
                  Tap to view & mark topics
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={THEME.textLight}
                />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal || showEditModal}
        animationType="slide"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showEditModal ? "Edit" : "Create"} Syllabus
            </Text>
            <Pressable
              onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={THEME.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject *</Text>
              <Pressable
                style={styles.dropdown}
                onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                <Text
                  style={
                    formData.subject
                      ? styles.dropdownText
                      : styles.dropdownPlaceholder
                  }
                >
                  {formData.subject || "Select subject"}
                </Text>
                <Ionicons
                  name={showSubjectDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={THEME.textLight}
                />
              </Pressable>
              {showSubjectDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {availableSubjects.map((subject) => (
                      <Pressable
                        key={subject}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData({ ...formData, subject });
                          setShowSubjectDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{subject}</Text>
                        {formData.subject === subject && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={THEME.primary}
                          />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { marginBottom: 0 }]}>
                    Class *
                  </Text>
                  {availableClasses.length > 0 && (
                    <Text style={styles.dynamicHint}> (from students)</Text>
                  )}
                </View>
                <Pressable
                  style={styles.dropdown}
                  onPress={() => setShowClassDropdown(!showClassDropdown)}
                >
                  <Text
                    style={
                      formData.classLevel
                        ? styles.dropdownText
                        : styles.dropdownPlaceholder
                    }
                  >
                    {formData.classLevel || "Select class"}
                  </Text>
                  <Ionicons
                    name={showClassDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={THEME.textLight}
                  />
                </Pressable>
                {showClassDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      nestedScrollEnabled
                    >
                      {availableClasses.map((level) => (
                        <Pressable
                          key={level}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFormData({ ...formData, classLevel: level });
                            setShowClassDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{level}</Text>
                          {formData.classLevel === level && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color={THEME.primary}
                            />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { marginBottom: 0 }]}>Batch</Text>
                  <Text style={styles.dynamicHint}> (from students)</Text>
                </View>
                <Pressable
                  style={styles.dropdown}
                  onPress={() => setShowBatchDropdown(!showBatchDropdown)}
                >
                  <Text
                    style={
                      formData.batch
                        ? styles.dropdownText
                        : styles.dropdownPlaceholder
                    }
                  >
                    {formData.batch || "Optional"}
                  </Text>
                  <Ionicons
                    name={showBatchDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={THEME.textLight}
                  />
                </Pressable>
                {showBatchDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      nestedScrollEnabled
                    >
                      {loadingMetadata ? (
                        <View style={styles.dropdownItem}>
                          <ActivityIndicator
                            size="small"
                            color={THEME.primary}
                          />
                          <Text style={styles.dropdownItemText}>
                            Loading from students...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Pressable
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFormData({ ...formData, batch: "" });
                              setShowBatchDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>None</Text>
                            {!formData.batch && (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color={THEME.primary}
                              />
                            )}
                          </Pressable>
                          {availableBatches.map((batch) => (
                            <Pressable
                              key={batch}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setFormData({ ...formData, batch });
                                setShowBatchDropdown(false);
                              }}
                            >
                              <Text style={styles.dropdownItemText}>
                                {batch}
                              </Text>
                              {formData.batch === batch && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={THEME.primary}
                                />
                              )}
                            </Pressable>
                          ))}
                          <View style={styles.dropdownDivider} />
                          <Pressable
                            style={[
                              styles.dropdownItem,
                              styles.customBatchItem,
                            ]}
                            onPress={() => {
                              setShowBatchDropdown(false);
                              Alert.prompt(
                                "Custom Batch",
                                "Enter batch name:",
                                [
                                  { text: "Cancel", style: "cancel" },
                                  {
                                    text: "Add",
                                    onPress: (text?: string) => {
                                      if (text && text.trim()) {
                                        setFormData({
                                          ...formData,
                                          batch: text.trim(),
                                        });
                                        // Refresh metadata to include new one
                                        fetchMetadata();
                                      }
                                    },
                                  },
                                ],
                                "plain-text",
                                formData.batch,
                              );
                            }}
                          >
                            <Ionicons
                              name="add-circle"
                              size={20}
                              color={THEME.primary}
                            />
                            <Text
                              style={[
                                styles.dropdownItemText,
                                styles.customBatchText,
                              ]}
                            >
                              Add Custom Batch
                            </Text>
                          </Pressable>
                        </>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Academic Year *</Text>
              <Pressable
                style={styles.dropdown}
                onPress={() => setShowYearDropdown(!showYearDropdown)}
              >
                <Text
                  style={
                    formData.academicYear
                      ? styles.dropdownText
                      : styles.dropdownPlaceholder
                  }
                >
                  {formData.academicYear || "Select year"}
                </Text>
                <Ionicons
                  name={showYearDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={THEME.textLight}
                />
              </Pressable>
              {showYearDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {academicYears.map((year) => (
                      <Pressable
                        key={year}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData({ ...formData, academicYear: year });
                          setShowYearDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{year}</Text>
                        {formData.academicYear === year && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={THEME.primary}
                          />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Chapters</Text>

            {formData.chapters.map((chapter, cIdx) => (
              <View key={cIdx} style={styles.topicCard}>
                <View style={styles.topicCardHeader}>
                  <Text style={styles.topicCardTitle}>
                    Chapter {cIdx + 1}: {chapter.name}
                  </Text>
                  <Pressable onPress={() => removeChapter(cIdx)}>
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={THEME.error}
                    />
                  </Pressable>
                </View>
                <View style={{ marginLeft: 12 }}>
                  {chapter.topics.map((topic, tIdx) => (
                    <View
                      key={tIdx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: THEME.text }}>
                        • {topic.name}
                      </Text>
                      <Pressable onPress={() => removeTopic(cIdx, tIdx)}>
                        <Ionicons
                          name="close"
                          size={16}
                          color={THEME.error}
                          style={{ marginLeft: 8 }}
                        />
                      </Pressable>
                    </View>
                  ))}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      value={
                        newTopic.chapterIndex === cIdx ? newTopic.name : ""
                      }
                      onChangeText={(text) =>
                        setNewTopic({ name: text, chapterIndex: cIdx })
                      }
                      placeholder="Add Topic"
                    />
                    <Pressable
                      style={styles.addTopicButton}
                      onPress={() => addTopic(cIdx)}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.addTopicSection}>
              <TextInput
                style={styles.input}
                value={newChapter.name}
                onChangeText={(text) => setNewChapter({ name: text })}
                placeholder="Add Chapter"
              />
              <Pressable style={styles.addTopicButton} onPress={addChapter}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addTopicButtonText}>Add Chapter</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.saveButton}
              onPress={
                showEditModal ? handleUpdateSyllabus : handleCreateSyllabus
              }
            >
              <Text style={styles.saveButtonText}>
                {showEditModal ? "Update" : "Create"} Syllabus
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Detail View Modal - View and mark topics */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        onRequestClose={() => {
          setShowDetailModal(false);
          setDetailSyllabus(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                setShowDetailModal(false);
                setDetailSyllabus(null);
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={THEME.text} />
            </Pressable>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {detailSyllabus?.subject} - Class {detailSyllabus?.classLevel}
            </Text>
            <Pressable
              onPress={() =>
                detailSyllabus && openProgressEditor(detailSyllabus)
              }
              style={styles.iconButton}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={THEME.primary}
              />
            </Pressable>
          </View>

          {detailSyllabus && (
            <>
              {/* Progress Summary */}
              <View style={styles.detailProgressCard}>
                <View style={styles.detailProgressInfo}>
                  <Text style={styles.detailProgressLabel}>
                    Overall Progress
                  </Text>
                  <Text style={styles.detailProgressValue}>
                    {detailSyllabus.completedTopics}/
                    {detailSyllabus.totalTopics} topics
                  </Text>
                </View>
                <View style={styles.detailProgressCircle}>
                  <Text style={styles.detailProgressPercent}>
                    {detailSyllabus.progressPercentage}%
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.modalContent}>
                {detailSyllabus.chapters.map((chapter, cIdx) => {
                  const chapterCompleted = chapter.topics.filter(
                    (t) => t.completed,
                  ).length;
                  const chapterTotal = chapter.topics.length;
                  const chapterProgress =
                    chapterTotal > 0
                      ? Math.round((chapterCompleted / chapterTotal) * 100)
                      : 0;

                  return (
                    <View
                      key={chapter._id || cIdx}
                      style={styles.detailChapterCard}
                    >
                      <View style={styles.detailChapterHeader}>
                        <View style={styles.detailChapterInfo}>
                          <Text style={styles.detailChapterTitle}>
                            Chapter {chapter.order}: {chapter.name}
                          </Text>
                          <Text style={styles.detailChapterProgress}>
                            {chapterCompleted}/{chapterTotal} topics •{" "}
                            {chapterProgress}%
                          </Text>
                        </View>
                        {chapterProgress === 100 && (
                          <View style={styles.completeBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={THEME.success}
                            />
                          </View>
                        )}
                      </View>

                      <View style={styles.detailChapterProgressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${chapterProgress}%` },
                          ]}
                        />
                      </View>

                      <View style={styles.detailTopicsList}>
                        {chapter.topics.map((topic, tIdx) => (
                          <Pressable
                            key={topic._id || tIdx}
                            style={[
                              styles.detailTopicItem,
                              topic.completed &&
                                styles.detailTopicItemCompleted,
                            ]}
                            onPress={() => toggleTopicCompletion(cIdx, tIdx)}
                          >
                            <View
                              style={[
                                styles.topicCheckbox,
                                topic.completed && styles.topicCheckboxChecked,
                              ]}
                            >
                              {topic.completed && (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color="#fff"
                                />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.detailTopicText,
                                topic.completed &&
                                  styles.detailTopicTextCompleted,
                              ]}
                            >
                              {topic.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  );
                })}
                <View style={{ height: 100 }} />
              </ScrollView>

              {/* Save Button */}
              <View style={styles.detailFooter}>
                <Pressable
                  style={[
                    styles.saveButton,
                    savingProgress && styles.saveButtonDisabled,
                  ]}
                  onPress={saveDetailProgress}
                  disabled={savingProgress}
                >
                  {savingProgress ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Progress</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Progress Editor Modal */}
      <Modal
        visible={showProgressModal}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setShowProgressModal(false);
          setEditingProgressSyllabus(null);
          setManualProgress("");
        }}
      >
        <View style={styles.progressModalOverlay}>
          <View style={styles.progressModalContent}>
            <View style={styles.progressModalHeader}>
              <Text style={styles.progressModalTitle}>Edit Progress</Text>
              <Pressable
                onPress={() => {
                  setShowProgressModal(false);
                  setEditingProgressSyllabus(null);
                  setManualProgress("");
                }}
              >
                <Ionicons name="close" size={24} color={THEME.text} />
              </Pressable>
            </View>

            {editingProgressSyllabus && (
              <View style={styles.progressModalBody}>
                <Text style={styles.progressModalSubject}>
                  {editingProgressSyllabus.subject} - Class{" "}
                  {editingProgressSyllabus.classLevel}
                </Text>
                <Text style={styles.progressModalInfo}>
                  Current: {editingProgressSyllabus.completedTopics}/
                  {editingProgressSyllabus.totalTopics} topics (
                  {editingProgressSyllabus.progressPercentage}%)
                </Text>

                <View style={styles.progressInputContainer}>
                  <Text style={styles.label}>Set Progress Percentage *</Text>
                  <TextInput
                    style={styles.progressInput}
                    value={manualProgress}
                    onChangeText={setManualProgress}
                    placeholder="Enter 0-100"
                    keyboardType="numeric"
                  />
                  <Text style={styles.progressHint}>
                    Topics will be automatically marked as complete based on
                    this percentage
                  </Text>
                </View>

                <View style={styles.progressPreview}>
                  <Text style={styles.progressPreviewLabel}>Preview:</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(0, parseInt(manualProgress) || 0))}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPreviewText}>
                    {Math.round(
                      (Math.min(
                        100,
                        Math.max(0, parseInt(manualProgress) || 0),
                      ) /
                        100) *
                        editingProgressSyllabus.totalTopics,
                    )}{" "}
                    topics will be marked complete
                  </Text>
                </View>

                <View style={styles.progressModalActions}>
                  <Pressable
                    style={styles.progressCancelButton}
                    onPress={() => {
                      setShowProgressModal(false);
                      setEditingProgressSyllabus(null);
                      setManualProgress("");
                    }}
                  >
                    <Text style={styles.progressCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.progressSaveButton}
                    onPress={handleManualProgressUpdate}
                  >
                    <Text style={styles.progressSaveText}>Update Progress</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.textLight,
    marginTop: 8,
  },
  syllabusCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syllabusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  syllabusInfo: {
    flex: 1,
  },
  syllabusSubject: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
  },
  syllabusDetails: {
    fontSize: 14,
    color: THEME.textLight,
  },
  syllabusActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    flex: 1,
  },
  progressPercentageBox: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  progressPercentageText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  progressBar: {
    height: 8,
    backgroundColor: THEME.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
  },
  progressText: {
    fontSize: 12,
    color: THEME.textLight,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dynamicHint: {
    fontSize: 11,
    fontWeight: "400",
    color: THEME.success,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: THEME.card,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: THEME.card,
  },
  dropdownText: {
    fontSize: 14,
    color: THEME.text,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: THEME.textLight,
  },
  dropdownList: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: THEME.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: THEME.text,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 4,
  },
  customBatchItem: {
    backgroundColor: THEME.background,
    gap: 8,
  },
  customBatchText: {
    color: THEME.primary,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 16,
  },
  topicCard: {
    backgroundColor: THEME.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  topicCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicCardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.text,
    flex: 1,
  },
  topicCardDesc: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 4,
  },
  addTopicSection: {
    marginTop: 16,
    gap: 12,
  },
  addTopicButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  addTopicButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  modalFooter: {
    padding: 16,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  saveButton: {
    backgroundColor: THEME.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Progress Modal Styles
  progressModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  progressModalContent: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  progressModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  progressModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
  },
  progressModalBody: {
    padding: 20,
  },
  progressModalSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  progressModalInfo: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 20,
  },
  progressInputContainer: {
    marginBottom: 20,
  },
  progressInput: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: THEME.card,
  },
  progressHint: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 6,
    fontStyle: "italic",
  },
  progressPreview: {
    backgroundColor: THEME.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  progressPreviewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  progressPreviewText: {
    fontSize: 12,
    color: THEME.textLight,
  },
  progressModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  progressCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
  },
  progressCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  progressSaveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    alignItems: "center",
  },
  progressSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  // Chapter summary styles for list view
  chapterSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  chapterSummaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  chapterPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  chapterPreviewText: {
    fontSize: 13,
    color: THEME.textLight,
    flex: 1,
  },
  moreChapters: {
    fontSize: 12,
    color: THEME.textLight,
    fontStyle: "italic",
    marginTop: 4,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    gap: 4,
  },
  tapHintText: {
    fontSize: 12,
    color: THEME.textLight,
  },
  // Detail modal styles
  detailProgressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailProgressInfo: {
    flex: 1,
  },
  detailProgressLabel: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 4,
  },
  detailProgressValue: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
  },
  detailProgressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  detailProgressPercent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  detailChapterCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailChapterHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailChapterInfo: {
    flex: 1,
  },
  detailChapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
  },
  detailChapterProgress: {
    fontSize: 13,
    color: THEME.textLight,
  },
  completeBadge: {
    marginLeft: 8,
  },
  detailChapterProgressBar: {
    height: 6,
    backgroundColor: THEME.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  detailTopicsList: {
    gap: 8,
  },
  detailTopicItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: THEME.background,
    borderRadius: 8,
    gap: 12,
  },
  detailTopicItemCompleted: {
    backgroundColor: "#ecfdf5",
  },
  topicCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  topicCheckboxChecked: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  detailTopicText: {
    fontSize: 14,
    color: THEME.text,
    flex: 1,
  },
  detailTopicTextCompleted: {
    color: THEME.textLight,
    textDecorationLine: "line-through",
  },
  detailFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});
