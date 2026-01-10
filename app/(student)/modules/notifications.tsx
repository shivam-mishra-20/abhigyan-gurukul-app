import { NotificationList } from "@/components/NotificationList";
import { Stack } from "expo-router";
import React from "react";

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: "Notifications", 
        headerShown: true,
        headerBackTitle: "Back"
      }} />
      <NotificationList />
    </>
  );
}
