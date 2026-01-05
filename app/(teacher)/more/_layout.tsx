import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="offline-results" />
      <Stack.Screen name="students" />
      <Stack.Screen name="batches" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="performance" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="student-report" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
