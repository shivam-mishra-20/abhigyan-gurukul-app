import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
};

interface NotificationSettings {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  examReminders?: boolean;
  doubtAlerts?: boolean;
  scheduleUpdates?: boolean;
  materialUpdates?: boolean;
  notesUpdates?: boolean;
}

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    examReminders: true,
    doubtAlerts: true,
    scheduleUpdates: true,
    materialUpdates: true,
    notesUpdates: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = await getUser();
      if (user?.settings) {
        setSettings({
          pushNotifications: user.settings.pushNotifications ?? true,
          emailNotifications: user.settings.emailNotifications ?? true,
          examReminders: user.settings.examReminders ?? true,
          doubtAlerts: user.settings.doubtAlerts ?? true,
          scheduleUpdates: user.settings.scheduleUpdates ?? true,
          materialUpdates: user.settings.materialUpdates ?? true,
          notesUpdates: user.settings.notesUpdates ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      setSaving(true);
      await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          settings: {
            ...settings,
            [key]: value,
          },
        }),
      });
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: !value }));
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notification Settings",
          headerShown: true,
          headerBackTitle: "Back",
          headerTintColor: THEME.primary,
        }}
      />
      <ScrollView style={styles.container}>
        {/* Header Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={THEME.primary} />
          <Text style={styles.infoText}>
            Manage your notification preferences for exams, schedule, materials,
            and more.
          </Text>
        </View>

        {/* Push Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>
                  Enable Push Notifications
                </Text>
                <Text style={styles.settingDescription}>
                  Receive push notifications on your device
                </Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) =>
                updateSetting("pushNotifications", value)
              }
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={
                settings.pushNotifications ? THEME.primary : "#f3f4f6"
              }
              disabled={saving}
            />
          </View>
        </View>

        {/* Activity Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="calendar" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Exam Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified about upcoming exams and assignments
                </Text>
              </View>
            </View>
            <Switch
              value={settings.examReminders}
              onValueChange={(value) => updateSetting("examReminders", value)}
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={settings.examReminders ? THEME.primary : "#f3f4f6"}
              disabled={saving || !settings.pushNotifications}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="time" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Schedule Updates</Text>
                <Text style={styles.settingDescription}>
                  Receive updates about class schedule changes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.scheduleUpdates}
              onValueChange={(value) => updateSetting("scheduleUpdates", value)}
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={settings.scheduleUpdates ? THEME.primary : "#f3f4f6"}
              disabled={saving || !settings.pushNotifications}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="help-circle" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Doubt Alerts</Text>
                <Text style={styles.settingDescription}>
                  Get notified when your doubts are answered
                </Text>
              </View>
            </View>
            <Switch
              value={settings.doubtAlerts}
              onValueChange={(value) => updateSetting("doubtAlerts", value)}
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={settings.doubtAlerts ? THEME.primary : "#f3f4f6"}
              disabled={saving || !settings.pushNotifications}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="book" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Materials Updates</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications about new study materials
                </Text>
              </View>
            </View>
            <Switch
              value={settings.materialUpdates}
              onValueChange={(value) => updateSetting("materialUpdates", value)}
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={settings.materialUpdates ? THEME.primary : "#f3f4f6"}
              disabled={saving || !settings.pushNotifications}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingContent}>
              <Ionicons name="document-text" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notes Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified when new notes are shared
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notesUpdates}
              onValueChange={(value) => updateSetting("notesUpdates", value)}
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={settings.notesUpdates ? THEME.primary : "#f3f4f6"}
              disabled={saving || !settings.pushNotifications}
            />
          </View>
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingContent}>
              <Ionicons name="mail" size={22} color={THEME.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive important updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) =>
                updateSetting("emailNotifications", value)
              }
              trackColor={{ false: "#d1d5db", true: THEME.primaryLight }}
              thumbColor={
                settings.emailNotifications ? THEME.primary : "#f3f4f6"
              }
              disabled={saving}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ecfdf5",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
  },
  section: {
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    padding: 16,
    paddingBottom: 12,
    backgroundColor: THEME.background,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
});
