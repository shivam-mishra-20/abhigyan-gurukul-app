import { COLORS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StudentDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  classLevel?: string;
  batch?: string;
}

interface ExamAttempt {
  _id: string;
  examTitle: string;
  examSubject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  timeTaken: number;
  submittedAt: string;
}

interface ChapterAccuracy {
  chapter: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

interface StudentReport {
  student: StudentDetails;
  overallStats: {
    totalAttempts: number;
    avgScore: number;
    bestScore: number;
    totalTimeSpent: number;
    overallAccuracy: number;
  };
  recentAttempts: ExamAttempt[];
  chapterWiseAccuracy: ChapterAccuracy[];
  subjectWiseStats: {
    subject: string;
    avgScore: number;
    attempts: number;
  }[];
}

export default function StudentReportPage() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [report, setReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "exams">(
    "overview"
  );

  const fetchReport = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = (await apiFetch(
        `/api/teacher/student-report/${studentId}`
      )) as StudentReport;
      setReport(res);
    } catch (error) {
      console.error("Error fetching student report:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "#D1FAE5", text: "#059669" };
    if (score >= 60) return { bg: "#FEF3C7", text: "#D97706" };
    if (score >= 40) return { bg: "#FED7AA", text: "#EA580C" };
    return { bg: "#FEE2E2", text: "#DC2626" };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.gray500 }}>
            Loading report...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.gray300}
          />
          <Text style={{ marginTop: 12, color: COLORS.gray500, fontSize: 16 }}>
            Report not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              backgroundColor: COLORS.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
            {report.student.name}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            {report.student.batch || "No Batch"} • Class{" "}
            {report.student.classLevel || "N/A"}
          </Text>
        </View>
      </View>

      {/* Stats Overview */}
      <View
        style={{
          backgroundColor: "#fff",
          marginHorizontal: 16,
          marginTop: -8,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          flexWrap: "wrap",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <View style={{ width: "50%", padding: 8, alignItems: "center" }}>
          <Text
            style={{ fontSize: 28, fontWeight: "700", color: COLORS.primary }}
          >
            {report.overallStats.avgScore.toFixed(0)}%
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.gray500 }}>Avg Score</Text>
        </View>
        <View style={{ width: "50%", padding: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#059669" }}>
            {report.overallStats.bestScore.toFixed(0)}%
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.gray500 }}>
            Best Score
          </Text>
        </View>
        <View style={{ width: "50%", padding: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#3B82F6" }}>
            {report.overallStats.totalAttempts}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.gray500 }}>
            Exams Taken
          </Text>
        </View>
        <View style={{ width: "50%", padding: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#8B5CF6" }}>
            {report.overallStats.overallAccuracy.toFixed(0)}%
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.gray500 }}>Accuracy</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: "#E5E7EB",
          borderRadius: 12,
          padding: 4,
        }}
      >
        {(["overview", "chapters", "exams"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: activeTab === tab ? "#fff" : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: 13,
                color: activeTab === tab ? COLORS.gray900 : COLORS.gray500,
                textTransform: "capitalize",
              }}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: 16 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReport();
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        {activeTab === "overview" && (
          <>
            {/* Subject-wise Performance */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.gray900,
                marginBottom: 12,
              }}
            >
              Subject Performance
            </Text>
            {report.subjectWiseStats.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: COLORS.gray500 }}>
                  No subject data available
                </Text>
              </View>
            ) : (
              report.subjectWiseStats.map((subject, idx) => {
                const scoreStyle = getScoreColor(subject.avgScore);
                return (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: COLORS.gray900,
                        }}
                      >
                        {subject.subject}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.gray500,
                          marginTop: 2,
                        }}
                      >
                        {subject.attempts} exams attempted
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: scoreStyle.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: scoreStyle.text,
                          fontWeight: "700",
                          fontSize: 16,
                        }}
                      >
                        {subject.avgScore.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Time Stats */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.gray900,
                marginTop: 20,
                marginBottom: 12,
              }}
            >
              Time Statistics
            </Text>
            <View
              style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "#EEF2FF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="time" size={20} color="#6366F1" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: COLORS.gray900,
                    }}
                  >
                    {formatTime(report.overallStats.totalTimeSpent)}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.gray500 }}>
                    Total Time Spent
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === "chapters" && (
          <>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.gray900,
                marginBottom: 12,
              }}
            >
              Chapter-wise Accuracy
            </Text>
            {report.chapterWiseAccuracy.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={48}
                  color={COLORS.gray300}
                />
                <Text style={{ color: COLORS.gray500, marginTop: 8 }}>
                  No chapter data available
                </Text>
              </View>
            ) : (
              report.chapterWiseAccuracy.map((chapter, idx) => {
                const scoreStyle = getScoreColor(chapter.accuracy);
                return (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: COLORS.gray900,
                          }}
                        >
                          {chapter.chapter}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.gray500,
                            marginTop: 2,
                          }}
                        >
                          {chapter.subject}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: scoreStyle.bg,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{ color: scoreStyle.text, fontWeight: "700" }}
                        >
                          {chapter.accuracy.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    {/* Progress Bar */}
                    <View
                      style={{
                        height: 6,
                        backgroundColor: "#E5E7EB",
                        borderRadius: 3,
                      }}
                    >
                      <View
                        style={{
                          height: 6,
                          width: `${chapter.accuracy}%`,
                          backgroundColor: scoreStyle.text,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.gray500,
                        marginTop: 6,
                      }}
                    >
                      {chapter.correctAnswers}/{chapter.totalQuestions} correct
                    </Text>
                  </View>
                );
              })
            )}
          </>
        )}

        {activeTab === "exams" && (
          <>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.gray900,
                marginBottom: 12,
              }}
            >
              Recent Exams
            </Text>
            {report.recentAttempts.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={COLORS.gray300}
                />
                <Text style={{ color: COLORS.gray500, marginTop: 8 }}>
                  No exam attempts yet
                </Text>
              </View>
            ) : (
              report.recentAttempts.map((attempt, idx) => {
                const scoreStyle = getScoreColor(attempt.score);
                return (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: COLORS.gray900,
                          }}
                          numberOfLines={1}
                        >
                          {attempt.examTitle}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.gray500,
                            marginTop: 2,
                          }}
                        >
                          {attempt.examSubject} •{" "}
                          {formatDate(attempt.submittedAt)}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: scoreStyle.bg,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: scoreStyle.text,
                            fontWeight: "700",
                            fontSize: 16,
                          }}
                        >
                          {attempt.score.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#059669",
                          }}
                        >
                          {attempt.correctAnswers}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.gray500 }}>
                          Correct
                        </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#DC2626",
                          }}
                        >
                          {attempt.wrongAnswers}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.gray500 }}>
                          Wrong
                        </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#6B7280",
                          }}
                        >
                          {attempt.skipped}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.gray500 }}>
                          Skipped
                        </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#3B82F6",
                          }}
                        >
                          {formatTime(attempt.timeTaken)}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.gray500 }}>
                          Time
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
