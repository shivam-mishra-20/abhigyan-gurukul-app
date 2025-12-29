import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getUser, login, logout } from "../../lib/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LoginSlideProps {
  onLoginSuccess: (role: string) => void;
  onSkip: () => void;
  onRegister: () => void;
}

export default function LoginSlide({
  onLoginSuccess,
  onSkip,
  onRegister,
}: LoginSlideProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login({ email: email.toLowerCase(), password });
      const user = await getUser();
      const role = user?.role || "guest";

      // Block admin login
      if (role === "admin") {
        setError("Admin access is restricted to web portal only");
        await logout();
        setLoading(false);
        return;
      }

      // Navigate based on role
      onLoginSuccess(role);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Login failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ width: SCREEN_WIDTH }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 py-8">
            {/* Login Form Card */}
            <View className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Text className="text-gray-900 text-xl font-bold mb-6 text-center">
                Welcome Back!
              </Text>

              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View className="mb-4">
                  <View className="bg-red-50 rounded-lg p-3 flex-row items-center">
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text className="text-red-500 text-sm ml-2 flex-1">
                      {error}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                className="bg-green-500 rounded-full py-4 items-center justify-center shadow-lg mb-3"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-semibold">
                    Login
                  </Text>
                )}
              </Pressable>

              {/* Register Button */}
              <Pressable
                onPress={onRegister}
                disabled={loading}
                className="bg-blue-500 rounded-full py-4 items-center justify-center shadow-lg"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text className="text-white text-lg font-semibold">
                  Register New Account
                </Text>
              </Pressable>

              {/* Info Text */}
              <Text className="text-gray-500 text-center text-sm mt-4">
                New users require admin approval after registration
              </Text>
            </View>

            {/* Role Info */}
            <View className="mt-6 w-full">
              <Text className="text-gray-900 text-sm font-semibold mb-3">
                Login as:
              </Text>
              <View className="gap-2">
                <View className="bg-white rounded-xl p-3 border border-gray-100 flex-row items-center">
                  <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={16} color="#3b82f6" />
                  </View>
                  <Text className="text-gray-600 text-sm">
                    Student - Access exams and results
                  </Text>
                </View>
                <View className="bg-white rounded-xl p-3 border border-gray-100 flex-row items-center">
                  <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Ionicons name="school" size={16} color="#8b5cf6" />
                  </View>
                  <Text className="text-gray-600 text-sm">
                    Teacher - Manage exams and students
                  </Text>
                </View>
              </View>
            </View>

            {/* Skip Button - Top Right */}
            <Pressable
              onPress={onSkip}
              className="absolute top-14 right-6 py-2 px-4 z-10"
            >
              <Text className="text-gray-600 text-base font-medium">Skip</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
