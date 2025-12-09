import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function GuestExplore() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-green-500 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">Explore</Text>
        <Text className="text-white text-sm opacity-90 mt-1">
          Discover courses and content
        </Text>
      </View>

      <View className="px-6 py-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          Featured Courses
        </Text>

        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-3">
          <View className="flex-row items-start">
            <View className="bg-blue-100 w-16 h-16 rounded-xl items-center justify-center mr-4">
              <Ionicons name="calculator" size={32} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold mb-1">
                Mathematics
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                Complete mathematics curriculum for all levels
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="people" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">
                  350+ students
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-3">
          <View className="flex-row items-start">
            <View className="bg-green-100 w-16 h-16 rounded-xl items-center justify-center mr-4">
              <Ionicons name="flask" size={32} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold mb-1">
                Science
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                Physics, Chemistry, and Biology fundamentals
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="people" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">
                  420+ students
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="flex-row items-start">
            <View className="bg-purple-100 w-16 h-16 rounded-xl items-center justify-center mr-4">
              <Ionicons name="language" size={32} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold mb-1">
                Languages
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                English, Hindi, and Sanskrit courses
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="people" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">
                  280+ students
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
