import { getLeaderboard, LeaderboardResponse } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [mode, setMode] = useState<"online" | "offline">("online");

  const loadData = useCallback(async () => {
    try {
      const response = await getLeaderboard({ limit: 50, mode });
      setData(response);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        bg: "#fef3c7",
        border: "#fbbf24",
        icon: "trophy",
        color: "#b45309",
      };
    if (rank === 2)
      return {
        bg: "#f3f4f6",
        border: "#9ca3af",
        icon: "medal",
        color: "#6b7280",
      };
    if (rank === 3)
      return {
        bg: "#fef3c7",
        border: "#d97706",
        icon: "medal",
        color: "#92400e",
      };
    return { bg: "#f3f4f6", border: "#e5e7eb", icon: null, color: "#374151" };
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading leaderboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-900 font-bold text-lg">Leaderboard</Text>
        </View>

        {/* Toggle - Using pure styles to avoid css-interop crash */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setMode("online")}
            style={[
              styles.toggleButton,
              mode === "online" && styles.toggleButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleButtonText,
                mode === "online" && styles.toggleButtonTextActive,
              ]}
            >
              Online
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("offline")}
            style={[
              styles.toggleButton,
              mode === "offline" && styles.toggleButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleButtonText,
                mode === "offline" && styles.toggleButtonTextActive,
              ]}
            >
              Offline
            </Text>
          </TouchableOpacity>
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
        {/* My Rank Card */}
        {data?.myRank && (
          <View className="mx-4 mt-4 bg-emerald-600 rounded-2xl p-5">
            <Text className="text-white/80 text-sm mb-2">Your Ranking</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center mr-4">
                  <Text className="text-white text-xl font-bold">
                    #{data.myRank.rank}
                  </Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">
                    {data.myRank.name}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {data.myRank.examsTaken} exams taken
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white text-2xl font-bold">
                  {data.myRank.avgPercentage}%
                </Text>
                <Text className="text-white/80 text-sm">avg score</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="px-4 py-4">
          <Text className="text-gray-500 text-sm mb-3">
            {data?.totalParticipants || 0} participants
          </Text>
        </View>

        {/* Leaderboard List */}
        <View className="px-4 pb-6">
          {!data?.leaderboard || data.leaderboard.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="podium-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">No rankings yet</Text>
            </View>
          ) : (
            data.leaderboard.map((entry) => {
              const style = getRankStyle(entry.rank);
              return (
                <View
                  key={entry.userId}
                  className="bg-white rounded-xl p-4 mb-2 shadow-sm border flex-row items-center"
                  style={{ borderColor: style.border }}
                >
                  {/* Rank */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: style.bg }}
                  >
                    {style.icon ? (
                      <Ionicons
                        name={style.icon as any}
                        size={20}
                        color={style.color}
                      />
                    ) : (
                      <Text
                        className="font-bold"
                        style={{ color: style.color }}
                      >
                        {entry.rank}
                      </Text>
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold">
                      {entry.name}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      {entry.classLevel && (
                        <Text className="text-gray-500 text-sm">
                          Class {entry.classLevel}
                        </Text>
                      )}
                      <Text className="text-gray-400 text-sm">
                        {" "}
                        • {entry.examsTaken} exams
                      </Text>
                    </View>
                  </View>

                  {/* Score */}
                  <View className="items-end">
                    <Text className="text-emerald-600 text-lg font-bold">
                      {entry.avgPercentage}%
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {entry.totalScore}/{entry.maxPossibleScore}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "#f3f4f6",
    padding: 4,
    borderRadius: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButtonText: {
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleButtonTextActive: {
    color: "#047857",
  },
});
