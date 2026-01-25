import { useToast } from "@/lib/context";
import {
    getMaterials,
    Material,
    trackMaterialDownload,
} from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = { primary: "#059669" };

export default function MaterialsScreen() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error("Error loading materials:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMaterials();
  }, []);

  // Open in browser (for viewing)
  const handleView = async (material: Material) => {
    try {
      await trackMaterialDownload(material._id);
      if (material.fileUrl) {
        await Linking.openURL(material.fileUrl);
      }
    } catch (error) {
      console.error("Error viewing:", error);
      toast.error("Failed to open file");
    }
  };

  // Download and save/share file
  const handleDownload = async (material: Material) => {
    setDownloading(material._id);
    try {
      const result = await trackMaterialDownload(material._id);
      const downloadUrl = result.downloadUrl || material.fileUrl;

      if (!downloadUrl) {
        toast.error("Download URL not available");
        return;
      }

      // Create filename
      const fileName =
        material.fileName ||
        `${material.title}.${material.type === "pdf" ? "pdf" : "jpg"}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      toast.info("Downloading...");

      // Download file
      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        fileUri,
      );

      if (downloadResult.status === 200) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          // Share/Save dialog - allows user to save to device or share
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: material.mimeType || "application/octet-stream",
            dialogTitle: `Save or Share: ${material.title}`,
          });
          toast.success("File ready to save!");
        } else {
          // Fallback for web or unsupported platforms
          Alert.alert("Download Complete", `File saved to: ${fileUri}`, [
            { text: "OK" },
          ]);
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download");
    } finally {
      setDownloading(null);
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
      case "document":
        return "document";
      default:
        return "file-tray";
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
      case "document":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  const filteredMaterials = materials.filter((m) => {
    if (activeFilter === "all") return true;
    return m.type === activeFilter;
  });

  const uniqueTypes = ["all", ...new Set(materials.map((m) => m.type))];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading materials...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-gray-900 font-bold text-lg">
            Study Materials
          </Text>
        </View>
      </View>

      {/* Filters */}
      {uniqueTypes.length > 1 && (
        <View className="bg-white px-4 py-2 border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {uniqueTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setActiveFilter(type)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  activeFilter === type ? "bg-emerald-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`capitalize font-medium ${
                    activeFilter === type ? "text-white" : "text-gray-600"
                  }`}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Materials List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
          />
        }
      >
        {filteredMaterials.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
            <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-3">No materials available</Text>
          </View>
        ) : (
          filteredMaterials.map((material) => (
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
                  <Text className="text-gray-900 font-bold" numberOfLines={2}>
                    {material.title}
                  </Text>
                  {material.description && (
                    <Text
                      className="text-gray-500 text-sm mt-1"
                      numberOfLines={2}
                    >
                      {material.description}
                    </Text>
                  )}
                  <View className="flex-row items-center mt-2 flex-wrap">
                    <View className="bg-gray-100 px-2 py-0.5 rounded mr-2">
                      <Text className="text-gray-600 text-xs">
                        {material.subject}
                      </Text>
                    </View>
                    <View className="bg-gray-100 px-2 py-0.5 rounded mr-2">
                      <Text className="text-gray-600 text-xs">
                        Class {material.classLevel?.replace(/Class\s*/i, "")}
                      </Text>
                    </View>
                    {material.fileSize && (
                      <Text className="text-gray-400 text-xs">
                        {(material.fileSize / 1024 / 1024).toFixed(1)} MB
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100 gap-2">
                {/* View Button */}
                <Pressable
                  onPress={() => handleView(material)}
                  className="px-4 py-2 rounded-lg bg-blue-100 flex-row items-center"
                >
                  <Ionicons name="eye-outline" size={16} color="#2563eb" />
                  <Text className="text-blue-700 font-medium ml-1">View</Text>
                </Pressable>

                {/* Download/Save Button */}
                <Pressable
                  onPress={() => handleDownload(material)}
                  disabled={downloading === material._id}
                  className={`px-4 py-2 rounded-lg flex-row items-center ${
                    downloading === material._id
                      ? "bg-gray-200"
                      : "bg-emerald-100"
                  }`}
                >
                  {downloading === material._id ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <>
                      <Ionicons
                        name="download-outline"
                        size={16}
                        color="#059669"
                      />
                      <Text className="text-emerald-700 font-medium ml-1">
                        Save
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
