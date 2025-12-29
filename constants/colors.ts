/**
 * Abhigyan Gurukul App - Professional Color Palette
 * Primary: #4E74F9 (Fresh Blue)
 */

export const COLORS = {
  // Primary brand colors
  primary: '#4E74F9',
  primaryLight: '#4E74F9',
  primaryDark: '#6EA530',
  primaryBg: '#F0F9E8',
  primaryMuted: 'rgba(139, 197, 63, 0.15)',

  // Accent colors
  accent: '#0A7EA4',
  accentLight: '#1A9FCA',
  accentDark: '#066380',

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
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Gradient helpers
  gradientStart: '#8BC53F',
  gradientEnd: '#6EA530',

  // Background variants
  background: '#FFFFFF',
  backgroundSecondary: '#F7F9F8',
  backgroundTertiary: '#F0F4F3',

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

  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabIconDefault: '#9CA3AF',
  tabIconSelected: '#8BC53F',

  // Status colors for exams/reviews
  published: '#10B981',
  draft: '#F59E0B',
  pending: '#3B82F6',
  completed: '#8BC53F',
} as const;

// Gradient presets
export const GRADIENTS = {
  primary: ['#8BC53F', '#6EA530'] as [string, string],
  primaryDiagonal: ['#A3D65B', '#6EA530'] as [string, string],
  accent: ['#1A9FCA', '#066380'] as [string, string],
  success: ['#34D399', '#10B981'] as [string, string],
  warm: ['#FBBF24', '#F59E0B'] as [string, string],
  cool: ['#60A5FA', '#3B82F6'] as [string, string],
  purple: ['#A78BFA', '#8B5CF6'] as [string, string],
  dark: ['#4B5563', '#1F2937'] as [string, string],
  white: ['#FFFFFF', '#F3F4F6'] as [string, string],
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
    shadowColor: '#8BC53F',
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

export default COLORS;
