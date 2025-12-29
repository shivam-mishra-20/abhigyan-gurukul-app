/**
 * Empty State Component
 * Displays when there's no data to show
 */

import { RADIUS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Main title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Custom icon color */
  iconColor?: string;
  /** Custom icon background color */
  iconBgColor?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Size variant */
  size?: "small" | "medium" | "large";
}

export function EmptyState({
  icon = "folder-open-outline",
  title,
  description,
  action,
  secondaryAction,
  iconColor = THEME.text.tertiary,
  iconBgColor = THEME.bg.tertiary,
  style,
  size = "medium",
}: EmptyStateProps) {
  const sizeConfig = {
    small: { icon: 32, container: 56, padding: SPACING.xl },
    medium: { icon: 48, container: 80, padding: SPACING["3xl"] },
    large: { icon: 64, container: 100, padding: SPACING["4xl"] },
  };

  const config = sizeConfig[size];

  return (
    <View
      style={[styles.container, { paddingVertical: config.padding }, style]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            width: config.container,
            height: config.container,
            borderRadius: config.container / 2,
            backgroundColor: iconBgColor,
          },
        ]}
      >
        <Ionicons name={icon} size={config.icon} color={iconColor} />
      </View>

      {/* Title */}
      <Text style={[styles.title, size === "small" && styles.titleSmall]}>
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text
          style={[
            styles.description,
            size === "small" && styles.descriptionSmall,
          ]}
        >
          {description}
        </Text>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {action && (
            <Pressable style={styles.primaryButton} onPress={action.onPress}>
              {action.icon && (
                <Ionicons
                  name={action.icon}
                  size={18}
                  color={THEME.white}
                  style={styles.buttonIcon}
                />
              )}
              <Text style={styles.primaryButtonText}>{action.label}</Text>
            </Pressable>
          )}

          {secondaryAction && (
            <Pressable
              style={styles.secondaryButton}
              onPress={secondaryAction.onPress}
            >
              {secondaryAction.icon && (
                <Ionicons
                  name={secondaryAction.icon}
                  size={18}
                  color={THEME.primary}
                  style={styles.buttonIcon}
                />
              )}
              <Text style={styles.secondaryButtonText}>
                {secondaryAction.label}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Preset Empty States for common scenarios
 */

export function NoDataEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="cube-outline"
      title="No data found"
      description="There's nothing to show here yet"
      {...props}
    />
  );
}

export function NoSearchResultsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="search-outline"
      title="No results found"
      description="Try adjusting your search or filters"
      {...props}
    />
  );
}

export function NoExamsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="document-text-outline"
      title="No exams yet"
      description="Create your first exam to get started"
      iconColor={THEME.info}
      iconBgColor={THEME.infoLight}
      {...props}
    />
  );
}

export function NoStudentsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="people-outline"
      title="No students found"
      description="Students will appear here once they register"
      iconColor={THEME.secondary}
      iconBgColor={THEME.secondaryLight}
      {...props}
    />
  );
}

export function NoReviewsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="checkmark-circle-outline"
      title="No pending reviews"
      description="All caught up! There are no exams to review"
      iconColor={THEME.success}
      iconBgColor={THEME.successLight}
      {...props}
    />
  );
}

export function ErrorEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      description="We couldn't load the data. Please try again"
      iconColor={THEME.error}
      iconBgColor={THEME.errorLight}
      {...props}
    />
  );
}

export function OfflineEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="You're offline"
      description="Check your internet connection and try again"
      iconColor={THEME.warning}
      iconBgColor={THEME.warningLight}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: SPACING["2xl"],
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: THEME.text.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  titleSmall: {
    ...TYPOGRAPHY.bodyBold,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: THEME.text.secondary,
    textAlign: "center",
    maxWidth: 280,
  },
  descriptionSmall: {
    ...TYPOGRAPHY.small,
  },
  actionsContainer: {
    marginTop: SPACING.xl,
    alignItems: "center",
    gap: SPACING.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: THEME.white,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.smallMedium,
    color: THEME.primary,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
});

export default EmptyState;
