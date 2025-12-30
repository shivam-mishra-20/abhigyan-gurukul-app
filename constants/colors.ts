/**
 * Abhigyan Gurukul App - Professional Color Palette
 * LIGHT THEME: Indigo/Blue primary, Green for tab bar/header only
 * DARK THEME: Indigo primary, Green for success states only
 */

export const COLORS = {
  // Primary brand colors - Indigo/Blue for main UI
  primary: '#4F46E5',        // Indigo 600 - primary accent throughout app
  primaryLight: '#6366F1',   // Indigo 500
  primaryDark: '#4338CA',    // Indigo 700
  primaryBg: '#EEF2FF',      // Indigo 50
  primaryMuted: 'rgba(79, 70, 229, 0.15)',

  // Header/Tab bar color - Green (brand identifier)
  tabBar: '#059669',         // Emerald 600 - for top navigation only
  tabBarLight: '#10B981',    // Emerald 500
  tabBarBg: '#ECFDF5',       // Emerald 50

  // Accent colors
  accent: '#0EA5E9',         // Sky 500
  accentLight: '#38BDF8',    // Sky 400
  accentDark: '#0284C7',     // Sky 600

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic colors
  success: '#10B981',        // Green for success/completion only
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Gradient helpers
  gradientStart: '#4F46E5',  // Indigo
  gradientEnd: '#3730A3',    // Indigo dark

  // Background variants - Calm, academic
  background: '#FAFAFA',     // Off-white
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#F0F0F0',

  // Card and surface
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  surfaceActive: '#F3F4F6',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Tab bar - Green brand identifier
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabIconDefault: '#6B7280',
  tabIconSelected: '#059669',  // Green for active tab in header

  // Status colors for exams/reviews
  published: '#10B981',
  draft: '#F59E0B',
  pending: '#3B82F6',
  completed: '#10B981',       // Green for completed states
} as const;

// Gradient presets
export const GRADIENTS = {
  primary: ['#4F46E5', '#3730A3'] as [string, string],     // Indigo
  primaryDiagonal: ['#6366F1', '#4338CA'] as [string, string],
  accent: ['#38BDF8', '#0284C7'] as [string, string],      // Sky blue
  success: ['#34D399', '#10B981'] as [string, string],
  warm: ['#FBBF24', '#F59E0B'] as [string, string],
  cool: ['#60A5FA', '#3B82F6'] as [string, string],
  purple: ['#A78BFA', '#8B5CF6'] as [string, string],
  dark: ['#4B5563', '#1F2937'] as [string, string],
  white: ['#FFFFFF', '#F3F4F6'] as [string, string],
  tabBar: ['#059669', '#047857'] as [string, string],      // Green for header
} as const;

// Shadow presets
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#4F46E5',  // Indigo shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius
export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Dark mode colors - Professional dark theme
// Indigo primary, Green for success only
export const DARK_COLORS = {
  // Primary brand colors - Indigo for main UI
  primary: '#6366F1',        // Indigo 500 - brighter for dark
  primaryLight: '#818CF8',   // Indigo 400
  primaryDark: '#4F46E5',    // Indigo 600
  primaryBg: 'rgba(99, 102, 241, 0.15)',
  primaryMuted: 'rgba(99, 102, 241, 0.1)',

  // Backgrounds - Deep charcoal professional
  white: '#18181B',          // Zinc 900 - main background
  black: '#FFFFFF',
  background: '#18181B',
  backgroundSecondary: '#27272A',  // Zinc 800
  backgroundTertiary: '#3F3F46',   // Zinc 700
  surface: '#27272A',
  surfaceHover: '#3F3F46',
  surfaceActive: '#52525B',        // Zinc 600

  // Gray scale - cool neutrals for dark
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

  // Semantic colors - Green for success only
  success: '#10B981',        // Green for success indicators
  successLight: 'rgba(16, 185, 129, 0.2)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.2)',
  error: '#F87171',
  errorLight: 'rgba(248, 113, 113, 0.2)',
  info: '#60A5FA',
  infoLight: 'rgba(96, 165, 250, 0.2)',

  // Borders - subtle on dark
  border: '#3F3F46',
  borderLight: '#27272A',
  borderDark: '#52525B',

  // Accents
  accent: '#38BDF8',
  accentLight: '#7DD3FC',
  accentDark: '#0EA5E9',

  // Tab bar - NO green in dark mode for tab bar
  tabBarBackground: '#18181B',
  tabBarBorder: '#27272A',
  tabIconDefault: '#71717A',
  tabIconSelected: '#6366F1',  // Indigo for active tab

  // Status colors - Green only for success/completion
  published: '#10B981',        // Green for success
  draft: '#FBBF24',
  pending: '#60A5FA',
  completed: '#10B981',        // Green for completed
} as const;

// Function to get theme-aware colors
export const getColors = (isDark: boolean) => isDark ? DARK_COLORS : COLORS;

export default COLORS;
