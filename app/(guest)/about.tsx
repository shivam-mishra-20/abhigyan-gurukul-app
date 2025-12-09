import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function GuestAbout() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-green-500 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">About Us</Text>
        <Text className="text-white text-sm opacity-90 mt-1">
          Learn more about Abhigyan Gurukul
        </Text>
      </View>

      <View className="px-6 py-6">
        {/* Logo Section */}
        <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100 mb-6">
          <View className="bg-green-100 w-24 h-24 rounded-full items-center justify-center mb-4">
            <Ionicons name="school" size={48} color="#22c55e" />
          </View>
          <Text className="text-gray-900 text-2xl font-bold mb-2">
            Abhigyan Gurukul
          </Text>
          <Text className="text-gray-500 text-center">
            Nurturing minds, building futures
          </Text>
        </View>

        {/* Mission */}
        <View className="mb-6">
          <Text className="text-gray-900 text-xl font-bold mb-3">
            Our Mission
          </Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-gray-600 leading-6">
              To provide quality education that empowers students with
              knowledge, skills, and values necessary for success in an
              ever-changing world. We strive to create a learning environment
              that fosters curiosity, critical thinking, and holistic
              development.
            </Text>
          </View>
        </View>

        {/* Values */}
        <View className="mb-6">
          <Text className="text-gray-900 text-xl font-bold mb-3">
            Our Values
          </Text>
          <View className="gap-3">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Ionicons name="star" size={16} color="#3b82f6" />
                </View>
                <Text className="text-gray-900 font-bold">Excellence</Text>
              </View>
              <Text className="text-gray-500 text-sm">
                Striving for the highest standards in education
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-100 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Ionicons name="people" size={16} color="#22c55e" />
                </View>
                <Text className="text-gray-900 font-bold">Integrity</Text>
              </View>
              <Text className="text-gray-500 text-sm">
                Building character through honesty and ethics
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Ionicons name="bulb" size={16} color="#8b5cf6" />
                </View>
                <Text className="text-gray-900 font-bold">Innovation</Text>
              </View>
              <Text className="text-gray-500 text-sm">
                Embracing modern teaching methods and technology
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View>
          <Text className="text-gray-900 text-xl font-bold mb-3">
            Contact Us
          </Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <Ionicons name="mail" size={20} color="#22c55e" />
              <Text className="text-gray-600 ml-3">
                info@abhigyan-gurukul.com
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Ionicons name="call" size={20} color="#22c55e" />
              <Text className="text-gray-600 ml-3">+91 9876543210</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#22c55e" />
              <Text className="text-gray-600 ml-3 flex-1">
                123 Education Lane, Learning City, India
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
