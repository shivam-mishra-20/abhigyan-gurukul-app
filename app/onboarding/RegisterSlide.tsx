import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getApiBase } from "../../lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Class options (7-12 and Dropper)
const CLASS_OPTIONS = [
  { label: "Class 7", value: "Class 7" },
  { label: "Class 8", value: "Class 8" },
  { label: "Class 9", value: "Class 9" },
  { label: "Class 10", value: "Class 10" },
  { label: "Class 11", value: "Class 11" },
  { label: "Class 12", value: "Class 12" },
  { label: "Dropper", value: "Dropper" },
];

// Board options
const BOARD_OPTIONS = [
  { label: "CBSE", value: "CBSE" },
  { label: "ICSE", value: "ICSE" },
  { label: "State Board", value: "State Board" },
  { label: "Other", value: "Other" },
];

// Batch options
const BATCH_OPTIONS = [
  { label: "Basic", value: "Basic" },
  { label: "Advanced", value: "Advanced" },
  { label: "JEE", value: "JEE" },
  { label: "NEET", value: "NEET" },
  { label: "Commerce", value: "Commerce" },
];

// Target exam options
const TARGET_EXAM_OPTIONS = [
  { label: "JEE Main", value: "JEE Main", icon: "rocket-outline" },
  { label: "JEE Advanced", value: "JEE Advanced", icon: "rocket-outline" },
  { label: "NEET", value: "NEET", icon: "medkit-outline" },
  { label: "CET", value: "CET", icon: "document-text-outline" },
  { label: "Board Exams", value: "Board Exams", icon: "school-outline" },
  { label: "CUET", value: "CUET", icon: "document-text-outline" },
  { label: "Olympiad", value: "Olympiad", icon: "trophy-outline" },
  { label: "Foundation", value: "Foundation", icon: "bookmarks-outline" },
  { label: "Other", value: "Other", icon: "ellipsis-horizontal-outline" },
];

interface RegisterSlideProps {
  onBack: () => void;
  onRegistrationSuccess: () => void;
}

// Dropdown Picker Component
interface DropdownPickerProps {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title: string;
}

