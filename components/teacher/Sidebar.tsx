import { COLORS, RADIUS, SHADOWS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "home-outline", label: "Dashboard", route: "/(teacher)" },
  { icon: "document-text-outline", label: "Exams", route: "/(teacher)/exams" },
  {
    icon: "add-circle-outline",
    label: "Create Paper",
    route: "/(teacher)/create-paper",
  },
  {
    icon: "checkbox-outline",
    label: "Review Exams",
    route: "/(teacher)/reviews",
  },
  { icon: "people-outline", label: "My Batches", route: "/(teacher)/batches" },
  {
    icon: "school-outline",
    label: "All Students",
    route: "/(teacher)/students",
  },
  {
    icon: "bar-chart-outline",
    label: "Performance",
    route: "/(teacher)/performance",
  },
  {
    icon: "help-circle-outline",
    label: "Student Doubts",
    route: "/(teacher)/doubts",
  },
  {
    icon: "megaphone-outline",
    label: "Announcements",
    route: "/(teacher)/announcements",
  },
];

const SECONDARY_ITEMS: MenuItem[] = [
  { icon: "person-outline", label: "Profile", route: "/(teacher)/profile" },
  { icon: "settings-outline", label: "Settings", route: "/(teacher)/settings" },
  {
    icon: "help-buoy-outline",
    label: "Help & Support",
    route: "/(teacher)/help",
  },
];

export function TeacherSidebar({
  isOpen,
  onClose,
  userName = "Teacher",
  userRole = "Faculty",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen, overlayOpacity, translateX]);

  // Handle back button
  useEffect(() => {
    const handleBackPress = () => {
      if (isOpen) {
        onClose();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => subscription.remove();
  }, [isOpen, onClose]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0 ? "auto" : "none",
  }));

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const isActive = (route: string) => {
    if (route === "/(teacher)") {
      return pathname === "/(teacher)" || pathname === "/(teacher)/index";
    }
    return pathname.startsWith(route);
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -DRAWER_WIDTH);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -100 || e.velocityX < -500) {
        translateX.value = withSpring(-DRAWER_WIDTH, {
          damping: 20,
          stiffness: 90,
        });
        overlayOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
    });

  if (!isOpen && translateX.value <= -DRAWER_WIDTH + 10) {
    return null;
  }

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isOpen ? "auto" : "none"}
    >
      {/* Overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.drawer, drawerStyle]}>
          <View style={[styles.drawerContent]}>
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color={COLORS.white} />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.userName}>{userName}</Text>
                <View style={styles.roleContainer}>
                  <Ionicons
                    name="shield-checkmark"
                    size={12}
                    color={COLORS.primary}
                  />
                  <Text style={styles.userRole}>{userRole}</Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </Pressable>
            </View>

            {/* Menu Items */}
            <ScrollView
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.menuSection}>
                <Text style={styles.sectionLabel}>MAIN MENU</Text>
                {MENU_ITEMS.map((item) => (
                  <Pressable
                    key={item.route}
                    style={[
                      styles.menuItem,
                      isActive(item.route) && styles.menuItemActive,
                    ]}
                    onPress={() => handleNavigation(item.route)}
                  >
                    <View
                      style={[
                        styles.menuIconContainer,
                        isActive(item.route) && styles.menuIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          isActive(item.route)
                            ? (item.icon.replace("-outline", "") as any)
                            : item.icon
                        }
                        size={22}
                        color={
                          isActive(item.route) ? COLORS.primary : COLORS.gray500
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive(item.route) && styles.menuLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.badge && item.badge > 0 && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </Text>
                      </View>
                    )}
                    {isActive(item.route) && (
                      <View style={styles.activeIndicator} />
                    )}
                  </Pressable>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.menuSection}>
                <Text style={styles.sectionLabel}>SETTINGS</Text>
                {SECONDARY_ITEMS.map((item) => (
                  <Pressable
                    key={item.route}
                    style={[
                      styles.menuItem,
                      isActive(item.route) && styles.menuItemActive,
                    ]}
                    onPress={() => handleNavigation(item.route)}
                  >
                    <View
                      style={[
                        styles.menuIconContainer,
                        isActive(item.route) && styles.menuIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          isActive(item.route)
                            ? (item.icon.replace("-outline", "") as any)
                            : item.icon
                        }
                        size={22}
                        color={
                          isActive(item.route) ? COLORS.primary : COLORS.gray500
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive(item.route) && styles.menuLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={[
                styles.drawerFooter,
                { paddingBottom: insets.bottom + 16 },
              ]}
            >
              <Pressable style={styles.logoutButton}>
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={COLORS.error}
                />
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
              <Text style={styles.versionText}>Abhigyan Gurukul v1.0.0</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ============ Sidebar Context ============
const SidebarContext = React.createContext<{
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}>({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider
      value={{ isOpen, openSidebar, closeSidebar, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => React.useContext(SidebarContext);

// ============ Styles ============
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 101,
    backgroundColor: COLORS.white,
    ...SHADOWS.xl,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerText: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray900,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    color: COLORS.gray500,
    marginLeft: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray50,
  },
  menuScrollView: {
    flex: 1,
  },
  menuSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gray400,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    marginBottom: 4,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: COLORS.primaryBg,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.gray50,
  },
  menuIconContainerActive: {
    backgroundColor: COLORS.primaryMuted,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.gray700,
    marginLeft: 12,
  },
  menuLabelActive: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  menuBadge: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.full,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -12,
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 16,
    marginHorizontal: 12,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.errorLight,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.error,
    marginLeft: 12,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: "center",
    marginTop: 16,
  },
});

export default TeacherSidebar;
