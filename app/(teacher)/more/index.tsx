import { useRouter } from "expo-router";
import {
    Award,
    BarChart3,
    Bell,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    FolderOpen,
    HelpCircle,
    LogOut,
    Megaphone,
    Settings,
    User,
    Users,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useToast } from "@/lib/context";
import { useAuth } from "@/lib/hooks";

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  route: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: "Classroom",
    items: [
      {
        id: "schedule",
        title: "Class Schedule",
        subtitle: "View your teaching schedule",
        icon: FolderOpen,
        iconColor: "#ec4899",
        bgColor: "#fce7f3",
        route: "/(teacher)/more/schedule",
      },
      {
        id: "materials",
        title: "Study Materials",
        subtitle: "Upload & manage materials",
        icon: BookOpen,
        iconColor: "#8b5cf6",
        bgColor: "#ede9fe",
        route: "/(teacher)/more/materials",
      },
      {
        id: "homework",
        title: "Homework",
        subtitle: "Assign & track homework",
        icon: ClipboardList,
        iconColor: "#f59e0b",
        bgColor: "#fef3c7",
        route: "/(teacher)/more/homework",
      },
      {
        id: "students",
        title: "Students",
        subtitle: "View & manage students",
        icon: Users,
        iconColor: "#3b82f6",
        bgColor: "#dbeafe",
        route: "/(teacher)/students",
      },
      {
        id: "attendance",
        title: "My Attendance",
        subtitle: "View your attendance records",
        icon: FolderOpen,
        iconColor: "#8b5cf6",
        bgColor: "#ede9fe",
        route: "/(teacher)/more/attendance",
      },
      {
        id: "offline-results",
        title: "Offline Results",
        subtitle: "Manage test results",
        icon: Award,
        iconColor: "#10b981",
        bgColor: "#d1fae5",
        route: "/(teacher)/more/offline-results",
      },
      {
        id: "performance",
        title: "Performance",
        subtitle: "Track progress & stats",
        icon: BarChart3,
        iconColor: "#06b6d4",
        bgColor: "#cffafe",
        route: "/(teacher)/more/performance",
      },
      {
        id: "reviews",
        title: "Reviews",
        subtitle: "Tests to grade",
        icon: CheckCircle2,
        iconColor: "#10b981",
        bgColor: "#d1fae5",
        route: "/(teacher)/more/reviews",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        id: "notifications",
        title: "Notifications",
        subtitle: "View all notifications",
        icon: Bell,
        iconColor: "#f59e0b",
        bgColor: "#fef3c7",
        route: "/(teacher)/more/notifications",
      },
      {
        id: "announcements",
        title: "Announcements",
        subtitle: "Send updates to students",
        icon: Megaphone,
        iconColor: "#3b82f6",
        bgColor: "#dbeafe",
        route: "/(teacher)/more/announcements",
      },
      {
        id: "doubts",
        title: "Student Doubts",
        subtitle: "Answer questions",
        icon: HelpCircle,
        iconColor: "#f59e0b",
        bgColor: "#fef3c7",
        route: "/(teacher)/doubts",
      },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      {
        id: "profile",
        title: "My Profile",
        subtitle: "View & edit profile",
        icon: User,
        iconColor: "#6b7280",
        bgColor: "#f3f4f6",
        route: "/(teacher)/more/profile",
      },
      {
        id: "settings",
        title: "Settings",
        subtitle: "Preferences & notifications",
        icon: Settings,
        iconColor: "#6b7280",
        bgColor: "#f3f4f6",
        route: "/(teacher)/more/settings",
      },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            toast.success("Logged out successfully");
            router.replace("/splash" as any);
          } catch {
            toast.error("Failed to logout");
          }
        },
      },
    ]);
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Pressable
            onPress={() => navigateTo("/(teacher)/more/profile")}
            style={styles.profileContent}
          >
            <View style={styles.profileAvatar}>
              <User size={28} color="#059669" strokeWidth={2} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "Teacher"}</Text>
              <Text style={styles.profileEmail}>
                {user?.email || "teacher@example.com"}
              </Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Menu Categories */}
        {MENU_CATEGORIES.map((category) => (
          <View key={category.title} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.categoryItems}>
              {category.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => navigateTo(item.route)}
                    style={[
                      styles.menuItem,
                      index < category.items.length - 1 &&
                        styles.menuItemBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.menuIconContainer,
                        { backgroundColor: item.bgColor },
                      ]}
                    >
                      <Icon size={20} color={item.iconColor} strokeWidth={2} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" strokeWidth={2} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.logoutIconContainer}>
            <LogOut size={20} color="#dc2626" strokeWidth={2} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <ChevronRight size={18} color="#dc2626" strokeWidth={2} />
        </Pressable>

        {/* App Version */}
        <Text style={styles.versionText}>Abhigyan Gurukul v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  categoryItems: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    fontWeight: "500",
    color: "#dc2626",
  },
  versionText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },
});
