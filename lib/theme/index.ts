/**
 * Abhigyan Gurukul App - Professional Design System
 * Production-Ready Theme Configuration
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const THEME = {
  // Primary brand color - Used sparingly for CTAs only
  primary: '#4E74F9',
  primaryHover: '#3A5FE8',
  primaryLight: '#E8EDFE',
  primaryMuted: 'rgba(78, 116, 249, 0.15)',

  // Secondary/Accent
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',

  // Backgrounds - Clear hierarchy
  bg: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
  },

  // Text - Clear hierarchy
  text: {
    primary: '#0F172A',      // Headlines, important text
    secondary: '#475569',    // Body text, descriptions
    tertiary: '#94A3B8',     // Captions, hints
    disabled: '#CBD5E1',     // Disabled text
    inverse: '#FFFFFF',      // Text on dark backgrounds
  },

  // Borders
  border: {
    light: '#F1F5F9',
    default: '#E2E8F0',
    dark: '#CBD5E1',
    focus: '#4E74F9',
  },

  // Semantic colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Status colors (muted versions for badges)
  status: {
    published: '#D1FAE5',
    publishedText: '#059669',
    draft: '#FEF3C7',
    draftText: '#D97706',
    pending: '#DBEAFE',
    pendingText: '#2563EB',
    archived: '#F1F5F9',
    archivedText: '#64748B',
  },

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',

  // White/Black constants
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Flat Gray Scale (for convenience)
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const TYPOGRAPHY = {
  // Display - For hero sections
  display: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  // Headlines
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  // Small text
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  smallMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },

  // Label - For form labels, tags
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },

  // Button text
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },

  // Additional convenient aliases
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
} as const;

// =============================================================================
// SPACING (8px base system)
// =============================================================================

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  // Colored shadows for primary elements
  primary: {
    shadowColor: '#4E74F9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  success: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

// =============================================================================
// ANIMATIONS & TRANSITIONS
// =============================================================================

export const ANIMATIONS = {
  // Duration in ms
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    slowest: 600,
  },
  // Spring configs for react-native-reanimated
  spring: {
    gentle: {
      damping: 15,
      stiffness: 100,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
      mass: 0.8,
    },
    snappy: {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    },
  },
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

export const GRADIENTS = {
  primary: ['#4E74F9', '#3A5FE8'] as [string, string],
  primaryDiagonal: ['#5D83FF', '#3A5FE8'] as [string, string],
  success: ['#34D399', '#10B981'] as [string, string],
  warning: ['#FBBF24', '#F59E0B'] as [string, string],
  error: ['#F87171', '#EF4444'] as [string, string],
  info: ['#60A5FA', '#3B82F6'] as [string, string],
  purple: ['#A78BFA', '#8B5CF6'] as [string, string],
  dark: ['#475569', '#1E293B'] as [string, string],
  // Soft gradients for backgrounds
  softPrimary: ['#E8EDFE', '#F8FAFC'] as [string, string],
  softSuccess: ['#D1FAE5', '#F8FAFC'] as [string, string],
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
} as const;

// =============================================================================
// BREAKPOINTS (for responsive design)
// =============================================================================

export const BREAKPOINTS = {
  sm: 360,   // Small phones
  md: 390,   // Regular phones
  lg: 428,   // Large phones
  xl: 768,   // Tablets
  '2xl': 1024, // Large tablets
} as const;

// =============================================================================
// ICON SIZES
// =============================================================================

export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
} as const;

// =============================================================================
// COMPONENT PRESETS
// =============================================================================

export const COMPONENT = {
  // Button heights
  button: {
    xs: 28,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
  // Card padding
  card: {
    sm: SPACING.md,
    md: SPACING.lg,
    lg: SPACING.xl,
  },
  // Header height
  header: 56,
  // Tab bar height
  tabBar: 65,
  // Bottom sheet handle
  sheetHandle: 4,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

// Export everything as a single design system object
export const DesignSystem = {
  colors: THEME,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  gradients: GRADIENTS,
  zIndex: Z_INDEX,
  breakpoints: BREAKPOINTS,
  iconSize: ICON_SIZE,
  component: COMPONENT,
} as const;

export default DesignSystem;