function DropdownPicker({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title,
}: DropdownPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-white rounded-t-3xl max-h-96">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>
          <ScrollView className="px-3 py-2">
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className="flex-row items-center px-4 py-4 rounded-xl mb-1"
                style={{
                  backgroundColor:
                    selectedValue === option.value ? "#ecfdf5" : "transparent",
                }}
              >
                <View
                  className="w-6 h-6 rounded-full border-2 mr-4 items-center justify-center"
                  style={{
                    borderColor:
                      selectedValue === option.value ? "#10b981" : "#d1d5db",
                  }}
                >
                  {selectedValue === option.value && (
                    <View className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </View>
                <Text
                  className="flex-1 text-base"
                  style={{
                    color:
                      selectedValue === option.value ? "#065f46" : "#374151",
                    fontWeight: selectedValue === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <View className="h-8" />
        </View>
      </Pressable>
    </Modal>
  );
}

export default function RegisterSlide({
  onBack,
  onRegistrationSuccess,
}: RegisterSlideProps) {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [board, setBoard] = useState("");
  const [batch, setBatch] = useState("");
  const [targetExams, setTargetExams] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Picker modals
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [showBatchPicker, setShowBatchPicker] = useState(false);

  const toggleTargetExam = (exam: string) => {
    if (targetExams.includes(exam)) {
      setTargetExams(targetExams.filter((e) => e !== exam));
    } else {
      setTargetExams([...targetExams, exam]);
    }
  };

  const handleRegister = async () => {
    // Common validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    // Role-specific validation
    if (role === "student") {
      if (!classLevel || !board || targetExams.length === 0) {
        setError(
          "Please fill in class, board, and select at least one target exam",
        );
        return;
      }
    } else {
      if (!phone) {
        setError("Phone number is required for teachers");
        return;
      }
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const API_BASE = getApiBase();
      const endpoint =
        role === "student"
          ? `${API_BASE}/api/auth/public-register`
          : `${API_BASE}/api/auth/public-register-teacher`;

      const body =
        role === "student"
          ? {
              name,
              email,
              password,
              phone,
              classLevel,
              board,
              batch,
              targetExams,
            }
          : { name, email, password, phone };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  // Success Screen
  if (success) {
    return (
      <View className="flex-1" style={{ width: SCREEN_WIDTH }}>
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <View className="w-full bg-white rounded-3xl p-8 shadow-lg items-center">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">
              Registration Successful!
            </Text>
            <Text className="text-gray-600 text-base text-center mb-6">
              Your {role} account has been submitted for approval.
            </Text>
            {role === "student" && (
              <View className="bg-green-50 rounded-2xl p-4 mb-4 w-full">
                <Text className="text-green-800 text-sm text-center font-semibold">
                  {classLevel} • {board}
                </Text>
                <Text className="text-green-700 text-xs text-center mt-1">
                  {targetExams.join(" • ")}
                </Text>
              </View>
            )}
            <View className="bg-amber-50 rounded-2xl p-4 w-full flex-row items-center">
              <Ionicons name="time-outline" size={24} color="#d97706" />
              <Text className="text-amber-700 text-sm ml-3 flex-1">
                Admin approval required. You&apos;ll be notified once approved.
              </Text>
            </View>
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
      >
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="bg-green-600 pt-12 pb-8 px-6 rounded-b-3xl">
            <Pressable
              onPress={onBack}
              className="flex-row items-center mb-4"
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text className="text-white text-base ml-2 font-medium">
                Back
              </Text>
            </Pressable>
            <Text className="text-white text-2xl font-bold">
              Create Account
            </Text>
            <Text className="text-green-100 text-sm mt-1">
              Join our learning community today
            </Text>
          </View>

          <View className="flex-1 px-5 -mt-4">
            {/* Role Toggle */}
            <View className="bg-white rounded-2xl p-1.5 shadow-sm flex-row mb-5">
              <Pressable
                onPress={() => setRole("student")}
                disabled={loading}
                className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                style={{
                  backgroundColor:
                    role === "student" ? "#10b981" : "transparent",
                }}
              >
                <Ionicons
                  name="school"
                  size={18}
                  color={role === "student" ? "white" : "#6b7280"}
                />
                <Text
                  className="ml-2 font-semibold"
                  style={{ color: role === "student" ? "white" : "#6b7280" }}
                >
                  Student
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole("teacher")}
                disabled={loading}
                className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                style={{
                  backgroundColor:
                    role === "teacher" ? "#10b981" : "transparent",
                }}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={role === "teacher" ? "white" : "#6b7280"}
                />
                <Text
                  className="ml-2 font-semibold"
                  style={{ color: role === "teacher" ? "white" : "#6b7280" }}
                >
                  Teacher
                </Text>
              </Pressable>
            </View>

            {/* Form Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
              {/* Error Message */}
              {error ? (
                <View className="bg-red-50 rounded-xl p-3 mb-4 flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text className="text-red-600 text-sm ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Name Field */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Full Name <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="person-outline" size={20} color="#6b7280" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Email <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="mail-outline" size={20} color="#6b7280" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Phone{" "}
                  {role === "teacher" ? (
                    <Text className="text-red-500">*</Text>
                  ) : (
                    <Text className="text-gray-400">(Optional)</Text>
                  )}
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="call-outline" size={20} color="#6b7280" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Student-only Fields */}
              {role === "student" && (
                <>
                  {/* Class & Board Row */}
                  <View className="flex-row mb-4 gap-3">
                    {/* Class Picker */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Class <Text className="text-red-500">*</Text>
                      </Text>
                      <Pressable
                        onPress={() => setShowClassPicker(true)}
                        disabled={loading}
                        className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                      >
                        <Ionicons
                          name="school-outline"
                          size={20}
                          color="#6b7280"
                        />
                        <Text
                          className="flex-1 ml-3 text-base"
                          style={{ color: classLevel ? "#111827" : "#9CA3AF" }}
                        >
                          {classLevel || "Select"}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#6b7280"
                        />
                      </Pressable>
                    </View>

                    {/* Board Picker */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Board <Text className="text-red-500">*</Text>
                      </Text>
                      <Pressable
                        onPress={() => setShowBoardPicker(true)}
                        disabled={loading}
                        className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                      >
                        <Ionicons
                          name="book-outline"
                          size={20}
                          color="#6b7280"
                        />
                        <Text
                          className="flex-1 ml-3 text-base"
                          style={{ color: board ? "#111827" : "#9CA3AF" }}
                        >
                          {board || "Select"}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#6b7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Batch Picker */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Batch <Text className="text-gray-400">(Optional)</Text>
                    </Text>
                    <Pressable
                      onPress={() => setShowBatchPicker(true)}
                      disabled={loading}
                      className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color="#6b7280"
                      />
                      <Text
                        className="flex-1 ml-3 text-base"
                        style={{ color: batch ? "#111827" : "#9CA3AF" }}
                      >
                        {batch
                          ? BATCH_OPTIONS.find((b) => b.value === batch)?.label
                          : "Select your batch"}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color="#6b7280" />
                    </Pressable>
                  </View>

                  {/* Target Exams */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Target Exams <Text className="text-red-500">*</Text>
                    </Text>
                    <Text className="text-xs text-gray-500 mb-3">
                      Select all that apply
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {TARGET_EXAM_OPTIONS.map((exam) => {
                        const isSelected = targetExams.includes(exam.value);
                        return (
                          <Pressable
                            key={exam.value}
                            onPress={() => toggleTargetExam(exam.value)}
                            disabled={loading}
                            className="flex-row items-center px-4 py-2.5 rounded-full border"
                            style={{
                              backgroundColor: isSelected ? "#ecfdf5" : "white",
                              borderColor: isSelected ? "#10b981" : "#e5e7eb",
                            }}
                          >
                            <Ionicons
                              name={exam.icon as any}
                              size={16}
                              color={isSelected ? "#059669" : "#6b7280"}
                            />
                            <Text
                              className="ml-2 text-sm font-medium"
                              style={{
                                color: isSelected ? "#065f46" : "#374151",
                              }}
                            >
                              {exam.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Password <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#6b7280"
                  />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Min 6 characters"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password Field */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#6b7280"
                  />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Re-enter password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
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
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                className="rounded-xl py-4 items-center justify-center"
                style={{ backgroundColor: loading ? "#9ca3af" : "#10b981" }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Create Account
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Info Note */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-8 flex-row">
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
              <Text className="text-blue-700 text-sm ml-3 flex-1">
                Your account requires admin approval. You&apos;ll receive access
                once verified.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dropdown Modals */}
      <DropdownPicker
        visible={showClassPicker}
        onClose={() => setShowClassPicker(false)}
        options={CLASS_OPTIONS}
        selectedValue={classLevel}
        onSelect={setClassLevel}
        title="Select Class"
      />
      <DropdownPicker
        visible={showBoardPicker}
        onClose={() => setShowBoardPicker(false)}
        options={BOARD_OPTIONS}
        selectedValue={board}
        onSelect={setBoard}
        title="Select Board"
      />
      <DropdownPicker
        visible={showBatchPicker}
        onClose={() => setShowBatchPicker(false)}
        options={BATCH_OPTIONS}
        selectedValue={batch}
        onSelect={setBatch}
        title="Select Batch"
      />
    </View>
  );
}
