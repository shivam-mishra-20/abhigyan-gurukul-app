import { RADIUS, SHADOWS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  gradient?: [string, string];
  onPress?: () => void;
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  gradient,
  onPress,
  subtitle,
  loading = false,
}: StatCardProps) {
  const content = (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        {loading ? (
          <View style={styles.loadingValue} />
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={THEME.gray400} />
      )}
    </View>
  );

  if (gradient) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, onPress && styles.pressable]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        onPress && styles.pressable,
        pressed && onPress && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

// Compact version for grid layout
export function CompactStatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  onPress,
  loading = false,
}: Omit<StatCardProps, "gradient" | "subtitle">) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.compactCard,
        onPress && styles.pressable,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={[styles.compactIconWrapper, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      {loading ? (
        <View style={styles.loadingValueCompact} />
      ) : (
        <Text style={styles.compactValue}>{value}</Text>
      )}
      <Text style={styles.compactTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  gradientCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  pressable: {
    cursor: "pointer",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    ...TYPOGRAPHY.h3,
    color: THEME.gray900,
  },
  title: {
    ...TYPOGRAPHY.caption,
    color: THEME.gray500,
    marginTop: 2,
  },
  subtitle: {
    ...TYPOGRAPHY.small,
    color: THEME.gray400,
    marginTop: 2,
  },
  loadingValue: {
    width: 60,
    height: 28,
    backgroundColor: THEME.gray200,
    borderRadius: RADIUS.sm,
  },
  // Compact styles
  compactCard: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.sm,
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  compactIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  compactValue: {
    ...TYPOGRAPHY.h2,
    color: THEME.gray900,
  },
  compactTitle: {
    ...TYPOGRAPHY.caption,
    color: THEME.gray500,
    marginTop: 4,
    textAlign: "center",
  },
  loadingValueCompact: {
    width: 40,
    height: 32,
    backgroundColor: THEME.gray200,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
});
