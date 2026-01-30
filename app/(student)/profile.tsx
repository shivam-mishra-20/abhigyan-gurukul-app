import { apiFetch } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { AttendanceSummary, getAttendanceSummary } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

// Theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

// Available target exams
const AVAILABLE_EXAMS = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "CET",
  "Board Exams",
  "CUET",
  "Olympiad",
  "Foundation",
];

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Profile image
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Target exams modal
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // Goals modal
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");

  const loadData = async () => {
    try {
      const [userData, attendanceData, storedExams, storedGoals] =
        await Promise.all([
          getUser(),
          getAttendanceSummary().catch(() => null),
          AsyncStorage.getItem("target_exams"),
          AsyncStorage.getItem("study_goals"),
        ]);
      setUser(userData);
      setAttendance(attendanceData);
      // Use server profile image URL, fallback to local storage
      if (userData?.profileImage) {
        setProfileImage(userData.profileImage);
      } else {
        const storedImage = await AsyncStorage.getItem("profile_image");
        setProfileImage(storedImage);
      }
      setSelectedExams(
        storedExams ? JSON.parse(storedExams) : userData?.targetExams || [],
      );
      setGoals(
        storedGoals ? JSON.parse(storedGoals) : userData?.studyGoals || [],
      );
      setEditName(userData?.name || "");
      setEditPhone(userData?.phone || "");
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/splash");
        },
      },
    ]);
  };

  // Pick and upload profile image to Firebase Storage
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri); // Show locally immediately

      try {
        // Upload to Firebase Storage via backend
        const formData = new FormData();
        const fileName = imageUri.split("/").pop() || "profile.jpg";
        const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

        formData.append("image", {
          uri: imageUri,
          name: fileName,
          type: fileType,
        } as any);

        const response = (await apiFetch("/api/auth/profile/image", {
          method: "POST",
          body: formData,
        })) as { profileImage: string; user: any };

        if (response?.profileImage) {
          setProfileImage(response.profileImage);
          // Update local user data with new profile image URL
          const updatedUser = { ...user, profileImage: response.profileImage };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        // Keep local image on error
        await AsyncStorage.setItem("profile_image", imageUri);
        Alert.alert(
          "Upload Failed",
          "Image saved locally. Will retry upload later.",
        );
      }
    }
  };

  // Save profile changes to server
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update profile via API
      const response = (await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: editName, phone: editPhone }),
      })) as any;

      // Update local storage user data
      const updatedUser = { ...user, ...response };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Fallback to local update
      const updatedUser = { ...user, name: editName, phone: editPhone };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      Alert.alert("Saved Locally", "Changes saved locally.");
    } finally {
      setSaving(false);
    }
  };

  // Save target exams
  const handleSaveExams = async () => {
    await AsyncStorage.setItem("target_exams", JSON.stringify(selectedExams));
    setShowExamsModal(false);
    // Sync with server
    try {
      await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ targetExams: selectedExams }),
      });
    } catch (error) {
      console.error("Error syncing target exams:", error);
    }
  };

  // Toggle exam selection
  const toggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam],
    );
  };

  // Add goal
  const addGoal = async () => {
    if (newGoal.trim()) {
      const updatedGoals = [...goals, newGoal.trim()];
      setGoals(updatedGoals);
      setNewGoal("");
      await AsyncStorage.setItem("study_goals", JSON.stringify(updatedGoals));
      // Sync with server
      try {
        await apiFetch("/api/auth/profile", {
          method: "PATCH",
          body: JSON.stringify({ studyGoals: updatedGoals }),
        });
      } catch (error) {
        console.error("Error syncing study goals:", error);
      }
    }
  };

  // Remove goal
  const removeGoal = async (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    await AsyncStorage.setItem("study_goals", JSON.stringify(updatedGoals));
    // Sync with server
    try {
      await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ studyGoals: updatedGoals }),
      });
    } catch (error) {
      console.error("Error syncing study goals:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const displayExams =
    selectedExams.length > 0 ? selectedExams : user?.targetExams || [];
  const firstInitial = (user?.name || "S").charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(user?.name || "Student");

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            {/* Avatar with Edit Button */}
            <Pressable onPress={pickImage} style={styles.avatarContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarText}>{firstInitial}</Text>
                </View>
              )}
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </Pressable>

            <Text style={styles.userName}>{user?.name || "Student"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            {/* Edit Profile Button */}
            <Pressable
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="pencil" size={14} color="white" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </Pressable>

            {/* Badges */}
            <View style={styles.badgeRow}>
              {user?.classLevel && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{user.classLevel}</Text>
                </View>
              )}
              {user?.batch && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{user.batch}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Target Exams */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="school" size={20} color={THEME.primary} />
                <Text style={styles.cardTitle}>Target Exams</Text>
              </View>
              <Pressable onPress={() => setShowExamsModal(true)}>
                <Text style={[styles.linkText, { color: THEME.primary }]}>
                  Switch
                </Text>
              </Pressable>
            </View>
            <View style={styles.chipContainer}>
              {displayExams.length > 0 ? (
                displayExams.map((exam: string, idx: number) => (
                  <View key={idx} style={styles.examChip}>
                    <Text style={styles.examChipText}>{exam}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  Tap Switch to select your target exams
                </Text>
              )}
            </View>
          </View>

          {/* Study Goals */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="flag" size={20} color={THEME.primary} />
                <Text style={styles.cardTitle}>Study Goals</Text>
              </View>
              <Pressable onPress={() => setShowGoalsModal(true)}>
                <Text style={[styles.linkText, { color: THEME.primary }]}>
                  {goals.length > 0 ? "Edit" : "Add"}
                </Text>
              </Pressable>
            </View>
            {goals.length > 0 ? (
              <View style={styles.goalsList}>
                {goals.map((goal, idx) => (
                  <View key={idx} style={styles.goalItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={THEME.primary}
                    />
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Set your study goals to stay motivated!
              </Text>
            )}
          </View>

          {/* Attendance Summary */}
          {attendance && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="calendar" size={20} color={THEME.primary} />
                  <Text style={styles.cardTitle}>Attendance</Text>
                </View>
                <Pressable
                  onPress={() => router.push("/(student)/modules/attendance")}
                >
                  <Text style={[styles.linkText, { color: THEME.primary }]}>
                    View
                  </Text>
                </Pressable>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{attendance.percentage}%</Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: THEME.primary }]}>
                    {attendance.presentDays}
                  </Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{attendance.totalDays}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick Access */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/(student)/modules/results")}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#f3e8ff" }]}>
                <Ionicons name="trophy" size={20} color="#7c3aed" />
              </View>
              <Text style={styles.menuText}>My Results</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/(student)/modules/progress")}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="stats-chart" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.menuText}>Performance Analytics</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Pressable
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push("/(student)/modules/leaderboard")}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="podium" size={20} color="#2563eb" />
              </View>
              <Text style={styles.menuText}>Leaderboard</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Settings */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Pressable
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push("/(student)/settings/notifications")}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#f3f4f6" }]}>
                <Ionicons name="notifications" size={20} color="#6b7280" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.input, { backgroundColor: "#f3f4f6" }]}>
                <Text style={{ color: "#6b7280" }}>{user?.email}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Target Exams Modal */}
      <Modal visible={showExamsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Exams</Text>
              <Pressable onPress={() => setShowExamsModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <View style={styles.examOptions}>
              {AVAILABLE_EXAMS.map((exam) => (
                <Pressable
                  key={exam}
                  style={[
                    styles.examOption,
                    selectedExams.includes(exam) && styles.examOptionSelected,
                  ]}
                  onPress={() => toggleExam(exam)}
                >
                  <Text
                    style={[
                      styles.examOptionText,
                      selectedExams.includes(exam) &&
                        styles.examOptionTextSelected,
                    ]}
                  >
                    {exam}
                  </Text>
                  {selectedExams.includes(exam) && (
                    <Ionicons name="checkmark" size={18} color="white" />
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveExams}>
              <Text style={styles.saveButtonText}>Save Exams</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Goals Modal */}
      <Modal visible={showGoalsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Study Goals</Text>
              <Pressable onPress={() => setShowGoalsModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <View style={styles.addGoalRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 12 }]}
                value={newGoal}
                onChangeText={setNewGoal}
                placeholder="Add a new goal..."
                placeholderTextColor="#9ca3af"
              />
              <Pressable style={styles.addGoalButton} onPress={addGoal}>
                <Ionicons name="add" size={24} color="white" />
              </Pressable>
            </View>

            <ScrollView style={styles.goalsScrollView}>
              {goals.map((goal, idx) => (
                <View key={idx} style={styles.goalEditItem}>
                  <Text style={styles.goalEditText}>{goal}</Text>
                  <Pressable onPress={() => removeGoal(idx)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
              {goals.length === 0 && (
                <Text style={styles.emptyModalText}>
                  No goals yet. Add your first study goal!
                </Text>
              )}
            </ScrollView>

            <Pressable
              style={styles.saveButton}
              onPress={() => setShowGoalsModal(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
    backgroundColor: "white",
  },
  header: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: THEME.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: THEME.primaryDark,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  examChip: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  examChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.primary,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  goalsList: {
    gap: 10,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#374151",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  saveButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  examOptions: {
    gap: 10,
    marginBottom: 16,
  },
  examOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  examOptionSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  examOptionText: {
    fontSize: 15,
    color: "#374151",
  },
  examOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  addGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addGoalButton: {
    backgroundColor: THEME.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  goalsScrollView: {
    maxHeight: 200,
    marginBottom: 8,
  },
  goalEditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 8,
  },
  goalEditText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    marginRight: 12,
  },
  emptyModalText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 24,
  },
});
