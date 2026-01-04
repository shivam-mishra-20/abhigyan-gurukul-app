import { GRADIENTS, SHADOWS, getColors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  FileClock,
  FileText,
  HelpCircle,
  Plus,
  School,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
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
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);
  const scale = useRef(new Animated.Value(1)).current;

  const getIcon = () => {
    const iconProps = { size: 18, color, strokeWidth: 2 };
    switch (icon) {
      case "documents":
        return <FileText {...iconProps} />;
      case "checkmark-circle":
        return <CheckCircle {...iconProps} />;
      case "time":
        return <FileClock {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

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
          {getIcon()}
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: isDark ? colors.gray100 : colors.gray900,
          }}
        >
          {value}
        </Text>
        <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}>
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
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);
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
            backgroundColor: colors.white,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.gray200,
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
                  ? colors.primaryBg
                  : colors.gray100,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <FileText
                size={24}
                color={exam.isPublished ? colors.primary : colors.gray400}
                strokeWidth={2}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.gray900,
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
                  <HelpCircle
                    size={14}
                    color={colors.gray500}
                    strokeWidth={2}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.gray500,
                      marginLeft: 4,
                    }}
                  >
                    {questionsCount} questions
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock size={14} color={colors.gray500} strokeWidth={2} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.gray500,
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
                  ? colors.primaryBg
                  : colors.warningLight,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: exam.isPublished ? colors.primary : colors.warning,
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
                backgroundColor: colors.gray50,
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <School size={16} color={colors.gray600} strokeWidth={2} />
              <Text
                style={{ fontSize: 13, color: colors.gray600, marginLeft: 8 }}
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
                      backgroundColor: colors.gray400,
                      marginHorizontal: 8,
                    }}
                  />
                  <Users size={16} color={colors.gray600} strokeWidth={2} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.gray600,
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
              <BookOpen size={16} color="white" strokeWidth={2} />
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
                borderColor: colors.gray200,
              }}
            >
              <Users size={16} color={colors.gray600} strokeWidth={2} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.gray600,
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
                  ? colors.warningLight
                  : colors.primaryBg,
              }}
            >
              <Eye
                size={16}
                color={exam.isPublished ? colors.warning : colors.primary}
                strokeWidth={2}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: exam.isPublished ? colors.warning : colors.primary,
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
                backgroundColor: colors.errorLight,
              }}
            >
              <Trash2 size={18} color={colors.error} strokeWidth={2} />
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
}) => {
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={selected ? GRADIENTS.primary : [colors.gray100, colors.gray100]}
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
            color: selected ? "#FFFFFF" : colors.gray600,
          }}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

export default function TeacherExams() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);
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
      router.push(
        `/(teacher)/build-exam-enhanced?examId=${newExam._id}` as any
      );
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
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <LinearGradient
        colors={
          isDark
            ? ["#6366F1", "#4F46E5"]
            : (["#059669", "#047857"] as [string, string])
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
              <ArrowLeft size={22} color="white" strokeWidth={2.5} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>
                Exams
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
                Manage your question papers
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.95)",
              alignItems: "center",
              justifyContent: "center",
              ...SHADOWS.md,
            }}
          >
            <Plus
              size={26}
              color={isDark ? "#6366F1" : "#059669"}
              strokeWidth={2.5}
            />
          </Pressable>
        </View>
      </LinearGradient>

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
          color={colors.info}
        />
        <StatCard
          icon="checkmark-circle"
          label="Published"
          value={exams.filter((e) => e.isPublished).length}
          color={colors.primary}
        />
        <StatCard
          icon="create"
          label="Draft"
          value={exams.filter((e) => !e.isPublished).length}
          color={colors.warning}
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
            colors={[colors.primary]}
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
                backgroundColor: colors.gray100,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <FileText size={40} color={colors.gray400} strokeWidth={1.5} />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.gray700,
                marginBottom: 8,
              }}
            >
              No exams yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.gray500,
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
                router.push(
                  `/(teacher)/build-exam-enhanced?examId=${exam._id}` as any
                )
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
              backgroundColor: colors.white,
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
                    color: colors.gray900,
                  }}
                >
                  Create Exam
                </Text>
                <Text
                  style={{ fontSize: 14, color: colors.gray500, marginTop: 2 }}
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
                  backgroundColor: colors.gray100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} color={colors.gray600} strokeWidth={2} />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.gray700,
                marginBottom: 8,
              }}
            >
              Exam Title
            </Text>
            <TextInput
              placeholder="e.g., Mid-Term Physics Test"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.gray400}
              style={{
                borderWidth: 2,
                borderColor: title ? colors.primary : colors.gray200,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                marginBottom: 24,
                color: colors.gray800,
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
                    ? [colors.gray300, colors.gray300]
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
              backgroundColor: colors.white,
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
                    color: colors.gray900,
                  }}
                >
                  Assign Exam
                </Text>
                <Text
                  style={{ fontSize: 14, color: colors.gray500, marginTop: 2 }}
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
                  backgroundColor: colors.gray100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} color={colors.gray600} strokeWidth={2} />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.gray700,
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
                color: colors.gray700,
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
                    ? [colors.gray300, colors.gray300]
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
