import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface AttendanceEntry {
  clockIn: string;
  clockOut: string;
  dayAndDate: string;
}

interface AttendanceResponse {
  records: AttendanceEntry[];
  stats: {
    present: number;
    absent: number;
    total: number;
  };
}

interface AttendanceSummary {
  presentDays: number;
  totalDays: number;
  percentage: number;
  absentDays: number;
}

export default function AttendanceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceEntry[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    try {
      const [recordsData, summaryData] = await Promise.all([
        apiFetch(`/api/attendance/my?month=${selectedMonth}&year=${selectedYear}`) as Promise<AttendanceResponse>,
        apiFetch('/api/attendance/summary') as Promise<AttendanceSummary>,
      ]);
      
      setAttendanceRecords(recordsData?.records || []);
      setStats(recordsData?.stats || { present: 0, absent: 0, total: 0 });
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading attendance:", error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [selectedMonth, selectedYear]);

  // Calculate hours from records
  const totalHours = attendanceRecords.reduce((acc, rec) => {
    if (!rec.clockIn || !rec.clockOut || rec.clockIn === "--:--" || rec.clockOut === "--:--") return acc;
    try {
      const parseTime = (t: string) => {
        const [hm, period] = t.split(" ");
        const [h, m] = hm.split(":").map(Number);
        let hour = h;
        if (period === "PM" && h !== 12) hour += 12;
        if (period === "AM" && h === 12) hour = 0;
        return hour * 60 + m;
      };
      const start = parseTime(rec.clockIn);
      const end = parseTime(rec.clockOut);
      const hours = (end - start) / 60;
      return acc + (hours > 0 ? hours : 0);
    } catch {
      return acc;
    }
  }, 0);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-gray-500 mt-4">Loading attendance...</Text>
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
          <Text className="text-gray-900 font-bold text-lg">Attendance</Text>
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
        {/* Summary Card */}
        {summary && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-gray-900 text-lg font-bold mb-4">Overall Attendance</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-gray-900 text-3xl font-bold">{summary.percentage}%</Text>
                <Text className="text-gray-500 text-sm">Attendance</Text>
              </View>
              <View className="items-center">
                <Text className="text-emerald-600 text-3xl font-bold">{summary.presentDays}</Text>
                <Text className="text-gray-500 text-sm">Present</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-900 text-3xl font-bold">{summary.totalDays}</Text>
                <Text className="text-gray-500 text-sm">Total Days</Text>
              </View>
            </View>
          </View>
        )}

        {/* Month Selector */}
        <View className="px-4 mt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {MONTHS.map((month, idx) => (
              <Pressable
                key={month}
                onPress={() => setSelectedMonth(idx + 1)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedMonth === idx + 1 ? "bg-emerald-600" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedMonth === idx + 1 ? "text-white" : "text-gray-600"
                  }`}
                >
                  {month}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Monthly Stats */}
        <View className="px-4 mt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-emerald-50 rounded-xl p-3 items-center">
              <Text className="text-emerald-700 text-xl font-bold">{stats.present}</Text>
              <Text className="text-emerald-600 text-xs">Present</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
              <Text className="text-red-700 text-xl font-bold">{stats.absent}</Text>
              <Text className="text-red-600 text-xs">Absent</Text>
            </View>
            <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
              <Text className="text-amber-700 text-xl font-bold">{totalHours.toFixed(1)}</Text>
              <Text className="text-amber-600 text-xs">Hours</Text>
            </View>
          </View>
        </View>

        {/* Records */}
        <View className="px-4 py-4">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </Text>

          {attendanceRecords.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">No records for this month</Text>
            </View>
          ) : (
            attendanceRecords.map((record, idx) => {
              const isPresent = record.clockIn !== "--:--" && record.clockOut !== "--:--";
              const date = new Date(record.dayAndDate);
              return (
                <View
                  key={`${record.dayAndDate}-${idx}`}
                  className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100 flex-row items-center"
                >
                  <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-gray-900 font-bold text-lg">{date.getDate()}</Text>
                    <Text className="text-gray-500 text-xs">{MONTHS[date.getMonth()]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      {date.toLocaleDateString("en-IN", { weekday: "long" })}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={12} color="#6b7280" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {record.clockIn} - {record.clockOut}
                      </Text>
                    </View>
                  </View>
                  <View 
                    className="px-3 py-1.5 rounded-full" 
                    style={{ backgroundColor: isPresent ? "#dcfce7" : "#fee2e2" }}
                  >
                    <Text 
                      className="font-semibold text-sm" 
                      style={{ color: isPresent ? THEME.primary : "#dc2626" }}
                    >
                      {isPresent ? "Present" : "Absent"}
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
