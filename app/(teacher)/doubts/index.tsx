import { apiFetch } from "@/lib/api";
import {
  CheckCircle,
  HelpCircle,
  Send,
  X
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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

interface Doubt {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    batch?: string;
  };
  subject: string;
  chapter?: string;
  question: string;
  status: "pending" | "in-progress" | "resolved";
  reply?: string;
  createdAt: string;
}

export default function TeacherDoubts() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchDoubts = useCallback(async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = (await apiFetch(`/api/doubts/teacher${params}`)) as {
        doubts: Doubt[];
      };
      setDoubts(res?.doubts || []);
    } catch (error) {
      console.error("Error fetching doubts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const handleReply = async () => {
    if (!selectedDoubt || !reply.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/api/doubts/${selectedDoubt._id}/reply`, {
        method: "PUT",
        body: JSON.stringify({ reply }),
      });
      setReply("");
      setSelectedDoubt(null);
      fetchDoubts();
      Alert.alert("Success", "Reply sent successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiFetch(`/api/doubts/${id}/resolve`, { method: "PUT" });
      fetchDoubts();
      setSelectedDoubt(null);
    } catch (error) {
      Alert.alert("Error", "Failed to resolve doubt");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#fef3c7", text: "#d97706" };
      case "in-progress":
        return { bg: "#dbeafe", text: "#2563eb" };
      case "resolved":
        return { bg: "#d1fae5", text: "#059669" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading doubts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <HelpCircle size={28} color="white" strokeWidth={2.5} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Doubts</Text>
            <Text style={styles.headerSubtitle}>
              Help students with their questions
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersSection}>
        {(["all", "pending", "resolved"] as const).map((f) => (
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
              fetchDoubts();
            }}
            colors={["#f59e0b"]}
            tintColor="#f59e0b"
          />
        }
      >
        {doubts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <HelpCircle size={48} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No doubts found</Text>
            <Text style={styles.emptySubtitle}>
              Student questions will appear here
            </Text>
          </View>
        ) : (
          doubts.map((doubt) => {
            const statusStyle = getStatusStyle(doubt.status);
            return (
              <Pressable
                key={doubt._id}
                onPress={() => {
                  setSelectedDoubt(doubt);
                  setReply(doubt.reply || "");
                }}
                style={styles.doubtCard}
              >
                <View style={styles.doubtCardHeader}>
                  <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {doubt.student.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.studentName}>
                        {doubt.student.name}
                      </Text>
                      <Text style={styles.studentMeta}>
                        {doubt.student.batch} • {formatDate(doubt.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
                  >
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {doubt.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.doubtTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{doubt.subject}</Text>
                  </View>
                  {doubt.chapter && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{doubt.chapter}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.doubtQuestion} numberOfLines={2}>
                  {doubt.question}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedDoubt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Doubt Details</Text>
              <Pressable onPress={() => setSelectedDoubt(null)}>
                <X size={24} color="#9ca3af" strokeWidth={2} />
              </Pressable>
            </View>

            {selectedDoubt && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalStudentInfo}>
                  <View style={styles.modalStudentAvatar}>
                    <Text style={styles.modalStudentAvatarText}>
                      {selectedDoubt.student.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalStudentName}>
                      {selectedDoubt.student.name}
                    </Text>
                    <Text style={styles.modalStudentEmail}>
                      {selectedDoubt.student.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.questionContainer}>
                  <Text style={styles.questionLabel}>Question</Text>
                  <Text style={styles.questionText}>
                    {selectedDoubt.question}
                  </Text>
                </View>

                {selectedDoubt.reply && (
                  <View style={styles.replyContainer}>
                    <Text style={styles.replyLabel}>Your Reply</Text>
                    <Text style={styles.replyText}>{selectedDoubt.reply}</Text>
                  </View>
                )}

                {selectedDoubt.status !== "resolved" && (
                  <>
                    <TextInput
                      placeholder="Type your reply..."
                      placeholderTextColor="#9ca3af"
                      value={reply}
                      onChangeText={setReply}
                      multiline
                      numberOfLines={4}
                      style={styles.replyInput}
                      textAlignVertical="top"
                    />

                    <View style={styles.modalActions}>
                      <Pressable
                        onPress={() => handleResolve(selectedDoubt._id)}
                        style={styles.resolveButton}
                      >
                        <CheckCircle size={18} color="#059669" strokeWidth={2} />
                        <Text style={styles.resolveButtonText}>Resolve</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleReply}
                        disabled={!reply.trim() || sending}
                        style={[
                          styles.sendButton,
                          (!reply.trim() || sending) && styles.sendButtonDisabled,
                        ]}
                      >
                        <Send size={18} color="white" strokeWidth={2} />
                        <Text style={styles.sendButtonText}>
                          {sending ? "Sending..." : "Send Reply"}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, backgroundColor: "#f9fafb", justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: "#6b7280", fontSize: 14 },
  header: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 24, backgroundColor: "#f59e0b" },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { color: "white", fontSize: 28, fontWeight: "bold" },
  headerSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 2 },
  filtersSection: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "white", borderWidth: 2, borderColor: "#e5e7eb" },
  filterChipActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  filterChipText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  filterChipTextActive: { color: "white" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#6b7280" },
  doubtCard: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  doubtCardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  studentInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginRight: 12 },
  studentAvatarText: { fontSize: 16, fontWeight: "bold", color: "#f59e0b" },
  studentName: { fontSize: 15, fontWeight: "600", color: "#1f2937", marginBottom: 2 },
  studentMeta: { fontSize: 12, color: "#6b7280" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },
  doubtTags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tag: { backgroundColor: "#f3f4f6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, color: "#374151" },
  doubtQuestion: { fontSize: 14, color: "#374151", lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },
  modalScroll: { maxHeight: "100%" },
  modalStudentInfo: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  modalStudentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginRight: 12 },
  modalStudentAvatarText: { fontSize: 20, fontWeight: "bold", color: "#f59e0b" },
  modalStudentName: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 2 },
  modalStudentEmail: { fontSize: 14, color: "#6b7280" },
  questionContainer: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 16 },
  questionLabel: { fontSize: 13, color: "#6b7280", marginBottom: 8, fontWeight: "500" },
  questionText: { fontSize: 15, color: "#1f2937", lineHeight: 22 },
 replyContainer: { backgroundColor: "#d1fae5", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#10b981" },
  replyLabel: { fontSize: 13, color: "#059669", marginBottom: 8, fontWeight: "600" },
  replyText: { fontSize: 15, color: "#1f2937", lineHeight: 22 },
  replyInput: { borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 15, color: "#1f2937", backgroundColor: "#f9fafb", height: 100 },
  modalActions: { flexDirection: "row", gap: 12 },
  resolveButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, backgroundColor: "#d1fae5", gap: 8 },
  resolveButtonText: { fontSize: 15, fontWeight: "600", color: "#059669" },
  sendButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, backgroundColor: "#f59e0b", gap: 8 },
  sendButtonDisabled: { backgroundColor: "#9ca3af" },
  sendButtonText: { fontSize: 15, fontWeight: "600", color: "white" },
});
