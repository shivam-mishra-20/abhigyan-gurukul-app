import { apiFetch } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { useAppTheme } from "@/lib/context";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_STORAGE_KEY = "@teacher_settings";

interface Settings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  examReminders: boolean;
  doubtAlerts: boolean;
  autoSave: boolean;
  language: string;
}

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
}: SettingItemProps) => {
  const { isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 bg-white dark:bg-dark-card"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3.5 ${
          danger
            ? "bg-red-100 dark:bg-red-900/30"
            : "bg-primary-100 dark:bg-primary-900/30"
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            danger
              ? isDark
                ? "#FCA5A5"
                : "#DC2626"
              : isDark
              ? "#A3CF47"
              : "#6EA530"
          }
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{
            false: isDark ? "#475569" : "#E5E7EB",
            true: isDark ? "#6EA530" : "#A3CF47",
          }}
          thumbColor={
            toggleValue ? (isDark ? "#8BC53F" : "#6EA530") : "#9CA3AF"
          }
        />
      ) : !danger ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#9CA3AF" : "#9CA3AF"}
        />
      ) : null}
    </Pressable>
  );
};

const Divider = () => (
  <View className="h-px bg-gray-100 dark:bg-gray-700 ml-14" />
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-6 mb-2.5 mx-5 uppercase tracking-wider">
    {title}
  </Text>
);

export default function SettingsPage() {
  const router = useRouter();
  const { isDark, themeMode, setThemeMode } = useAppTheme();
  const [user, setUser] = useState<any>(null);

  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    emailNotifications: true,
    examReminders: true,
    doubtAlerts: true,
    autoSave: true,
    language: "English",
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
    const userData = await getUser();
    setUser(userData);
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

      // Sync to backend
      try {
        await apiFetch("/api/users/me/settings", {
          method: "PUT",
          body: JSON.stringify(updated),
        });
      } catch (error) {
        console.log("Backend sync failed, but saved locally", error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
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
      await apiFetch("/api/users/me/change-password", {
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

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-dark-background"
      edges={["top"]}
    >
      {/* Header */}
      <View className="px-2.5 py-5 mb-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#F9FAFB" : "#000"}
            />
          </Pressable>
          <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View className="bg-white dark:bg-dark-card rounded-2xl mx-4 overflow-hidden shadow-sm">
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
        <View className="bg-white dark:bg-dark-card rounded-2xl mx-4 overflow-hidden shadow-sm">
          <SettingItem
            icon="notifications-outline"
            label="Push Notifications"
            description="Receive push notifications"
            toggle
            toggleValue={settings.pushNotifications}
            onToggle={(value) => saveSettings({ pushNotifications: value })}
          />
          <Divider />
          <SettingItem
            icon="mail-outline"
            label="Email Notifications"
            description="Receive email updates"
            toggle
            toggleValue={settings.emailNotifications}
            onToggle={(value) => saveSettings({ emailNotifications: value })}
          />
          <Divider />
          <SettingItem
            icon="calendar-outline"
            label="Exam Reminders"
            description="Get notified about upcoming exams"
            toggle
            toggleValue={settings.examReminders}
            onToggle={(value) => saveSettings({ examReminders: value })}
          />
          <Divider />
          <SettingItem
            icon="help-circle-outline"
            label="Doubt Alerts"
            description="Notify when students ask doubts"
            toggle
            toggleValue={settings.doubtAlerts}
            onToggle={(value) => saveSettings({ doubtAlerts: value })}
          />
        </View>

        {/* App Settings Section */}
        <SectionHeader title="App Settings" />
        <View className="bg-white dark:bg-dark-card rounded-2xl mx-4 overflow-hidden shadow-sm">
          <SettingItem
            icon={isDark ? "moon" : "moon-outline"}
            label="Theme"
            description={getThemeLabel()}
            onPress={() => setShowThemeModal(true)}
          />
          <Divider />
          <SettingItem
            icon="save-outline"
            label="Auto Save"
            description="Auto-save drafts while creating papers"
            toggle
            toggleValue={settings.autoSave}
            onToggle={(value) => saveSettings({ autoSave: value })}
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
        <View className="bg-white dark:bg-dark-card rounded-2xl mx-4 overflow-hidden shadow-sm">
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
        <View className="bg-white dark:bg-dark-card rounded-2xl mx-4 overflow-hidden shadow-sm">
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
        <Text className="text-center text-gray-400 dark:text-gray-500 text-xs mt-6">
          Abhigyan Gurukul v1.0.0
        </Text>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Change Password
              </Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#9CA3AF" : "#9CA3AF"}
                />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current Password
              </Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, currentPassword: text })
                }
                placeholder="Enter current password"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
                className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3.5 text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-dark-surface"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                New Password
              </Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, newPassword: text })
                }
                placeholder="Enter new password"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
                className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3.5 text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-dark-surface"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Confirm Password
              </Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: text })
                }
                placeholder="Confirm new password"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
                className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3.5 text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-dark-surface"
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              disabled={changingPassword}
              className={`py-4 rounded-xl items-center ${
                changingPassword ? "bg-gray-400" : "bg-primary-600"
              }`}
            >
              <Text className="text-white text-base font-semibold">
                {changingPassword ? "Changing..." : "Change Password"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal visible={showThemeModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Choose Theme
              </Text>
              <Pressable onPress={() => setShowThemeModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#9CA3AF" : "#9CA3AF"}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setThemeMode("light");
                setShowThemeModal(false);
              }}
              className="flex-row items-center py-4 px-4 mb-2 rounded-xl bg-gray-50 dark:bg-gray-700"
            >
              <Ionicons
                name={
                  themeMode === "light" ? "radio-button-on" : "radio-button-off"
                }
                size={24}
                color={themeMode === "light" ? "#8BC53F" : "#9CA3AF"}
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Light
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Always use light theme
                </Text>
              </View>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
            </Pressable>

            <Pressable
              onPress={() => {
                setThemeMode("dark");
                setShowThemeModal(false);
              }}
              className="flex-row items-center py-4 px-4 mb-2 rounded-xl bg-gray-50 dark:bg-gray-700"
            >
              <Ionicons
                name={
                  themeMode === "dark" ? "radio-button-on" : "radio-button-off"
                }
                size={24}
                color={themeMode === "dark" ? "#8BC53F" : "#9CA3AF"}
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Dark
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Always use dark theme
                </Text>
              </View>
              <Ionicons name="moon" size={24} color="#6366F1" />
            </Pressable>

            <Pressable
              onPress={() => {
                setThemeMode("system");
                setShowThemeModal(false);
              }}
              className="flex-row items-center py-4 px-4 rounded-xl bg-gray-50 dark:bg-gray-700"
            >
              <Ionicons
                name={
                  themeMode === "system"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={themeMode === "system" ? "#8BC53F" : "#9CA3AF"}
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  System Default
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Match your device settings
                </Text>
              </View>
              <Ionicons name="phone-portrait" size={24} color="#8B5CF6" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
