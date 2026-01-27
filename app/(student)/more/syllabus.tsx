import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
  background: "#f9fafb",
  card: "#ffffff",
  text: "#1f2937",
  textLight: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
};

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

interface SyllabusItem {
  _id?: string;
  topic: string;
  description?: string;
  order: number;
  completed: boolean;
  completedDate?: string;
  estimatedHours?: number;
}

interface Syllabus {
  _id: string;
  teacherName: string;
  subject: string;
  classLevel: string;
  batch?: string;
  academicYear: string;
  chapters: SyllabusChapter[];
  items: SyllabusItem[]; // Legacy items support
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
}

interface UserData {
  classLevel?: string;
  batch?: string;
  board?: string;
}

export default function StudentSyllabus() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [expandedSyllabus, setExpandedSyllabus] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchSyllabi = useCallback(async () => {
    try {
      // Fetch user data first to get class and batch
      const user = (await apiFetch("/api/auth/me")) as UserData;
      setUserData(user);

      // Fetch all syllabi
      const data = await apiFetch("/api/syllabus");
      const allSyllabi = Array.isArray(data) ? data : [];

      // Normalize data structure (handle both 'items' and 'chapters')
      const normalized = allSyllabi.map((s: any) => ({
        ...s,
        chapters: s.chapters || [],
        items: s.items || [],
      }));

      // Use normalized data directly as backend handles filtering
      setSyllabi(normalized);
    } catch (error) {
      console.error("Error fetching syllabi:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSyllabi();
  }, [fetchSyllabi]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSyllabi();
  };

  const toggleExpand = (syllabusId: string) => {
    setExpandedSyllabus(expandedSyllabus === syllabusId ? null : syllabusId);
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
        <Text style={styles.headerTitle}>Syllabus Progress</Text>
        <View style={{ width: 24 }} />
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
            <Text style={styles.emptyText}>No syllabus available</Text>
            <Text style={styles.emptySubtext}>
              Your teachers haven&apos;t created any syllabus yet
            </Text>
          </View>
        ) : (
          syllabi.map((syllabus) => (
            <View key={syllabus._id} style={styles.syllabusCard}>
              <Pressable
                onPress={() => toggleExpand(syllabus._id)}
                style={styles.syllabusHeader}
              >
                <View style={styles.syllabusInfo}>
                  <Text style={styles.syllabusSubject}>{syllabus.subject}</Text>
                  <Text style={styles.syllabusTeacher}>
                    by {syllabus.teacherName}
                  </Text>
                  <Text style={styles.syllabusDetails}>
                    Class {syllabus.classLevel}{" "}
                    {syllabus.batch && `• ${syllabus.batch}`} •{" "}
                    {syllabus.academicYear}
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSyllabus === syllabus._id
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color={THEME.textLight}
                />
              </Pressable>

              <View style={styles.progressContainer}>
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
                  completed ({syllabus.progressPercentage}%)
                </Text>
              </View>

              {expandedSyllabus === syllabus._id && (
                <View style={styles.topicsList}>
                  {syllabus.chapters && syllabus.chapters.length > 0 ? (
                    syllabus.chapters.map((chapter, cIdx) => (
                      <View
                        key={chapter._id || cIdx}
                        style={styles.chapterSection}
                      >
                        <View style={styles.chapterHeader}>
                          <Text style={styles.chapterTitle}>
                            Ch {chapter.order}: {chapter.name}
                          </Text>
                          <Text style={styles.chapterProgress}>
                            {chapter.topics.filter((t) => t.completed).length}/
                            {chapter.topics.length}
                          </Text>
                        </View>
                        {chapter.topics.map((topic, tIdx) => (
                          <View
                            key={topic._id || tIdx}
                            style={styles.topicItem}
                          >
                            <Ionicons
                              name={
                                topic.completed
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={20}
                              color={
                                topic.completed
                                  ? THEME.success
                                  : THEME.textLight
                              }
                            />
                            <View style={styles.topicContent}>
                              <Text
                                style={[
                                  styles.topicText,
                                  topic.completed && styles.topicCompleted,
                                ]}
                              >
                                {topic.name}
                              </Text>
                              {topic.completed && topic.completedDate && (
                                <Text style={styles.completedDate}>
                                  ✓ Completed on{" "}
                                  {new Date(
                                    topic.completedDate,
                                  ).toLocaleDateString()}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    ))
                  ) : syllabus.items && syllabus.items.length > 0 ? (
                    <>
                      <Text style={styles.topicsTitle}>Topics:</Text>
                      {syllabus.items.map((item, index) => (
                        <View key={item._id || index} style={styles.topicItem}>
                          <Ionicons
                            name={
                              item.completed
                                ? "checkmark-circle"
                                : "ellipse-outline"
                            }
                            size={20}
                            color={
                              item.completed ? THEME.success : THEME.textLight
                            }
                          />
                          <View style={styles.topicContent}>
                            <Text
                              style={[
                                styles.topicText,
                                item.completed && styles.topicCompleted,
                              ]}
                            >
                              {item.topic}
                            </Text>
                            {item.description && (
                              <Text style={styles.topicDescription}>
                                {item.description}
                              </Text>
                            )}
                            {item.completed && item.completedDate && (
                              <Text style={styles.completedDate}>
                                ✓ Completed on{" "}
                                {new Date(
                                  item.completedDate,
                                ).toLocaleDateString()}
                              </Text>
                            )}
                            {item.estimatedHours && item.estimatedHours > 0 && (
                              <Text style={styles.estimatedHours}>
                                ⏱ {item.estimatedHours} hours
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </>
                  ) : null}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
    textAlign: "center",
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
  syllabusTeacher: {
    fontSize: 14,
    color: THEME.primary,
    marginBottom: 4,
  },
  syllabusDetails: {
    fontSize: 12,
    color: THEME.textLight,
  },
  progressContainer: {
    marginBottom: 12,
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
  topicsList: {
    gap: 12,
    marginTop: 8,
  },
  chapterSection: {
    marginBottom: 16,
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    flex: 1,
  },
  chapterProgress: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.primary,
    marginLeft: 8,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
  },
  topicItem: {
    flexDirection: "row",
    gap: 8,
  },
  topicContent: {
    flex: 1,
  },
  topicText: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: "500",
  },
  topicCompleted: {
    textDecorationLine: "line-through",
    color: THEME.textLight,
  },
  topicDescription: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 2,
  },
  completedDate: {
    fontSize: 11,
    color: THEME.success,
    marginTop: 2,
  },
  estimatedHours: {
    fontSize: 11,
    color: THEME.textLight,
    marginTop: 2,
  },
});
