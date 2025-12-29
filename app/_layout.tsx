import { ErrorBoundary } from "@/components/shared";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ToastProvider } from "@/lib/context";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

export const unstable_settings = {
  initialRouteName: "splash",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
          <StatusBar style="auto" />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
