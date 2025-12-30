/**
 * Theme utilities for consistent theming across the app
 * Use these instead of hard-coded colors
 * LIGHT: Indigo primary, Green for header/tab bar only
 * DARK: Indigo primary, Green for success only
 */

export const getThemedColors = (isDark: boolean) => ({
  // Backgrounds
  background: isDark ? '#18181B' : '#FAFAFA',
  surface: isDark ? '#27272A' : '#FFFFFF',
  card: isDark ? '#3F3F46' : '#FFFFFF',
  
  // Text
  text: isDark ? '#FAFAFA' : '#111827',
  textSecondary: isDark ? '#A1A1AA' : '#6B7280',
  textTertiary: isDark ? '#71717A' : '#9CA3AF',
  
  // Primary - Indigo for both themes
  primary: isDark ? '#6366F1' : '#4F46E5',
  primaryLight: isDark ? '#818CF8' : '#6366F1',
  primaryBg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.15)',
  
  // Tab bar - Green for light mode header, Indigo for dark
  tabBar: isDark ? '#6366F1' : '#059669',
  tabBarBg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(5, 150, 105, 0.15)',
  
  // Borders
  border: isDark ? '#52525B' : '#E5E7EB',
  borderLight: isDark ? '#3F3F46' : '#F3F4F6',
  
  // States
  error: isDark ? '#FCA5A5' : '#DC2626',
  errorBg: isDark ? 'rgba(252, 165, 165, 0.15)' : 'rgba(220, 38, 38, 0.15)',
  success: isDark ? '#10B981' : '#10B981',  // Green for success in both
  successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.15)',
  warning: isDark ? '#FBBF24' : '#F59E0B',
  warningBg: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.15)',
  info: isDark ? '#60A5FA' : '#3B82F6',
  infoBg: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.15)',
  
  // Additional colors
  teal: isDark ? '#14B8A6' : '#0B7077',
  tealBg: isDark ? 'rgba(20, 184, 166, 0.15)' : 'rgba(11, 112, 119, 0.15)',
  
  // Shadow (for use with shadowColor)
  shadow: isDark ? '#000' : '#000',
});

export const getThemedShadow = (isDark: boolean) => ({
  sm: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});
