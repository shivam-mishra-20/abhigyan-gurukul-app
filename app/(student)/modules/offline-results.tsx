import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  primaryLight: "#10b981",
};

interface OfflineResult {
  _id: string;
  class: string;
  name: string;
  batch?: string;
  subject: string;
  marks: number;
  outOf: number;
  remarks?: string;
  testDate: string;
  createdAt: string;
  percentage?: number;
}

export default function OfflineResultsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState<OfflineResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadResults = async () => {
    try {
      setError(null);
      const data = await apiFetch('/api/offline-results/student') as OfflineResult[];
      setResults(data || []);
    } catch (err: any) {
      console.error("Error loading offline results:", err);
      setError(err.message || "Failed to load results");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResults();
  }, []);

  // Calculate percentage
  const getPercentage = (marks: number, outOf: number) => {
    if (outOf <= 0) return 0;
    return Math.round((marks / outOf) * 100);
  };

  // Get grade color based on percentage
  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981"; // Green
    if (percentage >= 60) return "#3b82f6"; // Blue
    if (percentage >= 40) return "#f59e0b"; // Yellow/Orange
    return "#ef4444"; // Red
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Offline Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Summary Card */}
        {results.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{results.length}</Text>
              <Text style={styles.summaryLabel}>Total Tests</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(
                  results.reduce((acc, r) => acc + getPercentage(r.marks, r.outOf), 0) / results.length
                )}%
              </Text>
              <Text style={styles.summaryLabel}>Avg Score</Text>
            </View>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadResults} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Results List */}
        {results.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Results Yet</Text>
            <Text style={styles.emptyText}>
              Your offline test results will appear here once they are uploaded by your teacher.
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {results.map((result, index) => {
              const percentage = getPercentage(result.marks, result.outOf);
              const gradeColor = getGradeColor(percentage);

              return (
                <View key={result._id || index} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.subjectRow}>
                      <View style={[styles.subjectIcon, { backgroundColor: gradeColor + "20" }]}>
                        <Ionicons name="book" size={18} color={gradeColor} />
                      </View>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{result.subject}</Text>
                        <Text style={styles.testDate}>{formatDate(result.testDate)}</Text>
                      </View>
                    </View>
                    <View style={[styles.percentageBadge, { backgroundColor: gradeColor + "15" }]}>
                      <Text style={[styles.percentageText, { color: gradeColor }]}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.marksRow}>
                    <View style={styles.marksInfo}>
                      <Text style={styles.marksLabel}>Score</Text>
                      <Text style={styles.marksValue}>
                        <Text style={{ color: gradeColor, fontWeight: "700" }}>{result.marks}</Text>
                        <Text style={styles.outOfText}> / {result.outOf}</Text>
                      </Text>
                    </View>
                    
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${percentage}%`, backgroundColor: gradeColor }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>

                  {result.remarks && (
                    <View style={styles.remarksContainer}>
                      <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
                      <Text style={styles.remarksText}>{result.remarks}</Text>
                    </View>
                  )}

                  {result.batch && (
                    <View style={styles.metaRow}>
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaText}>Class {result.class}</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaText}>{result.batch}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  // Summary Card
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: THEME.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 20,
  },
  // Error State
  errorContainer: {
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  // Results List
  resultsList: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  testDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
  },
  marksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  marksInfo: {
    minWidth: 80,
  },
  marksLabel: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  marksValue: {
    fontSize: 16,
    color: "#374151",
    marginTop: 2,
  },
  outOfText: {
    color: "#9ca3af",
    fontWeight: "400",
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  remarksContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  remarksText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
});
