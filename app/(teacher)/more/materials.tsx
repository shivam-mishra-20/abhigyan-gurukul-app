import { API_BASE } from "@/lib/api";
import { useToast } from "@/lib/context";
import { deleteMaterial, getMaterials, Material } from "@/lib/enhancedApi";
import { StudentsService } from "@/lib/services/students.service";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = { primary: "#059669" };
const ASSIGNMENT_TYPES = [
  { value: "all", label: "All Students" },
  { value: "class", label: "Specific Classes" },
  { value: "batch", label: "Specific Batches" },
];

export default function TeacherMaterialsScreen() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Fetched data for assignment
  const [classLevels, setClassLevels] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  // Students list for future use in student-specific assignment
  // const [students, setStudents] = useState<Student[]>([]);

  // Upload/Edit modal
  const [uploadModal, setUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    classLevel: "",
    chapter: "",
    assignmentType: "class" as "all" | "class" | "batch" | "students",
    assignedClasses: [] as string[],
    assignedBatches: [] as string[],
    assignedStudents: [] as string[],
    isPublished: true,
  });

  // Subjects list
  const subjects = [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "English",
    "Hindi",
    "SST",
  ];

  const loadData = useCallback(async () => {
    try {
      const [materialsData, classData, batchData] = await Promise.all([
        getMaterials(),
        StudentsService.getClassLevels(),
        StudentsService.getBatches(),
      ]);
      setMaterials(materialsData);
      setClassLevels(
        classData.length > 0 ? classData : ["9", "10", "11", "12"],
      );
      setBatches(batchData);
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback values
      setClassLevels(["9", "10", "11", "12"]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        if (!form.title) {
          const name = result.assets[0].name.replace(/\.[^/.]+$/, "");
          setForm({ ...form, title: name });
        }
      }
    } catch {
      toast.error("Failed to pick file");
    }
  };

  const openUploadModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setForm({
        title: material.title,
        description: material.description || "",
        subject: material.subject,
        classLevel: material.classLevel,
        chapter: material.chapter || "",
        assignmentType: material.assignmentType || "class",
        assignedClasses: material.assignedClasses || [material.classLevel],
        assignedBatches: material.assignedBatches || [],
        assignedStudents: [],
        isPublished: material.isPublished,
      });
      setSelectedFile(null);
    } else {
      setEditingMaterial(null);
      resetForm();
    }
    setUploadModal(true);
  };

  const handleUpload = async () => {
    if (!editingMaterial && !selectedFile) {
      toast.error("Please select a file");
      return;
    }
    if (!form.title.trim() || !form.subject || !form.classLevel) {
      toast.error("Title, subject, and class are required");
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in again");
        setUploading(false);
        return;
      }

      const assignmentData = {
        assignmentType: form.assignmentType,
        assignedClasses:
          form.assignmentType === "class"
            ? form.assignedClasses.length > 0
              ? form.assignedClasses
              : [form.classLevel]
            : [],
        assignedBatches:
          form.assignmentType === "batch" ? form.assignedBatches : [],
        assignedStudents:
          form.assignmentType === "students" ? form.assignedStudents : [],
      };

      if (editingMaterial && !selectedFile) {
        // Update metadata only
        const response = await fetch(
          `${API_BASE}/api/materials/${editingMaterial._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: form.title.trim(),
              description: form.description.trim(),
              subject: form.subject,
              classLevel: form.classLevel,
              chapter: form.chapter.trim(),
              ...assignmentData,
              isPublished: form.isPublished,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Update failed");
        }
        toast.success("Material updated!");
      } else {
        // Upload new file
        const formData = new FormData();
        formData.append("file", {
          uri: selectedFile!.uri,
          name: selectedFile!.name,
          type: selectedFile!.mimeType || "application/octet-stream",
        } as any);

        formData.append("title", form.title.trim());
        formData.append("description", form.description.trim());
        formData.append("subject", form.subject);
        formData.append("classLevel", form.classLevel);
        formData.append("chapter", form.chapter.trim());
        formData.append("assignmentType", assignmentData.assignmentType);
        formData.append(
          "assignedClasses",
          JSON.stringify(assignmentData.assignedClasses),
        );
        formData.append(
          "assignedBatches",
          JSON.stringify(assignmentData.assignedBatches),
        );
        formData.append(
          "assignedStudents",
          JSON.stringify(assignmentData.assignedStudents),
        );
        formData.append("isPublished", form.isPublished ? "true" : "false");

        const url = editingMaterial
          ? `${API_BASE}/api/materials/${editingMaterial._id}/upload`
          : `${API_BASE}/api/materials/upload`;

        const response = await fetch(url, {
          method: editingMaterial ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
        toast.success(
          editingMaterial ? "Material updated!" : "Material uploaded!",
        );
      }

      setUploadModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async (material: Material) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/api/materials/${material._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPublished: !material.isPublished }),
        },
      );

      if (response.ok) {
        toast.success(material.isPublished ? "Unpublished" : "Published");
        loadData();
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setEditingMaterial(null);
    setForm({
      title: "",
      description: "",
      subject: "",
      classLevel: "",
      chapter: "",
      assignmentType: "class",
      assignedClasses: [],
      assignedBatches: [],
      assignedStudents: [],
      isPublished: true,
    });
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Material", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMaterial(id);
            toast.success("Deleted");
            loadData();
          } catch {
            toast.error("Failed to delete");
          }
        },
      },
    ]);
  };

  const toggleSelection = (
    value: string,
    field: "assignedClasses" | "assignedBatches" | "assignedStudents",
  ) => {
    const current = form[field];
    if (current.includes(value)) {
      setForm({ ...form, [field]: current.filter((v) => v !== value) });
    } else {
      setForm({ ...form, [field]: [...current, value] });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "document-text";
      case "image":
        return "image";
      case "video":
        return "play-circle";
      default:
        return "document";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "#dc2626";
      case "image":
        return "#059669";
      case "video":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-gray-900 font-bold text-lg">
              Study Materials
            </Text>
          </View>
          <Pressable
            onPress={() => openUploadModal()}
            className="bg-emerald-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-medium ml-1">New</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
          />
        }
      >
        <View className="px-4 py-4">
          {materials.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">No materials yet</Text>
            </View>
          ) : (
            materials.map((material) => (
              <View
                key={material._id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-start">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: getTypeColor(material.type) + "20",
                    }}
                  >
                    <Ionicons
                      name={getTypeIcon(material.type) as any}
                      size={24}
                      color={getTypeColor(material.type)}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text
                        className="text-gray-900 font-bold flex-1"
                        numberOfLines={1}
                      >
                        {material.title}
                      </Text>
                      <View
                        className={`px-2 py-0.5 rounded-full ${
                          material.isPublished ? "bg-green-100" : "bg-amber-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            material.isPublished
                              ? "text-green-700"
                              : "text-amber-700"
                          }`}
                        >
                          {material.isPublished ? "Published" : "Draft"}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {material.subject} • Class {material.classLevel}
                    </Text>
                    {material.assignmentType && (
                      <Text className="text-gray-400 text-xs mt-1">
                        Assigned:{" "}
                        {material.assignmentType === "all"
                          ? "All Students"
                          : material.assignmentType === "class"
                            ? `Classes ${material.assignedClasses?.join(", ")}`
                            : material.assignmentType === "batch"
                              ? `Batches ${material.assignedBatches?.join(", ")}`
                              : "Specific Students"}
                      </Text>
                    )}
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="download" size={12} color="#9ca3af" />
                      <Text className="text-gray-400 text-xs ml-1">
                        {material.downloadCount} downloads
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100 gap-2">
                  <Pressable
                    onPress={() => togglePublish(material)}
                    className={`px-3 py-1.5 rounded-lg ${
                      material.isPublished ? "bg-amber-100" : "bg-green-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        material.isPublished
                          ? "text-amber-700"
                          : "text-green-700"
                      }`}
                    >
                      {material.isPublished ? "Unpublish" : "Publish"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => openUploadModal(material)}
                    className="px-3 py-1.5 rounded-lg bg-blue-100"
                  >
                    <Text className="text-blue-700 text-sm font-medium">
                      Edit
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(material._id, material.title)}
                    className="px-3 py-1.5 rounded-lg bg-red-100"
                  >
                    <Text className="text-red-700 text-sm font-medium">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Upload/Edit Modal */}
      <Modal
        visible={uploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => {
                  setUploadModal(false);
                  resetForm();
                }}
                className="mr-3 p-1"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text className="text-gray-900 font-bold text-lg">
                {editingMaterial ? "Edit Material" : "Upload Material"}
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            {/* File Picker */}
            <Pressable
              onPress={pickDocument}
              className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center mb-4"
            >
              {selectedFile ? (
                <>
                  <Ionicons name="document-attach" size={32} color="#059669" />
                  <Text
                    className="text-gray-800 font-medium mt-2"
                    numberOfLines={1}
                  >
                    {selectedFile.name}
                  </Text>
                  <Text className="text-emerald-600 text-sm mt-1">
                    Tap to change
                  </Text>
                </>
              ) : editingMaterial ? (
                <>
                  <Ionicons name="document" size={32} color="#6b7280" />
                  <Text className="text-gray-600 mt-2">
                    Current file attached
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Tap to replace (optional)
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={48}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-500 mt-2">
                    Tap to select PDF or Image
                  </Text>
                </>
              )}
            </Pressable>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">Title *</Text>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="Material title"
                className="bg-white border border-gray-200 rounded-xl p-3"
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
                multiline
                numberOfLines={2}
                className="bg-white border border-gray-200 rounded-xl p-3"
                textAlignVertical="top"
              />
            </View>

            {/* Subject */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">Subject *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {subjects.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setForm({ ...form, subject: s })}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      form.subject === s
                        ? "bg-emerald-600"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        form.subject === s
                          ? "text-white font-medium"
                          : "text-gray-600"
                      }
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Primary Class */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">
                Primary Class *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {classLevels.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setForm({ ...form, classLevel: c })}
                    className={`px-4 py-2 rounded-full ${
                      form.classLevel === c
                        ? "bg-emerald-600"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        form.classLevel === c
                          ? "text-white font-medium"
                          : "text-gray-600"
                      }
                    >
                      Class {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Assignment Type */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">Assign To</Text>
              <View className="flex-row flex-wrap gap-2">
                {ASSIGNMENT_TYPES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() =>
                      setForm({ ...form, assignmentType: t.value as any })
                    }
                    className={`px-4 py-2 rounded-full ${
                      form.assignmentType === t.value
                        ? "bg-emerald-600"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        form.assignmentType === t.value
                          ? "text-white font-medium"
                          : "text-gray-600"
                      }
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Class Selection */}
            {form.assignmentType === "class" && (
              <View className="mb-4">
                <Text className="text-gray-800 font-medium mb-2">
                  Select Classes
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {classLevels.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => toggleSelection(c, "assignedClasses")}
                      className={`px-4 py-2 rounded-full ${
                        form.assignedClasses.includes(c)
                          ? "bg-blue-600"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          form.assignedClasses.includes(c)
                            ? "text-white font-medium"
                            : "text-gray-600"
                        }
                      >
                        Class {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text className="text-gray-400 text-xs mt-1">
                  {form.assignedClasses.length === 0
                    ? "Will default to primary class"
                    : `Selected: ${form.assignedClasses.join(", ")}`}
                </Text>
              </View>
            )}

            {/* Batch Selection */}
            {form.assignmentType === "batch" && (
              <View className="mb-4">
                <Text className="text-gray-800 font-medium mb-2">
                  Select Batches
                </Text>
                {batches.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {batches.map((b) => (
                      <Pressable
                        key={b}
                        onPress={() => toggleSelection(b, "assignedBatches")}
                        className={`px-4 py-2 rounded-full ${
                          form.assignedBatches.includes(b)
                            ? "bg-purple-600"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <Text
                          className={
                            form.assignedBatches.includes(b)
                              ? "text-white font-medium"
                              : "text-gray-600"
                          }
                        >
                          {b}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-400 text-sm">
                    No batches found
                  </Text>
                )}
                {form.assignedBatches.length > 0 && (
                  <Text className="text-gray-400 text-xs mt-1">
                    Selected: {form.assignedBatches.join(", ")}
                  </Text>
                )}
              </View>
            )}

            {/* Chapter */}
            <View className="mb-4">
              <Text className="text-gray-800 font-medium mb-2">
                Chapter (optional)
              </Text>
              <TextInput
                value={form.chapter}
                onChangeText={(t) => setForm({ ...form, chapter: t })}
                placeholder="e.g. Chapter 1"
                className="bg-white border border-gray-200 rounded-xl p-3"
              />
            </View>

            {/* Publish Toggle */}
            <Pressable
              onPress={() =>
                setForm({ ...form, isPublished: !form.isPublished })
              }
              className="flex-row items-center mb-6 bg-white p-4 rounded-xl border border-gray-200"
            >
              <View
                className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                  form.isPublished
                    ? "bg-emerald-600 border-emerald-600"
                    : "border-gray-300"
                }`}
              >
                {form.isPublished && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">
                  Publish immediately
                </Text>
                <Text className="text-gray-400 text-xs">
                  Students can see published materials
                </Text>
              </View>
            </Pressable>

            {/* Submit Button */}
            <Pressable
              onPress={handleUpload}
              disabled={uploading || (!editingMaterial && !selectedFile)}
              className={`py-4 rounded-xl items-center ${
                uploading || (!editingMaterial && !selectedFile)
                  ? "bg-gray-400"
                  : "bg-emerald-600"
              }`}
            >
              {uploading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold ml-2">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">
                  {editingMaterial ? "Save Changes" : "Upload Material"}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
