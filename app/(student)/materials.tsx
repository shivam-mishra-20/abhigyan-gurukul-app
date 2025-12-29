import { getMaterials, Material, trackMaterialDownload } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
};

export default function MaterialsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");

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

  const handleDownload = async (material: Material) => {
    try {
      const result = await trackMaterialDownload(material._id);
      if (result.downloadUrl) {
        await Linking.openURL(result.downloadUrl);
      }
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf": return "document-text";
      case "video": return "play-circle";
      case "document": return "document";
      case "link": return "link";
      default: return "file-tray";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf": return "#dc2626";
      case "video": return "#7c3aed";
      case "document": return "#2563eb";
      case "link": return "#059669";
      default: return "#6b7280";
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
          <Text className="text-gray-900 font-bold text-lg">Study Materials</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Type Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-4">
          {uniqueTypes.map((type) => (
            <Pressable
              key={type}
              onPress={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === type ? "bg-emerald-600" : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`font-medium capitalize ${
                  activeFilter === type ? "text-white" : "text-gray-600"
                }`}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Materials List */}
        <View className="px-4 pb-6">
          {filteredMaterials.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="folder-open-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">No materials available</Text>
            </View>
          ) : (
            filteredMaterials.map((material) => {
              const typeColor = getTypeColor(material.type);
              return (
                <Pressable
                  key={material._id}
                  onPress={() => handleDownload(material)}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center active:scale-[0.98]"
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: typeColor + "20" }}
                  >
                    <Ionicons name={getTypeIcon(material.type) as any} size={24} color={typeColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold" numberOfLines={1}>
                      {material.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-500 text-sm">{material.subject}</Text>
                      {material.chapter && (
                        <Text className="text-gray-400 text-sm"> • {material.chapter}</Text>
                      )}
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="download" size={12} color="#9ca3af" />
                      <Text className="text-gray-400 text-xs ml-1">
                        {material.downloadCount} downloads
                      </Text>
                    </View>
                  </View>
                  <View className="bg-emerald-100 p-2 rounded-full">
                    <Ionicons name="download" size={20} color={THEME.primary} />
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
