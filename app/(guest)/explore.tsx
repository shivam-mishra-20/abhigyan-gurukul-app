import { API_BASE } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BookOpen, Download, Eye, FileText, Play } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface StudyResource {
  _id: string;
  title: string;
  description: string;
  type: "video" | "pdf";
  resourceUrl: string;
  thumbnailUrl?: string;
  category: string;
  subject: string;
  classLevel: string;
  tags: string[];
  youtubeVideoId?: string;
  duration?: number;
  viewCount?: number;
  fileSize?: number;
  pageCount?: number;
  downloadCount?: number;
}

export default function GuestExplore() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"videos" | "materials">("videos");
  const [videos, setVideos] = useState<StudyResource[]>([]);
  const [materials, setMaterials] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const type = activeTab === "videos" ? "video" : "pdf";
      const response = await fetch(
        `${API_BASE}/api/resources?type=${type}&isPublic=true&status=published`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();

      if (activeTab === "videos") {
        setVideos(data);
      } else {
        setMaterials(data);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCount = (count?: number) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    return `${(count / 1000).toFixed(1)}K`;
  };

  const getYouTubeThumbnail = (videoId?: string, customThumbnail?: string) => {
    if (customThumbnail) return customThumbnail;
    if (videoId)
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return "https://via.placeholder.com/400x225/10B981/FFFFFF?text=No+Image";
  };

  const handleVideoPlay = (resource: StudyResource) => {
    const url = resource.youtubeVideoId
      ? `https://www.youtube.com/watch?v=${resource.youtubeVideoId}`
      : resource.resourceUrl;
    Linking.openURL(url);
  };

  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      Mathematics: "#3B82F6",
      Physics: "#8B5CF6",
      Chemistry: "#10B981",
      Biology: "#EC4899",
      English: "#F59E0B",
    };
    return colors[subject] || "#6B7280";
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#059669"]}
        className="pt-14 pb-8 px-6"
      >
        <View className="mb-4">
          <Text className="text-white text-3xl font-bold mb-2">
            Educational Resources
          </Text>
          <Text className="text-white/90 text-base">
            Access quality educational content from our library
          </Text>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-white/20 rounded-3xl p-1">
          <Pressable
            onPress={() => setActiveTab("videos")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "videos" ? "bg-white" : ""
            }`}
          >
            <View className="flex-row items-center">
              <Play
                size={18}
                color={activeTab === "videos" ? "#10B981" : "#FFFFFF"}
                strokeWidth={2.5}
              />
              <Text
                className={`ml-2 font-bold ${
                  activeTab === "videos" ? "text-green-600" : "text-white"
                }`}
              >
                Videos
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("materials")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "materials" ? "bg-white" : ""
            }`}
          >
            <View className="flex-row items-center">
              <FileText
                size={18}
                color={activeTab === "materials" ? "#10B981" : "#FFFFFF"}
                strokeWidth={2.5}
              />
              <Text
                className={`ml-2 font-bold ${
                  activeTab === "materials" ? "text-green-600" : "text-white"
                }`}
              >
                Materials
              </Text>
            </View>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="px-6 pt-6 pb-20">
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-gray-600 mt-4">Loading resources...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-20">
            <Text className="text-red-600 mb-2">⚠️ {error}</Text>
            <Pressable
              onPress={fetchResources}
              className="bg-green-600 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">Retry</Text>
            </Pressable>
          </View>
        ) : activeTab === "videos" ? (
          videos.length === 0 ? (
            <Text className="text-center text-gray-500 py-20">
              No videos available yet
            </Text>
          ) : (
            <>
              <Text className="text-gray-900 text-xl font-bold mb-4">
                Video Lectures
              </Text>
              {videos.map((video) => (
                <Pressable
                  key={video._id}
                  onPress={() => handleVideoPlay(video)}
                  className="mb-4 bg-white rounded-3xl overflow-hidden shadow-sm"
                >
                  {/* Thumbnail */}
                  <View className="relative">
                    <Image
                      source={{
                        uri: getYouTubeThumbnail(
                          video.youtubeVideoId,
                          video.thumbnailUrl,
                        ),
                      }}
                      className="w-full h-52"
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/20 items-center justify-center">
                      <View className="w-16 h-16 bg-white/90 rounded-full items-center justify-center">
                        <Play size={28} color="#10B981" fill="#10B981" />
                      </View>
                    </View>
                    {video.duration && (
                      <View className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 rounded-2xl">
                        <Text className="text-white text-xs font-bold">
                          {formatDuration(video.duration)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getSubjectColor(video.subject)}15`,
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: getSubjectColor(video.subject) }}
                        >
                          {video.subject}
                        </Text>
                      </View>
                      {video.classLevel && (
                        <View className="ml-2 px-3 py-1 rounded-full bg-gray-100">
                          <Text className="text-xs font-bold text-gray-600">
                            Class {video.classLevel}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-gray-900 text-base font-bold mb-1">
                      {video.title}
                    </Text>

                    {video.description && (
                      <Text
                        className="text-gray-600 text-sm mb-3"
                        numberOfLines={2}
                      >
                        {video.description}
                      </Text>
                    )}

                    <View className="flex-row items-center gap-4">
                      {video.viewCount !== undefined && (
                        <View className="flex-row items-center">
                          <Eye size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {formatCount(video.viewCount)} views
                          </Text>
                        </View>
                      )}
                      {video.tags && video.tags.length > 0 && (
                        <View className="flex-row items-center">
                          <Text className="text-gray-500 text-xs">
                            🏷️ {video.tags[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          )
        ) : materials.length === 0 ? (
          <Text className="text-center text-gray-500 py-20">
            No study materials available yet
          </Text>
        ) : (
          <>
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Study Materials
            </Text>
            {materials.map((material) => (
              <View
                key={material._id}
                className="mb-4 bg-white rounded-3xl p-4 shadow-sm"
              >
                <View className="flex-row items-start">
                  {/* Icon */}
                  <LinearGradient
                    colors={[
                      getSubjectColor(material.subject),
                      getSubjectColor(material.subject) + "80",
                    ]}
                    className="w-14 h-14 rounded-3xl items-center justify-center mr-4"
                  >
                    <FileText size={28} color="#FFFFFF" />
                  </LinearGradient>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getSubjectColor(material.subject)}15`,
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: getSubjectColor(material.subject) }}
                        >
                          {material.subject}
                        </Text>
                      </View>
                      {material.classLevel && (
                        <View className="ml-2 px-3 py-1 rounded-full bg-gray-100">
                          <Text className="text-xs font-bold text-gray-600">
                            Class {material.classLevel}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-gray-900 text-base font-bold mb-1">
                      {material.title}
                    </Text>

                    {material.description && (
                      <Text
                        className="text-gray-600 text-sm mb-3"
                        numberOfLines={2}
                      >
                        {material.description}
                      </Text>
                    )}

                    <View className="flex-row items-center gap-3 mb-3">
                      {material.pageCount && (
                        <View className="flex-row items-center">
                          <BookOpen size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {material.pageCount} pages
                          </Text>
                        </View>
                      )}
                      {material.fileSize && (
                        <View className="flex-row items-center">
                          <Ionicons name="document" size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {formatFileSize(material.fileSize)}
                          </Text>
                        </View>
                      )}
                      {material.downloadCount !== undefined && (
                        <View className="flex-row items-center">
                          <Download size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {formatCount(material.downloadCount)} downloads
                          </Text>
                        </View>
                      )}
                    </View>

                    <Pressable
                      onPress={() => handleDownload(material.resourceUrl)}
                      className="bg-green-600 px-4 py-2 rounded-2xl self-start"
                    >
                      <View className="flex-row items-center">
                        <Download size={16} color="#FFFFFF" />
                        <Text className="text-white font-bold text-sm ml-2">
                          Download PDF
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* CTA Section */}
        <View className="mt-8 rounded-3xl overflow-hidden">
          <LinearGradient
            colors={["#10B981", "#059669"]}
            className="rounded-2xl p-6"
          >
            <Text className="text-white text-xl font-bold mb-2">
              Want More?
            </Text>
            <Text className="text-white/90 text-sm mb-4">
              Register to access premium courses, get personalized learning
              paths, and track your progress
            </Text>
            <Pressable
              onPress={() => router.push("/(guest)/login")}
              className="bg-white rounded-3xl py-3"
            >
              <Text className="text-green-600 text-center font-bold">
                Register Now →
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}
