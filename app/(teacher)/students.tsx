import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function TeacherStudents() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-purple-600 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">My Students</Text>
        <Text className="text-white text-sm opacity-90 mt-1">
          View and manage student data
        </Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          Student List
        </Text>
        <View className="bg-white rounded-2xl p-6 items-center">
          <Ionicons name="people-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 mt-4">No students enrolled</Text>
        </View>
      </View>
    </ScrollView>
  );
}
