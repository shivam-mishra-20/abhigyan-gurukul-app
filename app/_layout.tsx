import { ErrorBoundary } from "@/components/shared";
import {
    ThemeProvider as AppThemeProvider,
    ToastProvider,
    useAppTheme,
} from "@/lib/context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

export const unstable_settings = {
  initialRouteName: "splash",
};

function RootLayoutContent() {
  const { isDark } = useAppTheme();
  const { setColorScheme } = useColorScheme();

  // Sync NativeWind's color scheme with app theme
  useEffect(() => {
    try {
      if (setColorScheme) {
        setColorScheme(isDark ? "dark" : "light");
      }
    } catch (e) {
      console.warn("Error setting color scheme:", e);
    }
  }, [isDark, setColorScheme]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(student)" options={{ headerShown: false }} />
          <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
          <Stack.Screen name="(guest)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
      </ToastProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <RootLayoutContent />
      </AppThemeProvider>
    </ErrorBoundary>
  );
}
