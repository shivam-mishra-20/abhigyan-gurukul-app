import { apiFetch } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Settings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  examReminders: boolean;
  doubtAlerts: boolean;
  autoSave: boolean;
}

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
};

export default function SettingsPage() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useAppTheme();
  const [user, setUser] = useState<any>(null);
  // const [loading, setLoading] = useState(false); // Commented out - not used

  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    emailNotifications: true,
    examReminders: true,
    doubtAlerts: true,
    autoSave: true,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const userData = await getUser();

      // Try to load from AsyncStorage first
      const savedSettings = await AsyncStorage.getItem(
        `@teacher_settings_${userData?.id}`,
      );

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else if (userData?.settings) {
        setSettings({
          pushNotifications: userData.settings.pushNotifications ?? true,
          emailNotifications: userData.settings.emailNotifications ?? true,
          examReminders: userData.settings.examReminders ?? true,
          doubtAlerts: userData.settings.doubtAlerts ?? true,
          autoSave: userData.settings.autoSave ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    const oldValue = settings[key];
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      // Save to AsyncStorage for local persistence
      await AsyncStorage.setItem(
        `@teacher_settings_${user?.id}`,
        JSON.stringify(newSettings),
      );
    } catch (error) {
      console.error("Error updating setting:", error);
      setSettings((prev) => ({ ...prev, [key]: oldValue }));
      Alert.alert("Error", "Failed to update setting");
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      Alert.alert("Success", "Password changed successfully");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/splash");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  /* Commented out - not used
  const getThemeLabel = () => {
    switch (themeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System Default";
      default:
        return "System Default";
    }
  };
  */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color={THEME.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Teacher"}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(teacher)/more/profile")}
            style={styles.editProfileButton}
          >
            <Ionicons name="create-outline" size={18} color={THEME.primary} />
          </Pressable>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              description="Receive push notifications on your device"
              value={settings.pushNotifications}
              onToggle={(value) => updateSetting("pushNotifications", value)}
            />
            {/* <Divider />
            <SettingItem
              icon="mail"
              title="Email Notifications"
              description="Get updates via email"
              value={settings.emailNotifications}
              onToggle={(value) => updateSetting("emailNotifications", value)}
            /> */}
            <Divider />
            <SettingItem
              icon="calendar"
              title="Exam Reminders"
              description="Reminders for upcoming exams"
              value={settings.examReminders}
              onToggle={(value) => updateSetting("examReminders", value)}
            />
            <Divider />
            <SettingItem
              icon="help-circle"
              title="Doubt Alerts"
              description="Notify when students ask doubts"
              value={settings.doubtAlerts}
              onToggle={(value) => updateSetting("doubtAlerts", value)}
            />
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            {/* <Pressable
              onPress={() => setShowThemeModal(true)}
              style={styles.settingRow}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}
              >
                <Ionicons name="moon" size={20} color="#f59e0b" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Theme</Text>
                <Text style={styles.settingDescription}>{getThemeLabel()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Divider /> */}
            <SettingItem
              icon="save"
              title="Auto Save"
              description="Auto-save drafts while creating content"
              value={settings.autoSave}
              onToggle={(value) => updateSetting("autoSave", value)}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <Pressable
              onPress={() => setShowPasswordModal(true)}
              style={styles.settingRow}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#dbeafe" }]}
              >
                <Ionicons name="lock-closed" size={20} color="#3b82f6" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out" size={20} color="#dc2626" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* App Version */}
        <Text style={styles.versionText}>Abhigyan Gurukul v1.0.0</Text>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, currentPassword: text })
                }
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, newPassword: text })
                }
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: text })
                }
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              disabled={changingPassword}
              style={[
                styles.submitButton,
                changingPassword && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {changingPassword ? "Changing..." : "Change Password"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal visible={showThemeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <Pressable onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setThemeMode("light");
                setShowThemeModal(false);
              }}
              style={styles.themeOption}
            >
              <Ionicons
                name={
                  themeMode === "light" ? "radio-button-on" : "radio-button-off"
                }
                size={24}
                color={themeMode === "light" ? THEME.primary : "#9ca3af"}
              />
              <View style={styles.themeOptionContent}>
                <Text style={styles.themeOptionTitle}>Light</Text>
                <Text style={styles.themeOptionDescription}>
                  Always use light theme
                </Text>
              </View>
              <Ionicons name="sunny" size={24} color="#f59e0b" />
            </Pressable>

            <Pressable
              onPress={() => {
                setThemeMode("dark");
                setShowThemeModal(false);
              }}
              style={styles.themeOption}
            >
              <Ionicons
                name={
                  themeMode === "dark" ? "radio-button-on" : "radio-button-off"
                }
                size={24}
                color={themeMode === "dark" ? THEME.primary : "#9ca3af"}
              />
              <View style={styles.themeOptionContent}>
                <Text style={styles.themeOptionTitle}>Dark</Text>
                <Text style={styles.themeOptionDescription}>
                  Always use dark theme
                </Text>
              </View>
              <Ionicons name="moon" size={24} color="#6366f1" />
            </Pressable>

            <Pressable
              onPress={() => {
                setThemeMode("system");
                setShowThemeModal(false);
              }}
              style={styles.themeOption}
            >
              <Ionicons
                name={
                  themeMode === "system"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={themeMode === "system" ? THEME.primary : "#9ca3af"}
              />
              <View style={styles.themeOptionContent}>
                <Text style={styles.themeOptionTitle}>System Default</Text>
                <Text style={styles.themeOptionDescription}>
                  Match your device settings
                </Text>
              </View>
              <Ionicons name="phone-portrait" size={24} color="#8b5cf6" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function SettingItem({
  icon,
  title,
  description,
  value,
  onToggle,
}: SettingItemProps) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.iconContainer, { backgroundColor: "#ecfdf5" }]}>
        <Ionicons name={icon} size={20} color={THEME.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: "#e5e7eb",
          true: THEME.primaryLight,
        }}
        thumbColor={value ? THEME.primary : "#9ca3af"}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#dc2626",
  },
  versionText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  submitButton: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  themeOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  themeOptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  themeOptionDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
});
