/**
 * Color Helper
 * Helper to get correct color properties from getColors()
 */

export const getTextColor = (colors: ReturnType<typeof import('@/constants/colors').getColors>, isDark: boolean) => ({
  primary: isDark ? colors.gray100 : colors.gray900,
  secondary: colors.gray500,
  tertiary: colors.gray400,
});

export const getBackgroundColor = (colors: ReturnType<typeof import('@/constants/colors').getColors>) => ({
  primary: colors.background,
  secondary: colors.backgroundSecondary,
  tertiary: colors.backgroundTertiary,
  surface: colors.surface,
});
