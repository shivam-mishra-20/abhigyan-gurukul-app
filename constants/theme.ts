/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// LIGHT THEME: Green for tab bar/header, Indigo for content
// DARK THEME: Indigo primary, Green for success only
const tintColorLight = '#059669';  // Green for tab bar in light mode
const tintColorDark = '#6366F1';   // Indigo for dark mode

// Professional color palette using indigo primary + neutrals
export const Palette = {
  primary: '#4F46E5',        // Indigo 600 - main accent
  primaryOn: '#FFFFFF',
  primaryDark: '#3730A3',    // Indigo 800
  accent: '#0EA5E9',         // Sky 500
  neutral: '#6B7280',        // Gray 500
  background: '#FAFAFA',     // Off-white
  surface: '#FFFFFF',
  textPrimary: '#111827',    // Gray 900
  tabBar: '#059669',         // Green for tab bar only
};

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.background,
    tint: tintColorLight,    // Green for tab bar
    icon: Palette.neutral,
    tabIconDefault: Palette.neutral,
    tabIconSelected: tintColorLight,  // Green for selected tab
  },
  dark: {
    text: '#FAFAFA',
    background: '#18181B',
    tint: tintColorDark,     // Indigo for dark mode
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: tintColorDark,  // Indigo for selected tab
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
