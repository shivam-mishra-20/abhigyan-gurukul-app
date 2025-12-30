import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Design System
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY, getTheme } from "@/lib/theme";

// Hooks & Services
import { useToast, useAppTheme } from "@/lib/context";
import { apiFetch } from "@/lib/services/api.service";

// ============================================================================
// Types
// ============================================================================

interface Question {
  _id: string;
  text: string;
  type: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  marks?: number;
  difficulty?: string;
  diagramUrl?: string;
  options?: { text: string; isCorrect?: boolean }[];
}

interface ExamSection {
  title: string;
  questionIds: string[];
  sectionDurationMins: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

interface Exam {
  _id: string;
  title: string;
  classLevel?: string;
  batch?: string;
  totalDurationMins?: number;
  sections?: ExamSection[];
  isPublished?: boolean;
}

interface FilterOptions {
  subjects: string[];
  chapters: string[];
  topics: string[];
}

// ============================================================================
// Math Rendering Component (inline to avoid import issues)
// ============================================================================

const generateMathHtml = (text: string): string => {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #1f2937;
          padding: 8px;
          background: transparent;
          word-wrap: break-word;
        }
        .katex { font-size: 1.05em; }
        .katex-display { margin: 0.5em 0; overflow-x: auto; overflow-y: hidden; }
      </style>
    </head>
    <body>
      <div id="content">${escapedText}</div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          try {
            renderMathInElement(document.getElementById("content"), {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "\\\\[", right: "\\\\]", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\\\(", right: "\\\\)", display: false}
              ],
              throwOnError: false
            });
          } catch(e) {}
          
          setTimeout(function() {
            const height = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
          }, 200);
        });
      </script>
    </body>
    </html>
  `;
};

// Question Card Component with Math rendering
const QuestionCard = ({
  question,
  isSelected,
  onToggle,
  onViewImage,
  styles,
  theme,
}: {
  question: Question;
  isSelected: boolean;
  onToggle: () => void;
  onViewImage?: (url: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof getTheme>;
}) => {
  const [webViewHeight, setWebViewHeight] = useState(60);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 0) {
        setWebViewHeight(Math.min(Math.max(data.height + 10, 60), 300));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.questionCard, isSelected && styles.questionCardSelected]}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
        {isSelected ? (
          <Ionicons name="checkmark" size={14} color="#fff" />
        ) : null}
      </View>

      {/* Question Content */}
      <View style={styles.questionCardContent}>
        {/* Question Text with Math Rendering */}
        <View style={{ minHeight: webViewHeight, maxHeight: 300 }}>
          <WebView
            source={{ html: generateMathHtml(question.text || "") }}
            style={{
              height: webViewHeight,
              backgroundColor: "transparent",
            }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            originWhitelist={["*"]}
            onMessage={handleMessage}
            injectedJavaScript="setTimeout(() => window.ReactNativeWebView.postMessage(JSON.stringify({ height: document.body.scrollHeight })), 300);"
          />
        </View>

        {/* Diagram/Image */}
        {question.diagramUrl ? (
          <Pressable
            onPress={() => onViewImage?.(question.diagramUrl!)}
            style={styles.diagramContainer}
          >
            <Image
              source={{ uri: question.diagramUrl }}
              style={styles.diagramThumbnail}
              resizeMode="contain"
            />
            <View style={styles.diagramOverlay}>
              <Ionicons name="expand" size={16} color="#fff" />
            </View>
          </Pressable>
        ) : null}

        {/* Meta Info */}
        <View style={styles.questionMeta}>
          {question.subject ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{question.subject}</Text>
            </View>
          ) : null}
          {question.difficulty ? (
            <View
              style={[
                styles.metaBadge,
                question.difficulty === "Easy" && styles.metaBadgeEasy,
                question.difficulty === "Medium" && styles.metaBadgeMedium,
                question.difficulty === "Hard" && styles.metaBadgeHard,
              ]}
            >
              <Text style={styles.metaBadgeText}>{question.difficulty}</Text>
            </View>
          ) : null}
          {question.marks ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{question.marks} marks</Text>
            </View>
          ) : null}
          {question.diagramUrl ? (
            <Ionicons name="image" size={14} color={theme.primary} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function BuildExamScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { isDark } = useAppTheme();

  // Get theme-aware colors and styles
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Exam data
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sections
  const [sections, setSections] = useState<ExamSection[]>([
    { title: "Section A", questionIds: [], sectionDurationMins: 30 },
  ]);
  const [expandedSection, setExpandedSection] = useState<number>(0);

  // Question bank
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    subjects: [],
    chapters: [],
    topics: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Image viewer
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Load exam
  useEffect(() => {
    const loadExam = async () => {
      if (!examId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<Exam>(`/api/exams/${examId}`);
        if (data && data._id) {
          setExam(data);
          if (data.sections && data.sections.length > 0) {
            setSections(data.sections);
          }
        }
      } catch (error) {
        console.error("Failed to load exam:", error);
        toast.error("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // Load filters when class changes
  useEffect(() => {
    const loadFilters = async () => {
      if (!selectedClass) {
        setFilterOptions({ subjects: [], chapters: [], topics: [] });
        return;
      }
      try {
        const res = await apiFetch<{ success: boolean; data: FilterOptions }>(
          `/api/ai/questions/class/${selectedClass}/filters`
        );
        if (res && res.success && res.data) {
          setFilterOptions(res.data);
        }
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    loadFilters();
    // Reset filters when class changes
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");
  }, [selectedClass]);

  // Compute available chapters based on selected subject (from loaded questions)
  const availableChapters = React.useMemo(() => {
    if (!selectedSubject) return filterOptions.chapters;
    const chaptersFromQuestions = questions
      .filter((q) => q.subject === selectedSubject && q.chapter)
      .map((q) => q.chapter!);
    return [...new Set(chaptersFromQuestions)].sort();
  }, [selectedSubject, questions, filterOptions.chapters]);

  // Compute available topics based on selected chapter (from loaded questions)
  const availableTopics = React.useMemo(() => {
    if (!selectedChapter) return filterOptions.topics;
    const topicsFromQuestions = questions
      .filter((q) => q.chapter === selectedChapter && q.topic)
      .map((q) => q.topic!);
    return [...new Set(topicsFromQuestions)].sort();
  }, [selectedChapter, questions, filterOptions.topics]);

  // Reset chapter when subject changes
  useEffect(() => {
    if (selectedSubject) {
      setSelectedChapter("");
      setSelectedTopic("");
    }
  }, [selectedSubject]);

  // Reset topic when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      setSelectedTopic("");
    }
  }, [selectedChapter]);

  // Load questions when filters change
  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedClass) {
        setQuestions([]);
        return;
      }
      setQuestionsLoading(true);
      try {
        const params = new URLSearchParams({ limit: "200" });
        if (selectedSubject) params.append("subject", selectedSubject);
        if (selectedChapter) params.append("chapter", selectedChapter);
        if (selectedTopic) params.append("topic", selectedTopic);

        const res = await apiFetch<{
          success: boolean;
          data: { questions: Question[] };
        }>(`/api/ai/questions/class/${selectedClass}?${params.toString()}`);

        if (res && res.success && res.data && res.data.questions) {
          setQuestions(res.data.questions);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, [selectedClass, selectedSubject, selectedChapter, selectedTopic]);

  // Filter questions by search
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.text?.toLowerCase().includes(query) ||
      q.subject?.toLowerCase().includes(query) ||
      q.topic?.toLowerCase().includes(query)
    );
  });

  // Get all selected question IDs across all sections
  const allSelectedIds = new Set(sections.flatMap((s) => s.questionIds));

  // Section management
  const addSection = () => {
    const nextLetter = String.fromCharCode(65 + sections.length);
    setSections([
      ...sections,
      {
        title: `Section ${nextLetter}`,
        questionIds: [],
        sectionDurationMins: 30,
      },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, i) => i !== index));
    if (expandedSection >= sections.length - 1) {
      setExpandedSection(Math.max(0, sections.length - 2));
    }
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index].title = title;
    setSections(updated);
  };

  const toggleQuestionInSection = (
    sectionIndex: number,
    questionId: string
  ) => {
    const updated = [...sections];
    const section = updated[sectionIndex];
    if (section.questionIds.includes(questionId)) {
      section.questionIds = section.questionIds.filter(
        (id) => id !== questionId
      );
    } else {
      // Only add if not in any other section
      if (
        !allSelectedIds.has(questionId) ||
        section.questionIds.includes(questionId)
      ) {
        section.questionIds.push(questionId);
      }
    }
    setSections(updated);
  };

  // Save exam
  const handleSave = async () => {
    if (!examId) {
      toast.error("No exam ID provided");
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/api/exams/${examId}`, {
        method: "PUT",
        body: { sections },
      });
      toast.success("Exam saved successfully");
      router.back();
    } catch (error) {
      toast.error("Failed to save exam");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questionIds.length,
    0
  );
  const totalDuration = sections.reduce(
    (sum, s) => sum + (s.sectionDurationMins || 0),
    0
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading exam...</Text>
      </View>
    );
  }

  if (!examId) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color={theme.error} />
        <Text style={styles.loadingText}>No exam ID provided</Text>
        <Pressable onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exam?.title || "Build Exam"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {totalQuestions} questions • {totalDuration} min
          </Text>
        </View>
        <Pressable
          onPress={handleSave}
          disabled={saving || totalQuestions === 0}
          style={[
            styles.saveButton,
            (saving || totalQuestions === 0) && styles.saveButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Class Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Class</Text>
          <View style={styles.classGrid}>
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <Pressable
                key={cls}
                onPress={() => setSelectedClass(cls)}
                style={[
                  styles.classChip,
                  selectedClass === cls && styles.classChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.classChipText,
                    selectedClass === cls && styles.classChipTextSelected,
                  ]}
                >
                  Class {cls}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Filters */}
        {selectedClass ? (
          <View style={styles.card}>
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              style={styles.filterHeader}
            >
              <View style={styles.filterHeaderLeft}>
                <Ionicons name="funnel" size={18} color={theme.primary} />
                <Text style={styles.cardTitle}>Filters</Text>
                {selectedSubject || selectedChapter || selectedTopic ? (
                  <View style={styles.activeFilterBadge}>
                    <Text style={styles.activeFilterBadgeText}>Active</Text>
                  </View>
                ) : null}
              </View>
              <Ionicons
                name={showFilters ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.text.tertiary}
              />
            </Pressable>

            {showFilters ? (
              <View style={styles.filtersContent}>
                {/* Subject Filter */}
                {filterOptions.subjects.length > 0 ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Subject</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterChips}
                    >
                      <Pressable
                        onPress={() => setSelectedSubject("")}
                        style={[
                          styles.filterChip,
                          !selectedSubject && styles.filterChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            !selectedSubject && styles.filterChipTextSelected,
                          ]}
                        >
                          All
                        </Text>
                      </Pressable>
                      {filterOptions.subjects.map((subject) => (
                        <Pressable
                          key={subject}
                          onPress={() => setSelectedSubject(subject)}
                          style={[
                            styles.filterChip,
                            selectedSubject === subject &&
                              styles.filterChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedSubject === subject &&
                                styles.filterChipTextSelected,
                            ]}
                          >
                            {subject}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                {/* Chapter Filter */}
                {selectedSubject && availableChapters.length > 0 ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Chapter</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterChips}
                    >
                      <Pressable
                        onPress={() => setSelectedChapter("")}
                        style={[
                          styles.filterChip,
                          !selectedChapter && styles.filterChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            !selectedChapter && styles.filterChipTextSelected,
                          ]}
                        >
                          All
                        </Text>
                      </Pressable>
                      {availableChapters.map((chapter) => (
                        <Pressable
                          key={chapter}
                          onPress={() => setSelectedChapter(chapter)}
                          style={[
                            styles.filterChip,
                            selectedChapter === chapter &&
                              styles.filterChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedChapter === chapter &&
                                styles.filterChipTextSelected,
                            ]}
                          >
                            {chapter}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                {/* Topic Filter */}
                {selectedChapter && availableTopics.length > 0 ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Topic</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterChips}
                    >
                      <Pressable
                        onPress={() => setSelectedTopic("")}
                        style={[
                          styles.filterChip,
                          !selectedTopic && styles.filterChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            !selectedTopic && styles.filterChipTextSelected,
                          ]}
                        >
                          All
                        </Text>
                      </Pressable>
                      {availableTopics.map((topic) => (
                        <Pressable
                          key={topic}
                          onPress={() => setSelectedTopic(topic)}
                          style={[
                            styles.filterChip,
                            selectedTopic === topic &&
                              styles.filterChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedTopic === topic &&
                                styles.filterChipTextSelected,
                            ]}
                          >
                            {topic}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Search */}
        {selectedClass ? (
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={theme.text.tertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
              placeholderTextColor={theme.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.text.tertiary}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Sections Summary */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Exam Sections</Text>
            <Pressable onPress={addSection} style={styles.addSectionButton}>
              <Ionicons name="add" size={18} color={theme.primary} />
              <Text style={styles.addSectionText}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.sectionTabs}>
            {sections.map((section, index) => (
              <Pressable
                key={index}
                onPress={() => setExpandedSection(index)}
                style={[
                  styles.sectionTab,
                  expandedSection === index && styles.sectionTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.sectionTabText,
                    expandedSection === index && styles.sectionTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {section.title}
                </Text>
                <View style={styles.sectionTabBadge}>
                  <Text style={styles.sectionTabBadgeText}>
                    {section.questionIds.length}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Active Section Editor */}
          {sections[expandedSection] ? (
            <View style={styles.activeSectionEditor}>
              <View style={styles.sectionTitleRow}>
                <TextInput
                  style={styles.sectionTitleInput}
                  value={sections[expandedSection].title}
                  onChangeText={(text) =>
                    updateSectionTitle(expandedSection, text)
                  }
                  placeholder="Section title"
                />
                {sections.length > 1 ? (
                  <Pressable
                    onPress={() => removeSection(expandedSection)}
                    style={styles.deleteSectionButton}
                  >
                    <Ionicons name="trash" size={18} color={theme.error} />
                  </Pressable>
                ) : null}
              </View>

              {/* Selected Questions Preview */}
              {sections[expandedSection].questionIds.length > 0 ? (
                <View style={styles.selectedQuestionsPreview}>
                  <Text style={styles.selectedQuestionsTitle}>
                    Selected ({sections[expandedSection].questionIds.length})
                  </Text>
                  {sections[expandedSection].questionIds
                    .slice(0, 3)
                    .map((qId, idx) => {
                      const q = questions.find((q) => q._id === qId);
                      return (
                        <View key={qId} style={styles.selectedQuestionItem}>
                          <Text style={styles.selectedQuestionNumber}>
                            {idx + 1}.
                          </Text>
                          <Text
                            style={styles.selectedQuestionText}
                            numberOfLines={1}
                          >
                            {q?.text || "Question not found"}
                          </Text>
                        </View>
                      );
                    })}
                  {sections[expandedSection].questionIds.length > 3 ? (
                    <Text style={styles.moreQuestionsText}>
                      +{sections[expandedSection].questionIds.length - 3} more
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.emptySelectedQuestions}>
                  <Ionicons
                    name="documents-outline"
                    size={24}
                    color={theme.text.disabled}
                  />
                  <Text style={styles.emptySelectedText}>
                    No questions selected
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* Questions Bank */}
        {selectedClass ? (
          <View style={styles.card}>
            <View style={styles.questionBankHeader}>
              <Text style={styles.cardTitle}>Question Bank</Text>
              <Text style={styles.questionCount}>
                {filteredQuestions.length} questions
              </Text>
            </View>

            {questionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.loadingQuestionsText}>
                  Loading questions...
                </Text>
              </View>
            ) : filteredQuestions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={40}
                  color={theme.text.disabled}
                />
                <Text style={styles.emptyText}>No questions found</Text>
                <Text style={styles.emptySubtext}>
                  Try changing filters or search query
                </Text>
              </View>
            ) : (
              <View style={styles.questionsList}>
                {filteredQuestions.map((question) => {
                  const isInCurrentSection = sections[
                    expandedSection
                  ]?.questionIds.includes(question._id);
                  const isInOtherSection =
                    allSelectedIds.has(question._id) && !isInCurrentSection;

                  return (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      isSelected={isInCurrentSection}
                      onToggle={() => {
                        if (!isInOtherSection) {
                          toggleQuestionInSection(
                            expandedSection,
                            question._id
                          );
                        }
                      }}
                      onViewImage={setViewingImage}
                      styles={styles}
                      theme={theme}
                    />
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {/* Help Text */}
        {!selectedClass ? (
          <View style={styles.helpContainer}>
            <Ionicons
              name="information-circle"
              size={48}
              color={theme.text.disabled}
            />
            <Text style={styles.helpTitle}>Get Started</Text>
            <Text style={styles.helpText}>
              Select a class above to browse and add questions to your exam.
            </Text>
          </View>
        ) : null}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={!!viewingImage}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingImage(null)}
      >
        <Pressable
          style={styles.imageModalOverlay}
          onPress={() => setViewingImage(null)}
        >
          <View style={styles.imageModalContent}>
            {viewingImage ? (
              <Image
                source={{ uri: viewingImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : null}
            <Pressable
              style={styles.closeImageButton}
              onPress={() => setViewingImage(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ============================================================================
// Styles Factory - Creates theme-aware styles
// ============================================================================

const createStyles = (THEME: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg.secondary,
    },
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      ...TYPOGRAPHY.body,
      color: THEME.text.tertiary,
      marginTop: SPACING.md,
    },
    goBackButton: {
      marginTop: SPACING.lg,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      backgroundColor: THEME.primary,
      borderRadius: RADIUS.lg,
    },
    goBackText: {
      color: THEME.text.inverse,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: THEME.bg.elevated,
      borderBottomWidth: 1,
      borderBottomColor: THEME.border.light,
    },
    backButton: {
      padding: SPACING.sm,
      marginRight: SPACING.xs,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      ...TYPOGRAPHY.h3,
      color: THEME.text.primary,
    },
    headerSubtitle: {
      ...TYPOGRAPHY.caption,
      color: THEME.text.tertiary,
      marginTop: 2,
    },
    saveButton: {
      backgroundColor: THEME.primary,
      width: 44,
      height: 44,
      borderRadius: RADIUS.full,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.md,
    },
    saveButtonDisabled: {
      backgroundColor: THEME.text.disabled,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: SPACING.md,
    },
    card: {
      backgroundColor: THEME.bg.elevated,
      borderRadius: RADIUS.xl,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    cardTitle: {
      ...TYPOGRAPHY.bodyMedium,
      color: THEME.text.primary,
    },
    classGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
      marginTop: SPACING.md,
    },
    classChip: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      backgroundColor: THEME.bg.tertiary,
      borderWidth: 1,
      borderColor: THEME.border.default,
    },
    classChipSelected: {
      backgroundColor: THEME.primaryLight,
      borderColor: THEME.primary,
    },
    classChipText: {
      ...TYPOGRAPHY.bodySmall,
      color: THEME.text.secondary,
    },
    classChipTextSelected: {
      color: THEME.primary,
      fontWeight: "600",
    },
    filterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    filterHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },
    activeFilterBadge: {
      backgroundColor: THEME.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: RADIUS.full,
    },
    activeFilterBadgeText: {
      fontSize: 10,
      color: THEME.text.inverse,
      fontWeight: "600",
    },
    filtersContent: {
      marginTop: SPACING.md,
    },
    filterGroup: {
      marginBottom: SPACING.md,
    },
    filterLabel: {
      ...TYPOGRAPHY.smallBold,
      color: THEME.text.secondary,
      marginBottom: SPACING.sm,
    },
    filterChips: {
      gap: SPACING.sm,
    },
    filterChip: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      backgroundColor: THEME.bg.tertiary,
      borderWidth: 1,
      borderColor: THEME.border.default,
    },
    filterChipSelected: {
      backgroundColor: THEME.primaryLight,
      borderColor: THEME.primary,
    },
    filterChipText: {
      ...TYPOGRAPHY.bodySmall,
      color: THEME.text.secondary,
    },
    filterChipTextSelected: {
      color: THEME.primary,
      fontWeight: "600",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: THEME.bg.elevated,
      borderRadius: RADIUS.xl,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    searchIcon: {
      marginRight: SPACING.sm,
    },
    searchInput: {
      flex: 1,
      ...TYPOGRAPHY.body,
      color: THEME.text.primary,
      paddingVertical: SPACING.md,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    addSectionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.lg,
      backgroundColor: THEME.primaryMuted,
    },
    addSectionText: {
      ...TYPOGRAPHY.smallBold,
      color: THEME.primary,
    },
    sectionTabs: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    sectionTab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.lg,
      backgroundColor: THEME.bg.tertiary,
    },
    sectionTabActive: {
      backgroundColor: THEME.primary,
    },
    sectionTabText: {
      ...TYPOGRAPHY.bodySmall,
      color: THEME.text.secondary,
    },
    sectionTabTextActive: {
      color: THEME.text.inverse,
      fontWeight: "600",
    },
    sectionTabBadge: {
      backgroundColor: "rgba(0,0,0,0.15)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: RADIUS.full,
    },
    sectionTabBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      color: THEME.text.inverse,
    },
    activeSectionEditor: {
      borderTopWidth: 1,
      borderTopColor: THEME.border.light,
      paddingTop: SPACING.md,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },
    sectionTitleInput: {
      flex: 1,
      ...TYPOGRAPHY.body,
      color: THEME.text.primary,
      backgroundColor: THEME.bg.secondary,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: THEME.border.default,
    },
    deleteSectionButton: {
      padding: SPACING.sm,
    },
    selectedQuestionsPreview: {
      marginTop: SPACING.md,
      padding: SPACING.sm,
      backgroundColor: THEME.primaryMuted,
      borderRadius: RADIUS.lg,
    },
    selectedQuestionsTitle: {
      ...TYPOGRAPHY.smallBold,
      color: THEME.primary,
      marginBottom: SPACING.sm,
    },
    selectedQuestionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingVertical: 4,
    },
    selectedQuestionNumber: {
      ...TYPOGRAPHY.smallBold,
      color: THEME.primary,
      width: 20,
    },
    selectedQuestionText: {
      ...TYPOGRAPHY.bodySmall,
      color: THEME.text.secondary,
      flex: 1,
    },
    moreQuestionsText: {
      ...TYPOGRAPHY.caption,
      color: THEME.text.tertiary,
      marginTop: SPACING.xs,
    },
    emptySelectedQuestions: {
      marginTop: SPACING.md,
      alignItems: "center",
      paddingVertical: SPACING.lg,
      borderWidth: 1,
      borderColor: THEME.border.default,
      borderStyle: "dashed",
      borderRadius: RADIUS.lg,
    },
    emptySelectedText: {
      ...TYPOGRAPHY.bodySmall,
      color: THEME.text.disabled,
      marginTop: SPACING.xs,
    },
    questionBankHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    questionCount: {
      ...TYPOGRAPHY.caption,
      color: THEME.text.tertiary,
    },
    loadingContainer: {
      padding: SPACING.xl,
      alignItems: "center",
    },
    loadingQuestionsText: {
      ...TYPOGRAPHY.bodySmall,
      color: THEME.text.tertiary,
      marginTop: SPACING.sm,
    },
    emptyContainer: {
      padding: SPACING.xl,
      alignItems: "center",
    },
    emptyText: {
      ...TYPOGRAPHY.body,
      color: THEME.text.disabled,
      marginTop: SPACING.sm,
    },
    emptySubtext: {
      ...TYPOGRAPHY.caption,
      color: THEME.text.disabled,
      marginTop: 4,
    },
    questionsList: {
      gap: SPACING.sm,
    },
    questionCard: {
      flexDirection: "row",
      padding: SPACING.md,
      backgroundColor: THEME.bg.secondary,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: THEME.border.default,
    },
    questionCardSelected: {
      backgroundColor: THEME.primaryMuted,
      borderColor: THEME.primary,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: THEME.text.disabled,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACING.md,
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: THEME.primary,
      borderColor: THEME.primary,
    },
    questionCardContent: {
      flex: 1,
    },
    questionMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginTop: SPACING.sm,
      flexWrap: "wrap",
    },
    metaBadge: {
      backgroundColor: THEME.bg.tertiary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: RADIUS.full,
    },
    metaBadgeText: {
      fontSize: 11,
      color: THEME.text.secondary,
      fontWeight: "500",
    },
    metaBadgeEasy: {
      backgroundColor: THEME.successLight,
    },
    metaBadgeMedium: {
      backgroundColor: THEME.warningLight,
    },
    metaBadgeHard: {
      backgroundColor: THEME.errorLight,
    },
    diagramContainer: {
      marginTop: SPACING.sm,
      borderRadius: RADIUS.lg,
      overflow: "hidden",
      position: "relative",
    },
    diagramThumbnail: {
      width: "100%",
      height: 120,
      backgroundColor: THEME.bg.tertiary,
    },
    diagramOverlay: {
      position: "absolute",
      bottom: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: 6,
      borderRadius: RADIUS.lg,
    },
    helpContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING["3xl"],
    },
    helpTitle: {
      ...TYPOGRAPHY.h3,
      color: THEME.text.disabled,
      marginTop: SPACING.md,
    },
    helpText: {
      ...TYPOGRAPHY.body,
      color: THEME.text.disabled,
      textAlign: "center",
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.xl,
    },
    imageModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    imageModalContent: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    fullImage: {
      width: "90%",
      height: "80%",
    },
    closeImageButton: {
      position: "absolute",
      top: 50,
      right: 20,
      padding: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: RADIUS.full,
    },
  });
