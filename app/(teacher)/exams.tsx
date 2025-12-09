import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function TeacherExams() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-purple-600 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">Manage Exams</Text>
        <Text className="text-white text-sm opacity-90 mt-1">
          Create and manage assessments
        </Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">All Exams</Text>
        <View className="bg-white rounded-2xl p-6 items-center">
          <Ionicons name="create-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 mt-4">No exams created yet</Text>
        </View>
      </View>
    </ScrollView>
  );
}
