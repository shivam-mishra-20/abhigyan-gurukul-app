import { RADIUS, SHADOWS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

export function QuickAction({
  title,
  subtitle,
  icon,
  color,
  bgColor,
  onPress,
  badge,
  disabled = false,
}: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={THEME.gray400} />
    </Pressable>
  );
}

// Horizontal scrollable quick action for shortcuts
export function QuickActionChip({
  title,
  icon,
  color,
  bgColor,
  onPress,
  active = false,
}: Pick<
  QuickActionProps,
  "title" | "icon" | "color" | "bgColor" | "onPress"
> & {
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <View
        style={[styles.chipIcon, { backgroundColor: active ? color : bgColor }]}
      >
        <Ionicons name={icon} size={18} color={active ? THEME.white : color} />
      </View>
      <Text
        style={[styles.chipText, active && { color: THEME.primary }]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  pressed: {
    backgroundColor: THEME.gray50,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: THEME.white,
  },
  badgeText: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    fontWeight: "700",
    color: THEME.white,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    color: THEME.gray900,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: THEME.gray500,
    marginTop: 2,
  },
  // Chip styles
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.white,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  chipActive: {
    backgroundColor: `${THEME.primary}10`,
    borderWidth: 1,
    borderColor: `${THEME.primary}30`,
  },
  chipPressed: {
    transform: [{ scale: 0.95 }],
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  chipText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: "600",
    color: THEME.gray700,
  },
});
