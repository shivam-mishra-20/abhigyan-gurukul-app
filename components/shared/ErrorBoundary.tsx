/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */

import { RADIUS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service (e.g., Sentry, Firebase Crashlytics)
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * Default UI shown when an error is caught
 */

interface ErrorFallbackProps {
  error?: Error | null;
  onReset?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  onReset,
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again.",
}: ErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="warning-outline" size={48} color={THEME.error} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Error details in dev mode */}
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorLabel}>Error Details:</Text>
            <Text style={styles.errorText} numberOfLines={5}>
              {error.message}
            </Text>
          </View>
        )}

        {/* Retry Button */}
        {onReset && (
          <Pressable style={styles.button} onPress={onReset}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={THEME.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * withErrorBoundary HOC
 * Wrap any component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING["2xl"],
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.errorLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: THEME.text.primary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: THEME.text.secondary,
    textAlign: "center",
    marginBottom: SPACING["2xl"],
  },
  errorDetails: {
    width: "100%",
    backgroundColor: THEME.bg.tertiary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING["2xl"],
  },
  errorLabel: {
    ...TYPOGRAPHY.smallBold,
    color: THEME.error,
    marginBottom: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: THEME.text.tertiary,
    fontFamily: "monospace",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING["2xl"],
    borderRadius: RADIUS.lg,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: THEME.white,
  },
});

export default ErrorBoundary;
