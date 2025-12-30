/**
 * Abhigyan Gurukul App - Professional Design System
 * Production-Ready Theme Configuration
 */

export { getThemedColors, getThemedShadow } from './colors';

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const THEME = {
  // Primary brand color - Indigo for main UI
  primary: '#4F46E5',        // Indigo 600
  primaryHover: '#4338CA',   // Indigo 700
  primaryLight: '#EEF2FF',   // Indigo 50
  primaryMuted: 'rgba(79, 70, 229, 0.15)',

  // Tab bar color - Green (brand identifier in header only)
  tabBar: '#059669',         // Emerald 600
  tabBarLight: '#ECFDF5',    // Emerald 50

  // Secondary/Accent
  secondary: '#10B981',      // Green for success states
  secondaryLight: '#D1FAE5',

  // Backgrounds - Calm, academic
  bg: {
    primary: '#FAFAFA',      // Off-white
    secondary: '#F5F5F5',
    tertiary: '#F0F0F0',
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
// DARK THEME - Professional dark mode colors
// =============================================================================

export const DARK_THEME = {
  // Primary brand color - Indigo for dark mode
  primary: '#6366F1',        // Indigo 500 - brighter for dark
  primaryHover: '#4F46E5',   // Indigo 600
  primaryLight: 'rgba(99, 102, 241, 0.2)',
  primaryMuted: 'rgba(99, 102, 241, 0.1)',

  // Tab bar - NO green in dark mode, use indigo
  tabBar: '#6366F1',         // Indigo for tab bar
  tabBarLight: 'rgba(99, 102, 241, 0.2)',

  // Secondary/Accent - Green for success only
  secondary: '#10B981',      // Green for success states only
  secondaryLight: 'rgba(16, 185, 129, 0.2)',

  // Backgrounds - Deep charcoal professional
  bg: {
    primary: '#18181B',      // Zinc 900
    secondary: '#27272A',    // Zinc 800
    tertiary: '#3F3F46',     // Zinc 700
    elevated: '#27272A',
  },

  // Text - Clear hierarchy for dark mode
  text: {
    primary: '#FAFAFA',      // Zinc 50
    secondary: '#D4D4D8',    // Zinc 300
    tertiary: '#A1A1AA',     // Zinc 400
    disabled: '#71717A',     // Zinc 500
    inverse: '#18181B',      // Zinc 900
  },

  // Borders
  border: {
    light: '#27272A',
    default: '#3F3F46',
    dark: '#52525B',
    focus: '#6366F1',        // Indigo focus
  },

  // Semantic colors - Green for success only
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.2)',
  successDark: '#059669',

  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.2)',
  warningDark: '#F59E0B',

  error: '#F87171',
  errorLight: 'rgba(248, 113, 113, 0.2)',
  errorDark: '#EF4444',

  info: '#6366F1',           // Indigo for info
  infoLight: 'rgba(99, 102, 241, 0.2)',
  infoDark: '#4F46E5',

  // Status colors (muted versions for badges)
  status: {
    published: 'rgba(16, 185, 129, 0.2)',    // Green for success
    publishedText: '#10B981',
    draft: 'rgba(251, 191, 36, 0.2)',
    draftText: '#FBBF24',
    pending: 'rgba(99, 102, 241, 0.2)',      // Indigo
    pendingText: '#6366F1',
    archived: '#3F3F46',
    archivedText: '#A1A1AA',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // White/Black constants (inverted for dark)
  white: '#18181B',      // Zinc 900
  black: '#FAFAFA',      // Zinc 50
  transparent: 'transparent',

  // Flat Gray Scale - zinc palette for dark mode
  gray50: '#18181B',
  gray100: '#27272A',
  gray200: '#3F3F46',
  gray300: '#52525B',
  gray400: '#71717A',
  gray500: '#A1A1AA',
  gray600: '#D4D4D8',
  gray700: '#E4E4E7',
  gray800: '#F4F4F5',
  gray900: '#FAFAFA',
} as const;

// Helper function to get theme-aware colors
export const getTheme = (isDark: boolean) => isDark ? DARK_THEME : THEME;

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
    shadowColor: '#4F46E5',  // Indigo
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
  primary: ['#4F46E5', '#3730A3'] as [string, string],      // Indigo
  primaryDiagonal: ['#6366F1', '#4338CA'] as [string, string],
  success: ['#34D399', '#10B981'] as [string, string],
  warning: ['#FBBF24', '#F59E0B'] as [string, string],
  error: ['#F87171', '#EF4444'] as [string, string],
  info: ['#60A5FA', '#3B82F6'] as [string, string],
  purple: ['#A78BFA', '#8B5CF6'] as [string, string],
  dark: ['#475569', '#1E293B'] as [string, string],
  tabBar: ['#059669', '#047857'] as [string, string],       // Green for tab bar
  // Soft gradients for backgrounds
  softPrimary: ['#EEF2FF', '#F8FAFC'] as [string, string],  // Indigo
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
