import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { API_BASE } from "@/lib/api";
import { useToast } from "@/lib/context";
import { getHomeworkDetail, Homework, updateHomework } from "@/lib/enhancedApi";
import { StudentsService } from "@/lib/services/students.service";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = { primary: "#059669" };

const SUBJECTS = [
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Biology", label: "Biology" },
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "SST", label: "Social Studies" },
];

const ASSIGNMENT_TYPES = [
  { value: "all", label: "All Students" },
  { value: "class", label: "Specific Classes" },
  { value: "batch", label: "Specific Batches" },
];

interface Attachment {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  isNew?: boolean;
}

export default function EditHomeworkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Dynamic data
  const [classOptions, setClassOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [batchOptions, setBatchOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    subject: "",
    classLevel: "",
    dueDate: null as Date | null,
    assignmentType: "all" as "all" | "class" | "batch" | "students",
    assignedClasses: [] as string[],
    assignedBatches: [] as string[],
    status: "draft" as "draft" | "published" | "closed",
    allowLateSubmission: false,
    maxPoints: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [classData, batchData, homeworkData] = await Promise.all([
        StudentsService.getClassLevels(),
        StudentsService.getBatches(),
        getHomeworkDetail(id),
      ]);

      // Set options
      const classes =
        classData.length > 0 ? classData : ["9", "10", "11", "12"];
      setClassOptions(classes.map((c) => ({ value: c, label: `Class ${c}` })));
      setBatchOptions(batchData.map((b) => ({ value: b, label: b })));

      // Populate form with existing data
      setForm({
        title: homeworkData.title || "",
        description: homeworkData.description || "",
        instructions: homeworkData.instructions || "",
        subject: homeworkData.subject || "",
        classLevel: homeworkData.classLevel || "",
        dueDate: homeworkData.dueDate ? new Date(homeworkData.dueDate) : null,
        assignmentType: homeworkData.assignmentType || "all",
        assignedClasses: homeworkData.assignedClasses || [],
        assignedBatches: homeworkData.assignedBatches || [],
        status: homeworkData.status || "draft",
        allowLateSubmission: homeworkData.allowLateSubmission || false,
        maxPoints: homeworkData.maxPoints?.toString() || "",
      });

      // Load existing attachments
      if (homeworkData.attachments && homeworkData.attachments.length > 0) {
        setAttachments(
          homeworkData.attachments.map((att: any) => ({
            uri: att.url || att.uri,
            name: att.filename || att.name,
            mimeType: att.mimeType || "application/octet-stream",
          })),
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load homework");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setNewAttachments([
          ...newAttachments,
          {
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType || "application/octet-stream",
            size: file.size,
            isNew: true,
          },
        ]);
        toast.success("File added!");
      }
    } catch {
      toast.error("Failed to select file");
    }
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  const uploadNewAttachments = async (homeworkId: string) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;

    for (const att of newAttachments) {
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: att.uri,
          name: att.name,
          type: att.mimeType,
        } as any);

        await fetch(`${API_BASE}/api/homework/${homeworkId}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.subject) {
      toast.error("Subject is required");
      return;
    }
    if (!form.classLevel) {
      toast.error("Primary class is required");
      return;
    }
    if (form.assignmentType === "batch" && form.assignedBatches.length === 0) {
      toast.error("Select at least one batch");
      return;
    }
    if (form.assignmentType === "class" && form.assignedClasses.length === 0) {
      toast.error("Select at least one class");
      return;
    }

    setLoading(true);
    try {
      const data: Partial<Homework> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
        subject: form.subject,
        classLevel: form.classLevel,
        assignmentType: form.assignmentType,
        assignedClasses:
          form.assignmentType === "class"
            ? form.assignedClasses.length > 0
              ? form.assignedClasses
              : [form.classLevel]
            : [],
        assignedBatches:
          form.assignmentType === "batch" ? form.assignedBatches : [],
        dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
        status: form.status,
        allowLateSubmission: form.allowLateSubmission,
        maxPoints: form.maxPoints ? parseInt(form.maxPoints) : undefined,
      };

      await updateHomework(id, data);

      // Upload new attachments if any
      if (newAttachments.length > 0) {
        setUploading(true);
        toast.info("Uploading attachments...");
        await uploadNewAttachments(id);
      }

      toast.success("Homework updated successfully!");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "Failed to update homework");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-3">Loading homework...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Pressable onPress={() => router.back()} className="mr-3 p-1">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text className="text-gray-900 font-bold text-lg">
                Edit Homework
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                form.status === "published"
                  ? "bg-emerald-100"
                  : form.status === "closed"
                    ? "bg-gray-100"
                    : "bg-amber-100"
              }`}
            >
              <Text
                className={`text-xs font-medium capitalize ${
                  form.status === "published"
                    ? "text-emerald-700"
                    : form.status === "closed"
                      ? "text-gray-700"
                      : "text-amber-700"
                }`}
              >
                {form.status}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-emerald-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="document-text" size={18} color="#059669" />
              </View>
              <Text className="text-gray-900 font-semibold text-base">
                Basic Information
              </Text>
            </View>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">
                Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="Enter homework title"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800"
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">
                Description
              </Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Brief description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 min-h-[80px]"
                textAlignVertical="top"
              />
            </View>

            {/* Instructions */}
            <View>
              <Text className="text-gray-800 font-medium mb-2">
                Instructions
              </Text>
              <TextInput
                value={form.instructions}
                onChangeText={(t) => setForm({ ...form, instructions: t })}
                placeholder="Instructions for students"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 min-h-[80px]"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Attachments Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="attach" size={18} color="#8b5cf6" />
              </View>
              <Text className="text-gray-900 font-semibold text-base">
                Attachments
              </Text>
            </View>

            {/* Existing attachments */}
            {attachments.length > 0 && (
              <View className="mb-3">
                <Text className="text-gray-500 text-xs mb-2 uppercase">
                  Existing Files
                </Text>
                {attachments.map((att, index) => (
                  <View
                    key={`existing-${index}`}
                    className="flex-row items-center bg-gray-50 rounded-xl p-3 mb-2"
                  >
                    <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons
                        name={
                          att.mimeType?.includes("pdf")
                            ? "document-text"
                            : "image"
                        }
                        size={20}
                        color="#8b5cf6"
                      />
                    </View>
                    <Text
                      className="text-gray-700 flex-1 font-medium"
                      numberOfLines={1}
                    >
                      {att.name}
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                ))}
              </View>
            )}

            <Pressable
              onPress={pickFile}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-5 items-center"
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 font-medium">
                Add more files
              </Text>
              <Text className="text-gray-400 text-xs mt-1">PDF or Images</Text>
            </Pressable>

            {/* New attachments */}
            {newAttachments.length > 0 && (
              <View className="mt-3">
                <Text className="text-gray-500 text-xs mb-2 uppercase">
                  New Files
                </Text>
                {newAttachments.map((att, index) => (
                  <View
                    key={`new-${index}`}
                    className="flex-row items-center bg-emerald-50 rounded-xl p-3 mb-2"
                  >
                    <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons
                        name={
                          att.mimeType?.includes("pdf")
                            ? "document-text"
                            : "image"
                        }
                        size={20}
                        color="#059669"
                      />
                    </View>
                    <Text
                      className="text-gray-700 flex-1 font-medium"
                      numberOfLines={1}
                    >
                      {att.name}
                    </Text>
                    <Pressable
                      onPress={() => removeNewAttachment(index)}
                      className="p-2"
                    >
                      <Ionicons name="close-circle" size={22} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Classification Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="grid" size={18} color="#3b82f6" />
              </View>
              <Text className="text-gray-900 font-semibold text-base">
                Classification
              </Text>
            </View>

            <SelectDropdown
              label="Subject"
              value={form.subject}
              options={SUBJECTS}
              onSelect={(v) => setForm({ ...form, subject: v as string })}
              placeholder="Select subject"
              required
              icon="book"
            />

            <SelectDropdown
              label="Primary Class"
              value={form.classLevel}
              options={classOptions}
              onSelect={(v) => setForm({ ...form, classLevel: v as string })}
              placeholder="Select class"
              required
              icon="school"
            />
          </View>

          {/* Assignment Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-amber-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="people" size={18} color="#f59e0b" />
              </View>
              <Text className="text-gray-900 font-semibold text-base">
                Assignment Target
              </Text>
            </View>

            <SelectDropdown
              label="Assign To"
              value={form.assignmentType}
              options={ASSIGNMENT_TYPES}
              onSelect={(v) =>
                setForm({
                  ...form,
                  assignmentType: v as "all" | "class" | "batch",
                })
              }
              placeholder="Select target"
              icon="flag"
            />

            {form.assignmentType === "class" && (
              <SelectDropdown
                label="Select Classes"
                value={form.assignedClasses}
                options={classOptions}
                onSelect={(v) =>
                  setForm({ ...form, assignedClasses: v as string[] })
                }
                placeholder="Choose classes"
                multiSelect
                icon="school-outline"
              />
            )}

            {form.assignmentType === "batch" && (
              <SelectDropdown
                label="Select Batches"
                value={form.assignedBatches}
                options={batchOptions}
                onSelect={(v) =>
                  setForm({ ...form, assignedBatches: v as string[] })
                }
                placeholder={
                  batchOptions.length > 0
                    ? "Choose batches"
                    : "No batches available"
                }
                multiSelect
                icon="layers-outline"
              />
            )}
          </View>

          {/* Settings Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="settings" size={18} color="#6b7280" />
              </View>
              <Text className="text-gray-900 font-semibold text-base">
                Settings
              </Text>
            </View>

            {/* Due Date */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">Due Date</Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={form.dueDate ? "#059669" : "#9ca3af"}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    className={form.dueDate ? "text-gray-800" : "text-gray-400"}
                  >
                    {form.dueDate
                      ? formatDate(form.dueDate)
                      : "Select due date"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={form.dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setForm({ ...form, dueDate: selectedDate });
                  }
                }}
              />
            )}

            {/* Max Points */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">
                Max Points (optional)
              </Text>
              <TextInput
                value={form.maxPoints}
                onChangeText={(t) => setForm({ ...form, maxPoints: t })}
                placeholder="e.g. 100"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800"
              />
            </View>

            {/* Allow Late Submission */}
            <Pressable
              onPress={() =>
                setForm({
                  ...form,
                  allowLateSubmission: !form.allowLateSubmission,
                })
              }
              className="flex-row items-center bg-gray-50 p-4 rounded-xl"
            >
              <View
                className={`w-6 h-6 rounded-lg border-2 mr-3 items-center justify-center ${
                  form.allowLateSubmission
                    ? "bg-emerald-600 border-emerald-600"
                    : "border-gray-300"
                }`}
              >
                {form.allowLateSubmission && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <View>
                <Text className="text-gray-800 font-medium">
                  Allow late submissions
                </Text>
                <Text className="text-gray-500 text-xs">
                  Students can submit after due date
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading || uploading}
            className={`py-4 rounded-xl items-center flex-row justify-center ${
              loading || uploading ? "bg-gray-400" : "bg-emerald-600"
            }`}
          >
            {loading || uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2 text-base">
                  Save Changes
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
