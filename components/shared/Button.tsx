/**
 * Button Component
 * Production-ready button with variants, loading states, and proper styling
 */

import {
  GRADIENTS,
  RADIUS,
  SHADOWS,
  SPACING,
  THEME,
  TYPOGRAPHY,
} from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  /** Button text */
  children: string;
  /** Click handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Left icon */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Right icon */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Use gradient background (primary variant only) */
  gradient?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  gradient = false,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  // Get variant styles
  const variantStyles = getVariantStyles(variant, isDisabled);
  const sizeStyles = getSizeStyles(size);

  const content = (
    <View style={styles.contentContainer}>
      {loading ? (
        <>
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
            style={styles.loader}
          />
          {loadingText && (
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                { color: variantStyles.textColor },
                textStyle,
              ]}
            >
              {loadingText}
            </Text>
          )}
        </>
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: variantStyles.textColor },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </View>
  );

  // Primary with gradient
  if (variant === "primary" && gradient && !isDisabled) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            sizeStyles.button,
            variantStyles.button,
            SHADOWS.primary,
          ]}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
}

// =============================================================================
// ICON BUTTON
// =============================================================================

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = "ghost",
  size = "md",
  disabled = false,
  loading = false,
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;
  const variantStyles = getVariantStyles(variant, isDisabled);
  const sizeStyles = getIconButtonSizeStyles(size);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.iconButton,
        sizeStyles,
        variantStyles.button,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.textColor} />
      ) : (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.textColor}
        />
      )}
    </AnimatedPressable>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  if (disabled) {
    return {
      button: {
        backgroundColor: THEME.bg.tertiary,
        borderWidth: 0,
      } as ViewStyle,
      textColor: THEME.text.disabled,
    };
  }

  switch (variant) {
    case "primary":
      return {
        button: {
          backgroundColor: THEME.primary,
        } as ViewStyle,
        textColor: THEME.white,
      };
    case "secondary":
      return {
        button: {
          backgroundColor: THEME.primaryLight,
        } as ViewStyle,
        textColor: THEME.primary,
      };
    case "outline":
      return {
        button: {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: THEME.border.default,
        } as ViewStyle,
        textColor: THEME.text.primary,
      };
    case "ghost":
      return {
        button: {
          backgroundColor: "transparent",
        } as ViewStyle,
        textColor: THEME.primary,
      };
    case "danger":
      return {
        button: {
          backgroundColor: THEME.error,
        } as ViewStyle,
        textColor: THEME.white,
      };
    default:
      return {
        button: {} as ViewStyle,
        textColor: THEME.text.primary,
      };
  }
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case "sm":
      return {
        button: {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.lg,
          borderRadius: RADIUS.md,
        } as ViewStyle,
        text: TYPOGRAPHY.buttonSmall as TextStyle,
        iconSize: 16,
      };
    case "lg":
      return {
        button: {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING["2xl"],
          borderRadius: RADIUS.xl,
        } as ViewStyle,
        text: { ...TYPOGRAPHY.button, fontSize: 17 } as TextStyle,
        iconSize: 22,
      };
    case "md":
    default:
      return {
        button: {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.xl,
          borderRadius: RADIUS.lg,
        } as ViewStyle,
        text: TYPOGRAPHY.button as TextStyle,
        iconSize: 20,
      };
  }
}

function getIconButtonSizeStyles(size: ButtonSize) {
  switch (size) {
    case "sm":
      return { width: 32, height: 32, borderRadius: RADIUS.md, iconSize: 18 };
    case "lg":
      return { width: 52, height: 52, borderRadius: RADIUS.xl, iconSize: 26 };
    case "md":
    default:
      return { width: 44, height: 44, borderRadius: RADIUS.lg, iconSize: 22 };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  loader: {
    marginRight: SPACING.sm,
  },
  fullWidth: {
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Button;
