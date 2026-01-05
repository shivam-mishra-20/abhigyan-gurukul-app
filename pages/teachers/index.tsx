import { Redirect } from "expo-router";

// Redirect to home tab
export default function TeacherIndex() {
  return <Redirect href="/(teacher)/home" />;
}
