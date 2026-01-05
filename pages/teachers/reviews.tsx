import { MathText } from "@/components/ui/MathText";
import { apiFetch } from "@/lib/api";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    FileText
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserInfo {
  _id: string;
  name?: string;
  email?: string;
  classLevel?: string;
  batch?: string;
}

interface ExamInfo {
  _id: string;
  title: string;
}

interface PendingAttempt {
  _id: string;
  examId: string | ExamInfo;
  userId: string | UserInfo;
  submittedAt?: string;
  totalScore?: number;
  maxScore?: number;
  status: string;
  resultPublished?: boolean;
}

interface ReviewAnswer {
  questionId: string;
  textAnswer?: string;
  chosenOptionId?: string;
  scoreAwarded?: number;
}

interface ReviewQuestion {
  _id: string;
  text: string;
  options?: { _id: string; text: string; isCorrect?: boolean }[];
}

interface ReviewAttempt {
  _id: string;
  userId: string | UserInfo;
  totalScore?: number;
  maxScore?: number;
  status: string;
  answers: ReviewAnswer[];
}

interface ReviewView {
  attempt: ReviewAttempt;
  exam: { _id: string; title: string };
  sections: { _id: string; title: string; questionIds: string[] }[];
  questions: Record<string, ReviewQuestion>;
}

