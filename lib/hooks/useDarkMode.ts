import { useAppTheme } from '@/lib/context';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to automatically manage dark mode class on document (web only)
 * For native, we use the theme context directly in components
 */
export function useDarkMode() {
  const { isDark, theme, themeMode, setThemeMode } = useAppTheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  return { isDark, theme, themeMode, setThemeMode };
}
