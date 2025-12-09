import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function StudentExams() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-500 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">My Exams</Text>
        <Text className="text-white text-sm opacity-90 mt-1">
          View and manage your exams
        </Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          Available Exams
        </Text>
        <View className="bg-white rounded-2xl p-6 items-center">
          <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 mt-4">No exams available</Text>
        </View>
      </View>
    </ScrollView>
  );
}
