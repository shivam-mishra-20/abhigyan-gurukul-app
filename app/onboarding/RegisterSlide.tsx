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
import { getApiBase } from "../../lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Class options
const CLASS_OPTIONS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Dropper",
];

// Board options
const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"];

// Target exam options
const TARGET_EXAM_OPTIONS = [
  "Boards",
  "JEE",
  "NEET",
  "CUET",
  "NDA",
  "Olympiad",
  "Other",
];

interface RegisterSlideProps {
  onBack: () => void;
  onRegistrationSuccess: () => void;
}

export default function RegisterSlide({
  onBack,
  onRegistrationSuccess,
}: RegisterSlideProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [board, setBoard] = useState("");
  const [targetExams, setTargetExams] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);

  const toggleTargetExam = (exam: string) => {
    if (targetExams.includes(exam)) {
      setTargetExams(targetExams.filter((e) => e !== exam));
    } else {
      setTargetExams([...targetExams, exam]);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !classLevel ||
      !board ||
      targetExams.length === 0
    ) {
      setError(
        "Please fill in all required fields and select at least one target exam"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE = getApiBase();
      const response = await fetch(`${API_BASE}/api/auth/public-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          phone: phone.trim() || undefined,
          classLevel,
          board,
          targetExams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onRegistrationSuccess();
      }, 3000);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Registration failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1" style={{ width: SCREEN_WIDTH }}>
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <View className="w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">
              Registration Successful!
            </Text>
            <Text className="text-gray-600 text-base text-center mb-4">
              Your student registration has been submitted successfully.
            </Text>
            <View className="bg-blue-50 rounded-lg p-4 mb-4 w-full">
              <Text className="text-blue-800 text-sm text-center font-medium mb-2">
                Class: {classLevel} | Board: {board}
              </Text>
              <Text className="text-blue-700 text-xs text-center">
                Target Exams: {targetExams.join(", ")}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm text-center mb-6">
              Please wait for admin approval to access personalized resources
              and study materials.
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              You will be redirected to the login screen shortly...
            </Text>
          </View>
        </View>
      </View>
    );
  }

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
          <View className="flex-1 px-6 py-8">
            {/* Back Button */}
            <Pressable
              onPress={onBack}
              className="flex-row items-center mb-6"
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text className="text-gray-700 text-base ml-2 font-medium">
                Back to Login
              </Text>
            </Pressable>

            {/* Registration Form Card */}
            <View className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
                Student Registration
              </Text>
              <Text className="text-gray-500 text-sm mb-6 text-center">
                Register to access personalized study resources
              </Text>

              {/* Name Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Full Name <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address <Text className="text-red-500">*</Text>
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

              {/* Phone Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone Number <Text className="text-gray-400">(Optional)</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Class Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Class <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowClassPicker(!showClassPicker)}
                  disabled={loading}
                  className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                >
                  <Ionicons name="school-outline" size={20} color="#9CA3AF" />
                  <Text
                    className={`flex-1 ml-3 text-base ${
                      classLevel ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {classLevel || "Select your class"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </Pressable>
                {showClassPicker && (
                  <View className="mt-2 bg-gray-50 rounded-lg border border-gray-200 max-h-48">
                    <ScrollView className="p-2">
                      {CLASS_OPTIONS.map((cls) => (
                        <Pressable
                          key={cls}
                          onPress={() => {
                            setClassLevel(cls);
                            setShowClassPicker(false);
                          }}
                          className={`p-3 rounded-lg mb-1 ${
                            classLevel === cls ? "bg-blue-100" : "bg-white"
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              classLevel === cls
                                ? "text-blue-700 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {cls}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Board Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Board <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowBoardPicker(!showBoardPicker)}
                  disabled={loading}
                  className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                >
                  <Ionicons name="book-outline" size={20} color="#9CA3AF" />
                  <Text
                    className={`flex-1 ml-3 text-base ${
                      board ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {board || "Select your board"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </Pressable>
                {showBoardPicker && (
                  <View className="mt-2 bg-gray-50 rounded-lg border border-gray-200 max-h-48">
                    <ScrollView className="p-2">
                      {BOARD_OPTIONS.map((brd) => (
                        <Pressable
                          key={brd}
                          onPress={() => {
                            setBoard(brd);
                            setShowBoardPicker(false);
                          }}
                          className={`p-3 rounded-lg mb-1 ${
                            board === brd ? "bg-blue-100" : "bg-white"
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              board === brd
                                ? "text-blue-700 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {brd}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Target Exams Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Target Exams <Text className="text-red-500">*</Text>
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  Select all exams you are preparing for
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {TARGET_EXAM_OPTIONS.map((exam) => (
                    <Pressable
                      key={exam}
                      onPress={() => toggleTargetExam(exam)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-full border ${
                        targetExams.includes(exam)
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          targetExams.includes(exam)
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {exam}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="At least 6 characters"
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

              {/* Confirm Password Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Re-enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
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

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                className={`${
                  loading ? "bg-blue-400" : "bg-blue-600"
                } rounded-lg py-4 items-center justify-center mb-4`}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Register
                  </Text>
                )}
              </Pressable>

              {/* Info Note */}
              <View className="bg-blue-50 rounded-lg p-3 flex-row">
                <Ionicons name="information-circle" size={16} color="#3b82f6" />
                <Text className="text-blue-700 text-xs ml-2 flex-1">
                  Your student account will be reviewed by an administrator.
                  After approval, you&apos;ll get access to personalized study
                  resources based on your class, board, and target exams.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
