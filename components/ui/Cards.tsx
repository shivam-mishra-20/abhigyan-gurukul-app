import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// ============ Animated Card ============
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined" | "gradient";
  gradientColors?: [string, string];
}

export function Card({
  children,
  style,
  onPress,
  variant = "default",
  gradientColors,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const baseStyle: ViewStyle = {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {},
    elevated: SHADOWS.lg,
    outlined: {
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    gradient: {},
  };

  const content = (
    <Animated.View
      style={[baseStyle, variantStyles[variant], style, animatedStyle]}
    >
      {variant === "gradient" ? (
        <LinearGradient
          colors={gradientColors || GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.xl }]}
        />
      ) : null}
      <View style={{ position: "relative", zIndex: 1 }}>{children}</View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

// ============ Stat Card ============
interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  value: string | number;
  label: string;
  trend?: { value: number; isUp: boolean };
  onPress?: () => void;
}

export function StatCard({
  icon,
  iconColor = COLORS.primary,
  iconBgColor = COLORS.primaryMuted,
  value,
  label,
  trend,
  onPress,
}: StatCardProps) {
  return (
    <Card onPress={onPress} style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.isUp ? "trending-up" : "trending-down"}
            size={14}
            color={trend.isUp ? COLORS.success : COLORS.error}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend.isUp ? COLORS.success : COLORS.error },
            ]}
          >
            {trend.value}%
          </Text>
        </View>
      )}
    </Card>
  );
}

// ============ Glass Stat Card (For Header) ============
interface GlassStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
}

export function GlassStatCard({ icon, value, label }: GlassStatCardProps) {
  return (
    <View style={styles.glassCard}>
      <Ionicons name={icon} size={20} color="white" />
      <Text style={styles.glassValue}>{value}</Text>
      <Text style={styles.glassLabel}>{label}</Text>
    </View>
  );
}

// ============ Action Card ============
interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: number;
}

export function ActionCard({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  onPress,
  badge,
}: ActionCardProps) {
  return (
    <Card onPress={onPress} style={styles.actionCard}>
      <View style={styles.actionCardContent}>
        <View
          style={[styles.actionIconContainer, { backgroundColor: iconBgColor }]}
        >
          <Ionicons name={icon} size={24} color={iconColor} />
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </Card>
  );
}

// ============ List Item Card ============
interface ListItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ListItem({
  icon,
  iconColor = COLORS.gray600,
  iconBgColor = COLORS.gray100,
  title,
  subtitle,
  rightElement,
  onPress,
  showChevron = true,
}: ListItemProps) {
  return (
    <Card onPress={onPress} variant="outlined" style={styles.listItem}>
      <View style={styles.listItemContent}>
        {icon && (
          <View style={[styles.listItemIcon, { backgroundColor: iconBgColor }]}>
            <Ionicons name={icon} size={22} color={iconColor} />
          </View>
        )}
        <View style={styles.listItemText}>
          <Text style={styles.listItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement ||
          (showChevron && (
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
          ))}
      </View>
    </Card>
  );
}

// ============ Section Header ============
interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  actionText,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && onAction && (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ============ Status Badge ============
interface StatusBadgeProps {
  status: "published" | "draft" | "pending" | "completed";
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const statusConfig = {
    published: {
      bg: COLORS.successLight,
      text: COLORS.success,
      label: "Published",
    },
    draft: { bg: COLORS.warningLight, text: COLORS.warning, label: "Draft" },
    pending: { bg: COLORS.infoLight, text: COLORS.info, label: "Pending" },
    completed: {
      bg: COLORS.primaryBg,
      text: COLORS.primary,
      label: "Completed",
    },
  };

  const config = statusConfig[status];
  const isSmall = size === "sm";

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text
        style={[
          styles.statusBadgeText,
          { color: config.text, fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

// ============ Animated Button ============
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function AnimatedButton({
  title,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17 },
  };

  const variantStyles = {
    primary: {
      backgroundColor: disabled ? COLORS.gray300 : COLORS.primary,
      textColor: COLORS.white,
    },
    secondary: {
      backgroundColor: disabled ? COLORS.gray100 : COLORS.primaryBg,
      textColor: disabled ? COLORS.gray400 : COLORS.primary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: disabled ? COLORS.gray300 : COLORS.primary,
      textColor: disabled ? COLORS.gray400 : COLORS.primary,
    },
    ghost: {
      backgroundColor: "transparent",
      textColor: disabled ? COLORS.gray400 : COLORS.primary,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: currentVariant.backgroundColor,
            borderWidth: (currentVariant as any).borderWidth || 0,
            borderColor: (currentVariant as any).borderColor || "transparent",
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
          fullWidth && { width: "100%" },
          animatedStyle,
        ]}
      >
        {icon && iconPosition === "left" && !loading && (
          <Ionicons
            name={icon}
            size={currentSize.fontSize + 2}
            color={currentVariant.textColor}
            style={{ marginRight: 6 }}
          />
        )}
        {loading ? (
          <Ionicons
            name="sync"
            size={currentSize.fontSize + 2}
            color={currentVariant.textColor}
          />
        ) : (
          <Text
            style={[
              styles.buttonText,
              {
                color: currentVariant.textColor,
                fontSize: currentSize.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === "right" && !loading && (
          <Ionicons
            name={icon}
            size={currentSize.fontSize + 2}
            color={currentVariant.textColor}
            style={{ marginLeft: 6 }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  // Stat Card
  statCard: {
    padding: 16,
    minWidth: "47%",
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.gray900,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Glass Card
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: RADIUS.xl,
    padding: 14,
    flex: 1,
    minWidth: "46%",
  },
  glassValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginTop: 8,
  },
  glassLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },

  // Action Card
  actionCard: {
    padding: 16,
    minWidth: "47%",
    flex: 1,
  },
  actionCardContent: {
    alignItems: "flex-start",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gray900,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },

  // List Item
  listItem: {
    marginBottom: 8,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gray900,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray900,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontWeight: "600",
  },

  // Button
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.xl,
  },
  buttonText: {
    fontWeight: "600",
  },
});

export default {
  Card,
  StatCard,
  GlassStatCard,
  ActionCard,
  ListItem,
  SectionHeader,
  StatusBadge,
  AnimatedButton,
};
