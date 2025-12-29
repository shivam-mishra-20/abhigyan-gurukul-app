import { COLORS, SHADOWS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

const SettingItem = ({
  icon,
  label,
  description,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
}: SettingItemProps) => (
  <Pressable
    onPress={onPress}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: "#fff",
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: danger ? "#FEE2E2" : COLORS.primaryBg,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
      }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? "#DC2626" : COLORS.primary}
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: danger ? "#DC2626" : COLORS.gray800,
        }}
      >
        {label}
      </Text>
      {description && (
        <Text style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>
          {description}
        </Text>
      )}
    </View>
    {toggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
        thumbColor={toggleValue ? COLORS.primary : COLORS.gray400}
      />
    ) : !danger ? (
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
    ) : null}
  </Pressable>
);

const Divider = () => (
  <View
    style={{ height: 1, backgroundColor: COLORS.gray100, marginLeft: 70 }}
  />
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text
    style={{
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.gray500,
      marginTop: 24,
      marginBottom: 10,
      marginLeft: 20,
      textTransform: "uppercase",
    }}
  >
    {title}
  </Text>
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [doubtAlerts, setDoubtAlerts] = useState(true);

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
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
          await logout();
          router.replace("/splash");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is irreversible. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Info", "Please contact admin to delete your account.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
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
          <Ionicons name="arrow-back" size={22} color="#000" />
        </Pressable>
        <Text style={{ color: "#000", fontSize: 20, fontWeight: "700" }}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            marginHorizontal: 16,
            overflow: "hidden",
            ...SHADOWS.sm,
          }}
        >
          <SettingItem
            icon="person-outline"
            label="Profile Information"
            description={user?.email || "Update your profile"}
            onPress={() => router.push("/(teacher)/profile")}
          />
          <Divider />
          <SettingItem
            icon="lock-closed-outline"
            label="Change Password"
            description="Update your password"
            onPress={() => setShowPasswordModal(true)}
          />
          <Divider />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            description="Manage your data privacy"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Privacy settings will be available soon."
              )
            }
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            marginHorizontal: 16,
            overflow: "hidden",
            ...SHADOWS.sm,
          }}
        >
          <SettingItem
            icon="notifications-outline"
            label="Push Notifications"
            description="Receive push notifications"
            toggle
            toggleValue={pushNotifications}
            onToggle={setPushNotifications}
          />
          <Divider />
          <SettingItem
            icon="mail-outline"
            label="Email Notifications"
            description="Receive email updates"
            toggle
            toggleValue={emailNotifications}
            onToggle={setEmailNotifications}
          />
          <Divider />
          <SettingItem
            icon="calendar-outline"
            label="Exam Reminders"
            description="Get notified about upcoming exams"
            toggle
            toggleValue={examReminders}
            onToggle={setExamReminders}
          />
          <Divider />
          <SettingItem
            icon="help-circle-outline"
            label="Doubt Alerts"
            description="Notify when students ask doubts"
            toggle
            toggleValue={doubtAlerts}
            onToggle={setDoubtAlerts}
          />
        </View>

        {/* App Settings Section */}
        <SectionHeader title="App Settings" />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            marginHorizontal: 16,
            overflow: "hidden",
            ...SHADOWS.sm,
          }}
        >
          <SettingItem
            icon="moon-outline"
            label="Dark Mode"
            description="Switch to dark theme"
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <Divider />
          <SettingItem
            icon="save-outline"
            label="Auto Save"
            description="Auto-save drafts while creating papers"
            toggle
            toggleValue={autoSave}
            onToggle={setAutoSave}
          />
          <Divider />
          <SettingItem
            icon="language-outline"
            label="Language"
            description="English"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Language settings will be available soon."
              )
            }
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            marginHorizontal: 16,
            overflow: "hidden",
            ...SHADOWS.sm,
          }}
        >
          <SettingItem
            icon="help-buoy-outline"
            label="Help Center"
            description="Get help and support"
            onPress={() =>
              Alert.alert("Help", "Contact support@abhigyangurukul.com")
            }
          />
          <Divider />
          <SettingItem
            icon="chatbubble-outline"
            label="Send Feedback"
            description="Share your thoughts"
            onPress={() =>
              Alert.alert("Feedback", "Thank you for your feedback!")
            }
          />
          <Divider />
          <SettingItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => Alert.alert("Terms", "Terms of Service")}
          />
          <Divider />
          <SettingItem
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => Alert.alert("Privacy", "Privacy Policy")}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            marginHorizontal: 16,
            overflow: "hidden",
            ...SHADOWS.sm,
          }}
        >
          <SettingItem
            icon="log-out-outline"
            label="Logout"
            danger
            onPress={handleLogout}
          />
          <Divider />
          <SettingItem
            icon="trash-outline"
            label="Delete Account"
            danger
            onPress={handleDeleteAccount}
          />
        </View>

        {/* Version */}
        <Text
          style={{
            textAlign: "center",
            color: COLORS.gray400,
            fontSize: 12,
            marginTop: 24,
          }}
        >
          Abhigyan Gurukul v1.0.0
        </Text>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
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
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: COLORS.gray900,
                }}
              >
                Change Password
              </Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray400} />
              </Pressable>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, color: COLORS.gray600, marginBottom: 8 }}
              >
                Current Password
              </Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, currentPassword: text })
                }
                placeholder="Enter current password"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray200,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: COLORS.gray800,
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, color: COLORS.gray600, marginBottom: 8 }}
              >
                New Password
              </Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, newPassword: text })
                }
                placeholder="Enter new password"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray200,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: COLORS.gray800,
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{ fontSize: 14, color: COLORS.gray600, marginBottom: 8 }}
              >
                Confirm Password
              </Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: text })
                }
                placeholder="Confirm new password"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray200,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: COLORS.gray800,
                }}
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              disabled={changingPassword}
              style={{
                backgroundColor: changingPassword
                  ? COLORS.gray400
                  : COLORS.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {changingPassword ? "Changing..." : "Change Password"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
