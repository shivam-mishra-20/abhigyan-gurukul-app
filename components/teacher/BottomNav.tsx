import { COLORS, SHADOWS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface TabItem {
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  {
    route: "/(teacher)",
    icon: "home-outline",
    iconActive: "home",
  },
  {
    route: "/(teacher)/exams",
    icon: "document-text-outline",
    iconActive: "document-text",
  },
  {
    route: "/(teacher)/reviews",
    icon: "checkmark-circle-outline",
    iconActive: "checkmark-circle",
  },
  {
    route: "/(teacher)/profile",
    icon: "person-outline",
    iconActive: "person",
  },
];

export function CustomBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    const normalizedPath = pathname.replace(/\/index$/, "");
    const normalizedRoute = route.replace(/\/index$/, "");

    if (normalizedRoute === "/(teacher)") {
      return (
        normalizedPath === "/(teacher)" || normalizedPath === "/(teacher)/index"
      );
    }
    return normalizedPath === normalizedRoute;
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const active = isActive(tab.route);
          return (
            <Pressable
              key={tab.route}
              onPress={() => handleNavigation(tab.route)}
              style={styles.tabButton}
            >
              <View
                style={[styles.iconWrapper, active && styles.iconWrapperActive]}
              >
                <Ionicons
                  name={active ? tab.iconActive : tab.icon}
                  size={24}
                  color={active ? COLORS.white : COLORS.gray400}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOWS.lg,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: COLORS.primary,
  },
});

export default CustomBottomNav;
