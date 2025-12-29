/**
 * Loading States
 * Various loading indicators for different use cases
 */

import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { RADIUS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";

// =============================================================================
// FULL SCREEN LOADER
// =============================================================================

interface LoadingScreenProps {
  message?: string;
  color?: string;
}

export function LoadingScreen({
  message = "Loading...",
  color = THEME.primary,
}: LoadingScreenProps) {
  return (
    <View style={styles.fullScreen}>
      <ActivityIndicator size="large" color={color} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

// =============================================================================
// INLINE LOADER
// =============================================================================

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = "small",
  color = THEME.primary,
  style,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = RADIUS.md,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        ({ width, height, borderRadius } as ViewStyle),
        animatedStyle,
        style,
      ]}
    />
  );
}

// =============================================================================
// SKELETON CARD
// =============================================================================

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <View style={styles.skeletonCardHeader}>
        <Skeleton width={48} height={48} borderRadius={RADIUS.lg} />
        <View style={styles.skeletonCardHeaderText}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginTop: 16 }} />
      <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

// =============================================================================
// SKELETON LIST
// =============================================================================

interface SkeletonListProps {
  count?: number;
  itemStyle?: ViewStyle;
}

export function SkeletonList({ count = 3, itemStyle }: SkeletonListProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={itemStyle} />
      ))}
    </View>
  );
}

// =============================================================================
// SKELETON STAT CARD
// =============================================================================

export function SkeletonStatCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.skeletonStatCard, style]}>
      <Skeleton width={36} height={36} borderRadius={RADIUS.md} />
      <Skeleton width={40} height={28} style={{ marginTop: 12 }} />
      <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

// =============================================================================
// SKELETON STATS ROW
// =============================================================================

export function SkeletonStatsRow({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.skeletonStatsRow}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonStatCard key={index} style={{ flex: 1 }} />
      ))}
    </View>
  );
}

// =============================================================================
// LOADING OVERLAY
// =============================================================================

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={THEME.primary} />
        {message && <Text style={styles.overlayText}>{message}</Text>}
      </View>
    </View>
  );
}

// =============================================================================
// BUTTON LOADING STATE
// =============================================================================

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  color?: string;
}

export function ButtonLoading({
  loading,
  children,
  loadingText,
  color = THEME.white,
}: ButtonLoadingProps) {
  if (loading) {
    return (
      <View style={styles.buttonLoadingContainer}>
        <ActivityIndicator size="small" color={color} />
        {loadingText && (
          <Text style={[styles.buttonLoadingText, { color }]}>
            {loadingText}
          </Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

// =============================================================================
// REFRESH INDICATOR
// =============================================================================

interface RefreshIndicatorProps {
  refreshing: boolean;
  message?: string;
}

export function RefreshIndicator({
  refreshing,
  message = "Refreshing...",
}: RefreshIndicatorProps) {
  if (!refreshing) return null;

  return (
    <View style={styles.refreshIndicator}>
      <ActivityIndicator size="small" color={THEME.primary} />
      <Text style={styles.refreshText}>{message}</Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.bg.primary,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: THEME.text.secondary,
    marginTop: SPACING.lg,
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  skeleton: {
    backgroundColor: THEME.bg.tertiary,
  },
  skeletonCard: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonCardHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  skeletonStatCard: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonStatsRow: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  overlayContent: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING["2xl"],
    alignItems: "center",
    minWidth: 150,
  },
  overlayText: {
    ...TYPOGRAPHY.body,
    color: THEME.text.secondary,
    marginTop: SPACING.lg,
  },
  buttonLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoadingText: {
    ...TYPOGRAPHY.button,
    marginLeft: SPACING.sm,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    backgroundColor: THEME.primaryLight,
  },
  refreshText: {
    ...TYPOGRAPHY.small,
    color: THEME.primary,
    marginLeft: SPACING.sm,
  },
});

export default {
  LoadingScreen,
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonStatCard,
  SkeletonStatsRow,
  LoadingOverlay,
  ButtonLoading,
  RefreshIndicator,
};
