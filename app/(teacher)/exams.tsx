import { COLORS, GRADIENTS, SHADOWS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ExamSection {
  title: string;
  questionIds: string[];
  sectionDurationMins?: number;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  isPublished?: boolean;
  totalDurationMins?: number;
  sections?: ExamSection[];
  classLevel?: string;
  batch?: string;
  createdAt?: string;
}

const CLASS_OPTIONS = ["6", "7", "8", "9", "10", "11", "12"];
const BATCH_OPTIONS = [
  "All Batches",
  "Lakshya",
  "Aadharshilla",
  "Basic",
  "Commerce",
];

// Animated Stat Card
const StatCard = ({
  icon,
  label,
  value,
  color,
  gradient,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  gradient?: [string, string];
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <LinearGradient
        colors={gradient || [color + "15", color + "05"]}
        style={{
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: color + "30",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: color + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text
          style={{ fontSize: 24, fontWeight: "700", color: COLORS.gray900 }}
        >
          {value}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>
          {label}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Exam Card Component
const ExamCard = ({
  exam,
  onPublish,
  onAssign,
  onDelete,
  onEdit,
  onBuild,
}: {
  exam: Exam;
  onPublish: () => void;
  onAssign: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onBuild: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const questionsCount =
    exam.sections?.reduce((sum, s) => sum + s.questionIds.length, 0) || 0;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onEdit}
      >
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.gray200,
            ...SHADOWS.sm,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: exam.isPublished
                  ? COLORS.primaryBg
                  : COLORS.gray100,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={exam.isPublished ? COLORS.primary : COLORS.gray400}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: COLORS.gray900,
                }}
                numberOfLines={2}
              >
                {exam.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="help-circle-outline"
                    size={14}
                    color={COLORS.gray500}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.gray500,
                      marginLeft: 4,
                    }}
                  >
                    {questionsCount} questions
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={COLORS.gray500}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.gray500,
                      marginLeft: 4,
                    }}
                  >
                    {exam.totalDurationMins || 0} min
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: exam.isPublished
                  ? COLORS.primaryBg
                  : COLORS.warningLight,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: exam.isPublished ? COLORS.primary : COLORS.warning,
                }}
              >
                {exam.isPublished ? "Published" : "Draft"}
              </Text>
            </View>
          </View>

          {/* Assignment Info */}
          {exam.classLevel && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.gray50,
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <Ionicons
                name="school-outline"
                size={16}
                color={COLORS.gray600}
              />
              <Text
                style={{ fontSize: 13, color: COLORS.gray600, marginLeft: 8 }}
              >
                Class {exam.classLevel}
              </Text>
              {exam.batch && (
                <>
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: COLORS.gray400,
                      marginHorizontal: 8,
                    }}
                  />
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={COLORS.gray600}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.gray600,
                      marginLeft: 8,
                    }}
                  >
                    {exam.batch}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <Pressable
              onPress={onBuild}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <Ionicons name="construct-outline" size={16} color="white" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "white",
                  marginLeft: 6,
                }}
              >
                Build Exam
              </Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={onAssign}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: COLORS.gray200,
              }}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={COLORS.gray600}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.gray600,
                  marginLeft: 6,
                }}
              >
                Assign
              </Text>
            </Pressable>
            <Pressable
              onPress={onPublish}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: exam.isPublished
                  ? COLORS.warningLight
                  : COLORS.primaryBg,
              }}
            >
              <Ionicons
                name={exam.isPublished ? "eye-off-outline" : "eye-outline"}
                size={16}
                color={exam.isPublished ? COLORS.warning : COLORS.primary}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: exam.isPublished ? COLORS.warning : COLORS.primary,
                  marginLeft: 6,
                }}
              >
                {exam.isPublished ? "Unpublish" : "Publish"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={{
                width: 44,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: COLORS.errorLight,
              }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Selection Chip
const SelectionChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress}>
    <LinearGradient
      colors={selected ? GRADIENTS.primary : [COLORS.gray100, COLORS.gray100]}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: selected ? COLORS.white : COLORS.gray600,
        }}
      >
        {label}
      </Text>
    </LinearGradient>
  </Pressable>
);

