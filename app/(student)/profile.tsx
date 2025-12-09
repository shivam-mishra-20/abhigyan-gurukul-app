import { getUser, logout } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/splash");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-500 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">Profile</Text>
      </View>

      <View className="px-6 py-6">
        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="items-center mb-6">
            <View className="bg-blue-100 w-24 h-24 rounded-full items-center justify-center mb-3">
              <Ionicons name="person" size={48} color="#3b82f6" />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              {user?.name || "Student"}
            </Text>
            <Text className="text-gray-500 text-sm">{user?.email}</Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between py-3">
              <Text className="text-gray-600">Role</Text>
              <Text className="text-gray-900 font-semibold capitalize">
                {user?.role || "Student"}
              </Text>
            </View>
            {user?.classLevel && (
              <View className="flex-row justify-between py-3 border-t border-gray-100">
                <Text className="text-gray-600">Class</Text>
                <Text className="text-gray-900 font-semibold">
                  {user.classLevel}
                </Text>
              </View>
            )}
            {user?.batch && (
              <View className="flex-row justify-between py-3 border-t border-gray-100">
                <Text className="text-gray-600">Batch</Text>
                <Text className="text-gray-900 font-semibold">
                  {user.batch}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings Options */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Pressable className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="settings-outline" size={24} color="#6b7280" />
            <Text className="text-gray-900 ml-3 flex-1">Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
            <Text className="text-gray-900 ml-3 flex-1">Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center p-4">
            <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
            <Text className="text-gray-900 ml-3 flex-1">Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="bg-red-500 rounded-full py-4 items-center"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Logout</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
