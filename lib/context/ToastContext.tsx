/**
 * Toast Context & Provider
 * Global toast notification system for user feedback
 */

import { RADIUS, SHADOWS, SPACING, THEME, TYPOGRAPHY } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// =============================================================================
// TYPES
// =============================================================================

type ToastType = "success" | "error" | "warning" | "info";

interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextValue {
  show: (config: Omit<ToastConfig, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// =============================================================================
// PROVIDER
// =============================================================================

interface ToastProviderProps {
  children: ReactNode;
  /** Maximum number of toasts visible at once */
  maxToasts?: number;
  /** Default duration in ms */
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  maxToasts = 3,
  defaultDuration = 4000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback(
    (config: Omit<ToastConfig, "id">) => {
      const id = Date.now().toString();
      const newToast: ToastConfig = {
        id,
        duration: defaultDuration,
        ...config,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Limit number of toasts
        return updated.slice(0, maxToasts);
      });

      // Auto dismiss
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, newToast.duration);
      }
    },
    [defaultDuration, maxToasts, dismiss]
  );

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) => {
      show({ type: "success", title, message });
    },
    [show]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      show({ type: "error", title, message, duration: 6000 }); // Longer for errors
    },
    [show]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      show({ type: "warning", title, message });
    },
    [show]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      show({ type: "info", title, message });
    },
    [show]
  );

  const contextValue: ToastContextValue = {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Container */}
      <View
        style={[styles.container, { top: insets.top + SPACING.md }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            config={toast}
            index={index}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// =============================================================================
// TOAST COMPONENT
// =============================================================================

interface ToastProps {
  config: ToastConfig;
  index: number;
  onDismiss: () => void;
}

function Toast({ config, index, onDismiss }: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  // Animate in
  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [translateY, opacity]);

  const handleDismiss = () => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const { icon, colors } = getToastConfig(config.type);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors.bg, marginTop: index > 0 ? SPACING.sm : 0 },
        animatedStyle,
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.toastContent}>
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}
        >
          <Ionicons name={icon} size={20} color={colors.icon} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: colors.title }]}
            numberOfLines={1}
          >
            {config.title}
          </Text>
          {config.message && (
            <Text
              style={[styles.message, { color: colors.message }]}
              numberOfLines={2}
            >
              {config.message}
            </Text>
          )}
        </View>

        {/* Action or Close */}
        {config.action ? (
          <Pressable
            onPress={() => {
              config.action?.onPress();
              onDismiss();
            }}
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: colors.action }]}>
              {config.action.label}
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={18} color={colors.close} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getToastConfig(type: ToastType) {
  switch (type) {
    case "success":
      return {
        icon: "checkmark-circle" as const,
        colors: {
          bg: "#ECFDF5",
          iconBg: "#D1FAE5",
          icon: THEME.success,
          title: "#065F46",
          message: "#047857",
          action: THEME.success,
          close: "#6EE7B7",
        },
      };
    case "error":
      return {
        icon: "alert-circle" as const,
        colors: {
          bg: "#FEF2F2",
          iconBg: "#FEE2E2",
          icon: THEME.error,
          title: "#991B1B",
          message: "#B91C1C",
          action: THEME.error,
          close: "#FCA5A5",
        },
      };
    case "warning":
      return {
        icon: "warning" as const,
        colors: {
          bg: "#FFFBEB",
          iconBg: "#FEF3C7",
          icon: THEME.warning,
          title: "#92400E",
          message: "#B45309",
          action: THEME.warning,
          close: "#FCD34D",
        },
      };
    case "info":
    default:
      return {
        icon: "information-circle" as const,
        colors: {
          bg: "#EFF6FF",
          iconBg: "#DBEAFE",
          icon: THEME.info,
          title: "#1E40AF",
          message: "#1D4ED8",
          action: THEME.info,
          close: "#93C5FD",
        },
      };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    maxWidth: SCREEN_WIDTH - SPACING.lg * 2,
    borderRadius: RADIUS.xl,
    ...SHADOWS.lg,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.smallBold,
  },
  message: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  actionText: {
    ...TYPOGRAPHY.smallBold,
  },
  closeButton: {
    padding: SPACING.sm,
  },
});

export default ToastProvider;