export default function TeacherExams() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [classLevel, setClassLevel] = useState("");
  const [batch, setBatch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchExams = useCallback(async () => {
    try {
      const res = (await apiFetch("/api/exams")) as { items?: Exam[] };
      setExams(res?.items || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const filteredExams = exams.filter((exam) => {
    if (filter === "published") return exam.isPublished;
    if (filter === "draft") return !exam.isPublished;
    return true;
  });

  const createExam = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    setCreating(true);
    try {
      const newExam = (await apiFetch("/api/exams", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: "",
          totalDurationMins: 60,
          sections: [],
          isPublished: false,
        }),
      })) as Exam;
      setTitle("");
      setShowCreateModal(false);
      fetchExams();
      // Navigate to build exam screen
      router.push(`/(teacher)/build-exam?examId=${newExam._id}` as any);
    } catch {
      Alert.alert("Error", "Failed to create exam");
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (exam: Exam) => {
    try {
      await apiFetch(`/api/exams/${exam._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublished: !exam.isPublished }),
      });
      fetchExams();
    } catch {
      Alert.alert("Error", "Failed to update exam");
    }
  };

  const assignToClassBatch = async () => {
    if (!selectedExam || !classLevel || !batch) {
      Alert.alert("Error", "Select both class and batch");
      return;
    }

    try {
      await apiFetch(`/api/exams/${selectedExam._id}`, {
        method: "PUT",
        body: JSON.stringify({
          classLevel,
          batch,
          isPublished: true,
        }),
      });

      const groups =
        batch === "All Batches"
          ? [classLevel, "Lakshya", "Aadharshilla", "Basic", "Commerce"]
          : [classLevel, batch];

      await apiFetch(`/api/exams/${selectedExam._id}/assign`, {
        method: "POST",
        body: JSON.stringify({ groups }),
      });

      setShowAssignModal(false);
      setSelectedExam(null);
      setClassLevel("");
      setBatch("");
      fetchExams();
      Alert.alert("✅ Success", "Exam assigned successfully");
    } catch {
      Alert.alert("Error", "Failed to assign exam");
    }
  };

  const deleteExam = async (exam: Exam) => {
    Alert.alert(
      "Delete Exam",
      `Are you sure you want to delete "${exam.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/exams/${exam._id}`, { method: "DELETE" });
              fetchExams();
            } catch {
              Alert.alert("Error", "Failed to delete exam");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 20,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray200,
          backgroundColor: COLORS.white,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="black" />
            </Pressable>
            <View>
              <Text style={{ color: "black", fontSize: 24, fontWeight: "700" }}>
                Exams
              </Text>
              <Text style={{ color: "rgba(0,0,0,0.8)", fontSize: 13 }}>
                Manage your question papers
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 22,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              ...SHADOWS.md,
            }}
          >
            <Ionicons name="add" size={26} color={COLORS.primary} />
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 10,
        }}
      >
        <StatCard
          icon="documents"
          label="Total"
          value={exams.length}
          color={COLORS.info}
        />
        <StatCard
          icon="checkmark-circle"
          label="Published"
          value={exams.filter((e) => e.isPublished).length}
          color={COLORS.primary}
        />
        <StatCard
          icon="create"
          label="Draft"
          value={exams.filter((e) => !e.isPublished).length}
          color={COLORS.warning}
        />
      </View>

      {/* Filter Tabs */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SelectionChip
            label="All"
            selected={filter === "all"}
            onPress={() => setFilter("all")}
          />
          <SelectionChip
            label="Published"
            selected={filter === "published"}
            onPress={() => setFilter("published")}
          />
          <SelectionChip
            label="Draft"
            selected={filter === "draft"}
            onPress={() => setFilter("draft")}
          />
        </ScrollView>
      </View>

      {/* Exams List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchExams();
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        {filteredExams.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: COLORS.gray100,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={40}
                color={COLORS.gray400}
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: COLORS.gray700,
                marginBottom: 8,
              }}
            >
              No exams yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.gray500,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Create your first exam to get started
            </Text>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={{ borderRadius: 12, overflow: "hidden" }}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={{ paddingHorizontal: 24, paddingVertical: 14 }}
              >
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 15 }}
                >
                  Create First Exam
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          filteredExams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={exam}
              onPublish={() => togglePublish(exam)}
              onAssign={() => {
                setSelectedExam(exam);
                setShowAssignModal(true);
              }}
              onDelete={() => deleteExam(exam)}
              onEdit={() => {
                // Navigate to edit exam
              }}
              onBuild={() =>
                router.push(`/(teacher)/build-exam?examId=${exam._id}` as any)
              }
            />
          ))
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: COLORS.gray900,
                  }}
                >
                  Create Exam
                </Text>
                <Text
                  style={{ fontSize: 14, color: COLORS.gray500, marginTop: 2 }}
                >
                  Add a new question paper
                </Text>
              </View>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: COLORS.gray100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.gray600} />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: COLORS.gray700,
                marginBottom: 8,
              }}
            >
              Exam Title
            </Text>
            <TextInput
              placeholder="e.g., Mid-Term Physics Test"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.gray400}
              style={{
                borderWidth: 2,
                borderColor: title ? COLORS.primary : COLORS.gray200,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                marginBottom: 24,
                color: COLORS.gray800,
              }}
            />

            <Pressable
              onPress={createExam}
              disabled={creating || !title.trim()}
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <LinearGradient
                colors={
                  creating || !title.trim()
                    ? [COLORS.gray300, COLORS.gray300]
                    : GRADIENTS.primary
                }
                style={{ paddingVertical: 16, alignItems: "center" }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "700" }}
                >
                  {creating ? "Creating..." : "Create Exam"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Assign Modal */}
      <Modal visible={showAssignModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: COLORS.gray900,
                  }}
                >
                  Assign Exam
                </Text>
                <Text
                  style={{ fontSize: 14, color: COLORS.gray500, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {selectedExam?.title}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowAssignModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: COLORS.gray100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.gray600} />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: COLORS.gray700,
                marginBottom: 10,
              }}
            >
              Select Class
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {CLASS_OPTIONS.map((c) => (
                <SelectionChip
                  key={c}
                  label={`Class ${c}`}
                  selected={classLevel === c}
                  onPress={() => setClassLevel(c)}
                />
              ))}
            </ScrollView>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: COLORS.gray700,
                marginBottom: 10,
              }}
            >
              Select Batch
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
            >
              {BATCH_OPTIONS.map((b) => (
                <SelectionChip
                  key={b}
                  label={b}
                  selected={batch === b}
                  onPress={() => setBatch(b)}
                />
              ))}
            </ScrollView>

            <Pressable
              onPress={assignToClassBatch}
              disabled={!classLevel || !batch}
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <LinearGradient
                colors={
                  !classLevel || !batch
                    ? [COLORS.gray300, COLORS.gray300]
                    : GRADIENTS.primary
                }
                style={{ paddingVertical: 16, alignItems: "center" }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "700" }}
                >
                  Assign & Publish
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
