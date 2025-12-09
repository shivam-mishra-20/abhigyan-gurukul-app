import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function GuestHome() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Hero Section */}
      <View className="bg-gradient-to-br from-green-500 to-green-600 pt-14 pb-12 px-6">
        <View className="items-center mb-6">
          <View className="bg-white w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg">
            <Ionicons name="school" size={48} color="#22c55e" />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-2">
            Abhigyan Gurukul
          </Text>
          <Text className="text-white text-base opacity-90 text-center">
            Tree of Knowledge
          </Text>
        </View>

        <View className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
          <Text className="text-white text-center text-sm">
            Empowering students with quality education and modern teaching
            methods
          </Text>
        </View>
      </View>

      {/* Features Section */}
      <View className="px-6 py-8">
        <Text className="text-gray-900 text-2xl font-bold mb-2">
          Welcome to Learning!
        </Text>
        <Text className="text-gray-500 mb-6">
          Explore our features and discover what we offer
        </Text>

        {/* Feature Cards */}
        <View className="gap-4">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-start">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="book" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold mb-1">
                  Quality Education
                </Text>
                <Text className="text-gray-500 text-sm">
                  Access to comprehensive study materials and expert guidance
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-start">
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold mb-1">
                  Expert Teachers
                </Text>
                <Text className="text-gray-500 text-sm">
                  Learn from experienced educators dedicated to your success
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-start">
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="trophy" size={24} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold mb-1">
                  Track Progress
                </Text>
                <Text className="text-gray-500 text-sm">
                  Monitor your performance with detailed analytics and reports
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-start">
              <View className="bg-amber-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="time" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold mb-1">
                  Flexible Learning
                </Text>
                <Text className="text-gray-500 text-sm">
                  Study at your own pace with 24/7 access to resources
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View className="mt-8 bg-green-500 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-2">
            Ready to Get Started?
          </Text>
          <Text className="text-white opacity-90 mb-4">
            Login to access personalized learning experience
          </Text>
          <Pressable
            onPress={() => router.push("/(guest)/login")}
            className="bg-white rounded-full py-3 items-center"
          >
            <Text className="text-green-600 font-semibold">Login Now</Text>
          </Pressable>
        </View>

        {/* Stats Section */}
        <View className="mt-8">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Our Impact
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <Text className="text-3xl font-bold text-green-600 mb-1">
                1000+
              </Text>
              <Text className="text-gray-500 text-sm">Active Students</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <Text className="text-3xl font-bold text-blue-600 mb-1">50+</Text>
              <Text className="text-gray-500 text-sm">Expert Teachers</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <Text className="text-3xl font-bold text-purple-600 mb-1">
                95%
              </Text>
              <Text className="text-gray-500 text-sm">Success Rate</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
              <Text className="text-3xl font-bold text-amber-600 mb-1">
                500+
              </Text>
              <Text className="text-gray-500 text-sm">Exams Conducted</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
