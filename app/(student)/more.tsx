import { logout } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
};

// Menu items with icons and colors
const MENU_SECTIONS = [
  {
    title: "Learning",
    items: [
      {
        id: "exams",
        title: "Online Exams",
        icon: "document-text",
        route: "/(student)/modules/exams",
        color: "#3b82f6",
      },
      {
        id: "results",
        title: "Results",
        icon: "trophy",
        route: "/(student)/modules/results",
        color: "#f59e0b",
      },
      {
        id: "offline-results",
        title: "Offline Results",
        icon: "clipboard",
        route: "/(student)/modules/offline-results",
        color: "#14b8a6",
      },
      {
        id: "materials",
        title: "Study Materials",
        icon: "folder-open",
        route: "/(student)/modules/materials",
        color: "#8b5cf6",
      },
      {
        id: "homework",
        title: "Homework",
        icon: "book",
        route: "/(student)/modules/homework",
        color: "#f97316",
      },
    ],
  },
  {
    title: "Schedule & Activity",
    items: [
      {
        id: "attendance",
        title: "Attendance",
        icon: "calendar",
        route: "/(student)/modules/attendance",
        color: "#10b981",
      },
      {
        id: "schedule",
        title: "Class Schedule",
        icon: "time",
        route: "/(student)/modules/schedule",
        color: "#ec4899",
      },
      {
        id: "leaderboard",
        title: "Leaderboard",
        icon: "podium",
        route: "/(student)/modules/leaderboard",
        color: "#f97316",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "doubts",
        title: "My Doubts",
        icon: "chatbubble-ellipses",
        route: "/(student)/doubts",
        color: "#8b5cf6",
      },
      {
        id: "profile",
        title: "Profile",
        icon: "person",
        route: "/(student)/profile",
        color: "#059669",
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: "notifications",
        route: "/(student)/modules/notifications",
        color: "#6366f1",
      },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="apps" size={24} color="white" />
        </View>
        <View>
          <Text style={styles.headerTitle}>More</Text>
          <Text style={styles.headerSubtitle}>Features & Settings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuGrid}>
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(item.route as any)}
                  style={styles.menuItem}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: item.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: THEME.primary,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuGrid: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
});