export default function TeacherReviews() {
  const [pending, setPending] = useState<PendingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReview, setActiveReview] = useState<ReviewView | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");

  const loadPending = useCallback(async () => {
    try {
      const data = await apiFetch("/api/attempts/review/pending");
      if (Array.isArray(data)) {
        // Filter out attempts that don't have valid exam or user data
        const validAttempts = (data as PendingAttempt[]).filter(
          (attempt) =>
            attempt &&
            attempt._id &&
            (typeof attempt.examId === "object" || attempt.examId) &&
            (typeof attempt.userId === "object" || attempt.userId)
        );
        setPending(validAttempts);
      } else {
        setPending([]);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setPending([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const openAttempt = async (id: string) => {
    try {
      const view = (await apiFetch(`/api/attempts/${id}/review`)) as ReviewView;
      if (!view || !view.attempt || !view.exam || !view.questions) {
        Alert.alert("Error", "This review is no longer available");
        loadPending(); // Refresh the list
        return;
      }
      setActiveReview(view);
    } catch (error: any) {
      console.error("Error opening review:", error);
      if (error?.message?.includes("not found") || error?.message?.includes("404")) {
        Alert.alert(
          "Review Not Found",
          "This review no longer exists. Refreshing the list...",
          [{ text: "OK", onPress: () => loadPending() }]
        );
      } else {
        Alert.alert("Error", "Failed to load review details");
      }
    }
  };

  const publishAttempt = async () => {
    if (!activeReview) return;

    Alert.alert(
      "Publish Result",
      "Are you sure you want to publish this result? The student will be able to see their score.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Publish",
          onPress: async () => {
            setPublishing(true);
            try {
              await apiFetch(
                `/api/attempts/${activeReview.attempt._id}/publish`,
                {
                  method: "POST",
                  body: JSON.stringify({ publish: true }),
                }
              );
              Alert.alert("Success", "Result published successfully");
              setActiveReview(null);
              loadPending();
            } catch (error) {
              console.error("Error publishing:", error);
              Alert.alert("Error", "Failed to publish result");
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  const getUser = (attempt: PendingAttempt) =>
    typeof attempt.userId === "object" ? attempt.userId : null;

  const getExam = (attempt: PendingAttempt) =>
    typeof attempt.examId === "object" ? attempt.examId : null;

  const getScorePercentage = (score: number, maxScore: number) =>
    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const filteredAttempts = pending.filter((a) => {
    if (filter === "pending") return !a.resultPublished;
    if (filter === "published") return a.resultPublished;
    return true;
  });

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </SafeAreaView>
    );
  }

  // Review Detail View
  if (activeReview) {
    const user =
      typeof activeReview.attempt.userId === "object"
        ? activeReview.attempt.userId
        : null;
    const score = activeReview.attempt.totalScore || 0;
    const maxScore = activeReview.attempt.maxScore || 0;
    const percentage = getScorePercentage(score, maxScore);

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <Pressable onPress={() => setActiveReview(null)} style={styles.backButton}>
            <ArrowLeft size={22} color="#1f2937" strokeWidth={2.5} />
          </Pressable>
          <View style={styles.detailHeaderText}>
            <Text style={styles.detailHeaderTitle}>Review Submission</Text>
            <Text style={styles.detailHeaderSubtitle}>
              {activeReview.exam.title}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
          {/* Student Info */}
          <View style={styles.studentInfoCard}>
            <View style={styles.studentInfoHeader}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {user?.name?.charAt(0) || "S"}
                </Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{user?.name || "Student"}</Text>
                <Text style={styles.studentEmail}>{user?.email}</Text>
                {user?.classLevel && (
                  <Text style={styles.studentClass}>
                    Class {user.classLevel} • {user.batch}
                  </Text>
                )}
              </View>
            </View>

            {/* Score */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={styles.scoreValue}>
                  {score} / {maxScore}
                </Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor:
                        percentage >= 80
                          ? "#10b981"
                          : percentage >= 60
                          ? "#f59e0b"
                          : "#ef4444",
                    },
                  ]}
                />
              </View>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
            </View>
          </View>

          {/* Answers by Section */}
          {activeReview.sections.map((section, sIdx) => (
            <View key={section._id} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {section.title || `Section ${sIdx + 1}`}
              </Text>

              {section.questionIds.map((qId, qIdx) => {
                const question = activeReview.questions[qId];
                const answer = activeReview.attempt.answers.find(
                  (a) => a.questionId === qId
                );

                if (!question) return null;

                return (
                  <View key={qId} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNumber}>Q{qIdx + 1}</Text>
                      {answer?.scoreAwarded !== undefined && (
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreBadgeText}>
                            +{answer.scoreAwarded}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Question Text with MathText for equation rendering */}
                    <View style={styles.questionTextContainer}>
                      <MathText text={question.text} fontSize={15} />
                    </View>

                    {/* Options */}
                    {question.options?.map((opt) => {
                      const isChosen = answer?.chosenOptionId === opt._id;
                      const isCorrect = opt.isCorrect;

                      const bgColor = isChosen && isCorrect
                        ? "#d1fae5"
                        : isChosen && !isCorrect
                        ? "#fee2e2"
                        : isCorrect
                        ? "#d1fae5"
                        : "#f9fafb";

                      return (
                        <View
                          key={opt._id}
                          style={[styles.optionContainer, { backgroundColor: bgColor }]}
                        >
                          <View
                            style={[
                              styles.optionIndicator,
                              {
                                backgroundColor: isChosen
                                  ? isCorrect
                                    ? "#10b981"
                                    : "#ef4444"
                                  : "#e5e7eb",
                              },
                            ]}
                          >
                            {isChosen && (
                              <Text style={styles.optionIndicatorText}>
                                {isCorrect ? "✓" : "✗"}
                              </Text>
                            )}
                          </View>
                          <View style={styles.optionTextContainer}>
                            <MathText
                              text={opt.text}
                              fontSize={14}
                              style={{ fontWeight: isCorrect ? "600" : "400" }}
                            />
                          </View>
                          {isCorrect && !isChosen && (
                            <CheckCircle size={16} color="#10b981" strokeWidth={2} />
                          )}
                        </View>
                      );
                    })}

                    {/* Text Answer */}
                    {answer?.textAnswer && (
                      <View style={styles.textAnswerContainer}>
                        <MathText text={answer.textAnswer} fontSize={14} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Publish Button */}
        <View style={styles.publishContainer}>
          <Pressable
            onPress={publishAttempt}
            disabled={publishing}
            style={[styles.publishButton, publishing && styles.publishButtonDisabled]}
          >
            <CheckCircle size={20} color="white" strokeWidth={2} />
            <Text style={styles.publishButtonText}>
              {publishing ? "Publishing..." : "Publish Result"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <FileText size={28} color="white" strokeWidth={2.5} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Review Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Grade and publish student submissions
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{pending.length}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardOrange]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>
            {pending.filter((p) => !p.resultPublished).length}
          </Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={styles.statLabel}>Published</Text>
          <Text style={styles.statValue}>
            {pending.filter((p) => p.resultPublished).length}
          </Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {(["all", "pending", "published"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPending();
            }}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
      >
        {filteredAttempts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <CheckCircle size={48} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>No submissions to review</Text>
          </View>
        ) : (
          filteredAttempts.map((attempt) => {
            const user = getUser(attempt);
            const exam = getExam(attempt);
            const percentage = getScorePercentage(
              attempt.totalScore || 0,
              attempt.maxScore || 1
            );

            // Skip if user or exam data is missing
            if (!user || !exam) return null;

            return (
              <Pressable
                key={attempt._id}
                onPress={() => openAttempt(attempt._id)}
                style={styles.attemptCard}
              >
                <View style={styles.attemptHeader}>
                  <View style={styles.attemptUserInfo}>
                    <View style={styles.attemptAvatar}>
                      <Text style={styles.attemptAvatarText}>
                        {user.name?.charAt(0) || "S"}
                      </Text>
                    </View>
                    <View style={styles.attemptUserDetails}>
                      <Text style={styles.attemptUserName}>
                        {user.name || "Student"}
                      </Text>
                      <Text style={styles.attemptId}>
                        #{attempt._id.slice(-6)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      attempt.resultPublished
                        ? styles.statusBadgePublished
                        : styles.statusBadgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        attempt.resultPublished
                          ? styles.statusBadgeTextPublished
                          : styles.statusBadgeTextPending,
                      ]}
                    >
                      {attempt.resultPublished ? "Published" : "Pending"}
                    </Text>
                  </View>
                </View>

                <View style={styles.attemptExamInfo}>
                  <Text style={styles.attemptExamTitle} numberOfLines={1}>
                    {exam.title}
                  </Text>
                  {user.classLevel && (
                    <Text style={styles.attemptExamMeta}>
                      Class {user.classLevel} • {user.batch}
                    </Text>
                  )}
                </View>

                {/* Score Bar */}
                <View style={styles.attemptScoreSection}>
                  <View style={styles.attemptScoreHeader}>
                    <Text style={styles.attemptScoreLabel}>Score</Text>
                    <Text style={styles.attemptScoreValue}>
                      {attempt.totalScore || 0} / {attempt.maxScore || 0}
                    </Text>
                  </View>
                  <View style={styles.attemptScoreBarContainer}>
                    <View
                      style={[
                        styles.attemptScoreBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor:
                            percentage >= 80
                              ? "#10b981"
                              : percentage >= 60
                              ? "#f59e0b"
                              : "#ef4444",
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.attemptFooter}>
                  <View style={styles.attemptDateContainer}>
                    <Clock size={14} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.attemptDate}>
                      {formatDate(attempt.submittedAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.attemptAction,
                      attempt.resultPublished
                        ? styles.attemptActionView
                        : styles.attemptActionReview,
                    ]}
                  >
                    {attempt.resultPublished ? "View →" : "Review →"}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, backgroundColor: "#f9fafb", justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: "#6b7280", fontSize: 14 },
  header: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 24, backgroundColor: "#10b981" },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 2 },
  statsContainer: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  statCard: { flex: 1, borderRadius: 16, padding: 14 },
  statCardBlue: { backgroundColor: "#dbeafe" },
  statCardOrange: { backgroundColor: "#fed7aa" },
  statCardGreen: { backgroundColor: "#d1fae5" },
  statLabel: { fontSize: 12, fontWeight: "500", color: "#6b7280", marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  filterContainer: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "white", borderWidth: 2, borderColor: "#e5e7eb" },
  filterChipActive: { backgroundColor: "#10b981", borderColor: "#10b981" },
  filterChipText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  filterChipTextActive: { color: "white" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#6b7280" },
  attemptCard: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  attemptHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  attemptUserInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  attemptAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center", marginRight: 12 },
  attemptAvatarText: { fontSize: 18, fontWeight: "bold", color: "#10b981" },
  attemptUserDetails: { flex: 1 },
  attemptUserName: { fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 2 },
  attemptId: { fontSize: 12, color: "#6b7280" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgePublished: { backgroundColor: "#d1fae5" },
  statusBadgePending: { backgroundColor: "#fed7aa" },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },
  statusBadgeTextPublished: { color: "#059669" },
  statusBadgeTextPending: { color: "#ea580c" },
  attemptExamInfo: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 12, marginBottom: 12 },
  attemptExamTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 },
  attemptExamMeta: { fontSize: 12, color: "#6b7280" },
  attemptScoreSection: { marginBottom: 12 },
  attemptScoreHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  attemptScoreLabel: { fontSize: 14, color: "#6b7280" },
  attemptScoreValue: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  attemptScoreBarContainer: { height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  attemptScoreBar: { height: "100%", borderRadius: 3 },
  attemptFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  attemptDateContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  attemptDate: { fontSize: 12, color: "#6b7280" },
  attemptAction: { fontSize: 14, fontWeight: "600" },
  attemptActionView: { color: "#6b7280" },
  attemptActionReview: { color: "#10b981" },
  detailHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", marginRight: 12 },
  detailHeaderText: { flex: 1 },
  detailHeaderTitle: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },
  detailHeaderSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  detailScroll: { flex: 1 },
  detailScrollContent: { paddingHorizontal: 16, paddingVertical: 16 },
  studentInfoCard: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  studentInfoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center", marginRight: 12 },
  studentAvatarText: { fontSize: 16, fontWeight: "bold", color: "#10b981" },
  studentDetails: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 2 },
  studentEmail: { fontSize: 14, color: "#6b7280", marginBottom: 2 },
  studentClass: { fontSize: 14, color: "#6b7280" },
  scoreContainer: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16 },
  scoreHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  scoreLabel: { fontSize: 14, color: "#6b7280" },
  scoreValue: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  scoreBarContainer: { height: 12, backgroundColor: "#e5e7eb", borderRadius: 6, overflow: "hidden", marginBottom: 4 },
  scoreBar: { height: "100%", borderRadius: 6 },
  scorePercentage: { fontSize: 12, color: "#6b7280", textAlign: "right" },
  sectionContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 12 },
  questionCard: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  questionHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
  questionNumber: { fontSize: 14, color: "#6b7280" },
  scoreBadge: { backgroundColor: "#d1fae5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreBadgeText: { fontSize: 12, color: "#059669", fontWeight: "600" },
  questionTextContainer: { marginBottom: 12 },
  optionContainer: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 8, gap: 12 },
  optionIndicator: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optionIndicatorText: { color: "white", fontSize: 12, fontWeight: "bold" },
  optionTextContainer: { flex: 1 },
  textAnswerContainer: { backgroundColor: "#dbeafe", padding: 12, borderRadius: 12, marginTop: 8 },
  publishContainer: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  publishButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: "#10b981" },
  publishButtonDisabled: { backgroundColor: "#9ca3af" },
  publishButtonText: { fontSize: 16, fontWeight: "bold", color: "white" },
});
