import { GRADIENTS, SHADOWS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DashboardHeaderProps {
  userName: string;
  greeting?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export function DashboardHeader({
  userName,
  greeting,
  onProfilePress,
  onNotificationPress,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + SPACING.md }]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {userName || "Teacher"}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {onNotificationPress && (
            <Pressable
              onPress={onNotificationPress}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={THEME.white}
              />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {onProfilePress && (
            <Pressable
              onPress={onProfilePress}
              style={({ pressed }) => [
                styles.profileButton,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <Ionicons name="person" size={20} color={THEME.primary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Decorative wave */}
      <View style={styles.wave} />
    </LinearGradient>
  );
}

// Compact header variant for inner screens
export function CompactHeader({
  title,
  subtitle,
  onBackPress,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.compactContainer, { paddingTop: insets.top + SPACING.sm }]}
    >
      <View style={styles.compactContent}>
        {onBackPress && (
          <Pressable onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={THEME.white} />
          </Pressable>
        )}
        <View style={styles.compactTextContainer}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.compactSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 16, // Extra space for wave
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.body,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: THEME.white,
    marginTop: 4,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.white,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.white,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  profileButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  wave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: "transparent",
  },
  // Compact styles
  compactContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    ...TYPOGRAPHY.h3,
    color: THEME.white,
  },
  compactSubtitle: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
  },
  rightAction: {
    marginLeft: SPACING.md,
  },
});
