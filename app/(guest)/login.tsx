import { getUser, login } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function GuestLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const buttonScale = useSharedValue(1);
  const errorOpacity = useSharedValue(0);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      errorOpacity.value = withTiming(1, { duration: 300 });
      return;
    }

    setLoading(true);
    setError("");
    errorOpacity.value = 0;

    try {
      await login({ email: email.toLowerCase(), password });
      const user = await getUser();
      const role = user?.role || "guest";

      // Navigate based on role
      switch (role) {
        case "student":
          router.replace("/(student)/" as any);
          break;
        case "teacher":
        case "admin":
          router.replace("/(teacher)/" as any);
          break;
        default:
          router.replace("/(guest)/" as any);
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Login failed. Please try again.";
      setError(message);
      errorOpacity.value = withTiming(1, { duration: 300 });
    } finally {
      setLoading(false);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedErrorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-green-500 pt-14 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">Login</Text>
        <Text className="text-white text-sm opacity-90 mt-1">
          Access your personalized dashboard
        </Text>
      </View>

      <View className="px-6 py-8">
        {/* Login Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
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
            <Animated.View style={animatedErrorStyle} className="mb-4">
              <View className="bg-red-50 rounded-lg p-3 flex-row items-center">
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm ml-2">{error}</Text>
              </View>
            </Animated.View>
          ) : null}

          {/* Login Button */}
          <Animated.View style={animatedButtonStyle}>
            <Pressable
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              className="bg-green-500 rounded-full py-4 items-center justify-center shadow-lg"
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
                <Text className="text-white text-lg font-semibold">Login</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Info Text */}
          <Text className="text-gray-500 text-center text-sm mt-4">
            Don&apos;t have an account? Contact your administrator
          </Text>
        </View>

        {/* Role Info */}
        <View className="mt-6">
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
      </View>
    </ScrollView>
  );
}
