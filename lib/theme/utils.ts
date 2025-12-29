/**
 * Theme Utilities - Helper functions for consistent styling
 */

import { Dimensions, PixelRatio, Platform, StyleSheet } from 'react-native';
import { BREAKPOINTS, RADIUS, SHADOWS, SPACING, THEME, TYPOGRAPHY } from './index';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

/**
 * Scale value based on screen width (375 as base)
 */
export const scale = (size: number): number => {
  const baseWidth = 375;
  return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * Scale font size with maximum limit
 */
export const scaleFont = (size: number): number => {
  const scaledSize = scale(size);
  return Math.min(scaledSize, size * 1.2); // Max 20% larger
};

/**
 * Normalize size based on pixel density
 */
export const normalize = (size: number): number => {
  const newSize = scale(size);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Get breakpoint-aware value
 */
export const responsive = <T>(values: { base: T; sm?: T; md?: T; lg?: T; xl?: T }): T => {
  if (SCREEN_WIDTH >= BREAKPOINTS.xl && values.xl) return values.xl;
  if (SCREEN_WIDTH >= BREAKPOINTS.lg && values.lg) return values.lg;
  if (SCREEN_WIDTH >= BREAKPOINTS.md && values.md) return values.md;
  if (SCREEN_WIDTH >= BREAKPOINTS.sm && values.sm) return values.sm;
  return values.base;
};

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Add opacity to a hex color
 */
export const hexWithOpacity = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Lighten a hex color
 */
export const lighten = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + 255 * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + 255 * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + 255 * amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

/**
 * Darken a hex color
 */
export const darken = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

// =============================================================================
// STYLE UTILITIES
// =============================================================================

/**
 * Create consistent shadow style with optional color
 */
export const createShadow = (
  level: keyof typeof SHADOWS = 'md',
  color?: string
) => {
  const shadow = SHADOWS[level];
  if (color) {
    return { ...shadow, shadowColor: color };
  }
  return shadow;
};

/**
 * Get consistent border radius
 */
export const getBorderRadius = (size: keyof typeof RADIUS = 'md'): number => {
  return RADIUS[size];
};

/**
 * Get spacing value
 */
export const getSpacing = (size: keyof typeof SPACING): number => {
  return SPACING[size];
};

/**
 * Create consistent padding style
 */
export const padding = (
  vertical: keyof typeof SPACING | number,
  horizontal?: keyof typeof SPACING | number
) => ({
  paddingVertical: typeof vertical === 'number' ? vertical : SPACING[vertical],
  paddingHorizontal: typeof horizontal === 'number' ? horizontal : horizontal ? SPACING[horizontal] : typeof vertical === 'number' ? vertical : SPACING[vertical],
});

/**
 * Create consistent margin style
 */
export const margin = (
  vertical: keyof typeof SPACING | number,
  horizontal?: keyof typeof SPACING | number
) => ({
  marginVertical: typeof vertical === 'number' ? vertical : SPACING[vertical],
  marginHorizontal: typeof horizontal === 'number' ? horizontal : horizontal ? SPACING[horizontal] : typeof vertical === 'number' ? vertical : SPACING[vertical],
});

// =============================================================================
// TEXT STYLE UTILITIES
// =============================================================================

/**
 * Get typography style with optional color override
 */
export const getTextStyle = (
  variant: keyof typeof TYPOGRAPHY,
  color?: string
) => ({
  ...TYPOGRAPHY[variant],
  color: color || THEME.text.primary,
});

/**
 * Common text style combinations
 */
export const TextStyles = StyleSheet.create({
  heading: {
    ...TYPOGRAPHY.h1,
    color: THEME.text.primary,
  },
  subheading: {
    ...TYPOGRAPHY.h3,
    color: THEME.text.primary,
  },
  body: {
    ...TYPOGRAPHY.body,
    color: THEME.text.secondary,
  },
  caption: {
    ...TYPOGRAPHY.caption,
    color: THEME.text.tertiary,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: THEME.text.tertiary,
  },
  error: {
    ...TYPOGRAPHY.small,
    color: THEME.error,
  },
  link: {
    ...TYPOGRAPHY.bodyMedium,
    color: THEME.primary,
  },
});

// =============================================================================
// LAYOUT UTILITIES
// =============================================================================

/**
 * Common layout styles
 */
export const LayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg.primary,
  },
  screenPadding: {
    paddingHorizontal: SPACING.xl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  column: {
    flexDirection: 'column',
  },
  flex1: {
    flex: 1,
  },
  absolute: {
    position: 'absolute',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// =============================================================================
// CARD STYLES
// =============================================================================

/**
 * Common card styles
 */
export const CardStyles = StyleSheet.create({
  default: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  elevated: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  outlined: {
    backgroundColor: THEME.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: THEME.border.default,
  },
  muted: {
    backgroundColor: THEME.bg.tertiary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
});

// =============================================================================
// INPUT STYLES
// =============================================================================

/**
 * Common input styles
 */
export const InputStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.smallMedium,
    color: THEME.text.secondary,
    marginBottom: SPACING.sm,
  },
  input: {
    height: 48,
    backgroundColor: THEME.bg.secondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.body,
    color: THEME.text.primary,
    borderWidth: 1,
    borderColor: THEME.border.default,
  },
  inputFocused: {
    borderColor: THEME.primary,
    backgroundColor: THEME.white,
  },
  inputError: {
    borderColor: THEME.error,
    backgroundColor: THEME.errorLight,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: THEME.error,
    marginTop: SPACING.xs,
  },
});

// =============================================================================
// SCREEN DIMENSIONS
// =============================================================================

export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 360,
  isMedium: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 428,
  isLarge: SCREEN_WIDTH >= 428,
  isTablet: SCREEN_WIDTH >= 768,
};

export default {
  scale,
  scaleFont,
  normalize,
  responsive,
  hexWithOpacity,
  lighten,
  darken,
  createShadow,
  getBorderRadius,
  getSpacing,
  padding,
  margin,
  getTextStyle,
  TextStyles,
  LayoutStyles,
  CardStyles,
  InputStyles,
  Screen,
};
