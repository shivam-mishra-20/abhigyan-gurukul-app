import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  lateMinutes: number;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface UserInfo {
  name: string;
  empCode: string;
  role: string;
}

interface AttendanceResponse {
  user: UserInfo;
  stats: AttendanceStats;
  records: AttendanceRecord[];
}

type ViewMode = "month" | "date";

export default function TeacherAttendance() {
  const { isDark } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      let url: string;
      if (viewMode === "date") {
        const dateStr = selectedDate.toISOString().split("T")[0];
        url = `/api/attendance/me?from=${dateStr}&to=${dateStr}`;
      } else {
        url = `/api/attendance/me?month=${selectedMonth}&year=${selectedYear}`;
      }
      const res = (await apiFetch(url)) as AttendanceResponse;
      setData(res);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, selectedYear, selectedDate, viewMode]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string, forDark: boolean) => {
    switch (status) {
      case "present":
        return {
          bg: forDark ? "#065f46" : "#d1fae5",
          text: forDark ? "#6ee7b7" : "#047857",
          icon: "checkmark-circle",
        };
      case "absent":
        return {
          bg: forDark ? "#7f1d1d" : "#fee2e2",
          text: forDark ? "#fca5a5" : "#b91c1c",
          icon: "close-circle",
        };
      case "late":
        return {
          bg: forDark ? "#78350f" : "#fef3c7",
          text: forDark ? "#fcd34d" : "#b45309",
          icon: "time",
        };
      default:
        return {
          bg: forDark ? "#374151" : "#f3f4f6",
          text: forDark ? "#d1d5db" : "#4b5563",
          icon: "help-circle",
        };
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#111827" : "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 24,
          backgroundColor: isDark ? "#5b21b6" : "#7c3aed",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>
          My Attendance
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
          {data?.user?.name || "Teacher"} • #{data?.user?.empCode || "N/A"}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAttendance();
            }}
            colors={["#8b5cf6"]}
          />
        }
      >
        {/* View Mode Toggle */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDark ? "#1f2937" : "#e5e7eb",
              borderRadius: 12,
              padding: 4,
            }}
          >
            <Pressable
              onPress={() => setViewMode("month")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor:
                  viewMode === "month"
                    ? isDark
                      ? "#7c3aed"
                      : "#7c3aed"
                    : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    viewMode === "month"
                      ? "#fff"
                      : isDark
                        ? "#9ca3af"
                        : "#4b5563",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode("date")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor:
                  viewMode === "date"
                    ? isDark
                      ? "#7c3aed"
                      : "#7c3aed"
                    : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    viewMode === "date"
                      ? "#fff"
                      : isDark
                        ? "#9ca3af"
                        : "#4b5563",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                By Date
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Month or Date Selector */}
        {viewMode === "month" ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {months.map((month, index) => (
                  <Pressable
                    key={month}
                    onPress={() => setSelectedMonth(index + 1)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor:
                        selectedMonth === index + 1
                          ? "#7c3aed"
                          : isDark
                            ? "#1f2937"
                            : "#ffffff",
                      borderWidth: selectedMonth === index + 1 ? 0 : 1,
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color:
                          selectedMonth === index + 1
                            ? "#fff"
                            : isDark
                              ? "#d1d5db"
                              : "#374151",
                      }}
                    >
                      {month.substring(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <Ionicons
                name="calendar"
                size={24}
                color={isDark ? "#a78bfa" : "#7c3aed"}
              />
              <Text
                style={{
                  marginLeft: 12,
                  flex: 1,
                  fontSize: 16,
                  color: isDark ? "#f3f4f6" : "#1f2937",
                  fontWeight: "500",
                }}
              >
                {formatDisplayDate(selectedDate)}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </Pressable>

            {showDatePicker && (
              <Modal transparent animationType="fade">
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setShowDatePicker(false)}
                >
                  <View
                    style={{
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      borderRadius: 16,
                      padding: 20,
                      width: "90%",
                    }}
                  >
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      textColor={isDark ? "#fff" : "#000"}
                    />
                    <Pressable
                      onPress={() => setShowDatePicker(false)}
                      style={{
                        backgroundColor: "#7c3aed",
                        padding: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Done
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Modal>
            )}
          </View>
        )}

        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* Present */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#064e3b" : "#ecfdf5",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? "#065f46" : "#a7f3d0",
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={isDark ? "#34d399" : "#059669"}
              />
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: isDark ? "#34d399" : "#047857",
                  marginTop: 8,
                }}
              >
                {data?.stats?.present || 0}
              </Text>
              <Text
                style={{
                  color: isDark ? "#6ee7b7" : "#059669",
                  fontSize: 13,
                }}
              >
                Present
              </Text>
            </View>
            {/* Absent */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? "#991b1b" : "#fecaca",
              }}
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={isDark ? "#f87171" : "#dc2626"}
              />
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: isDark ? "#f87171" : "#b91c1c",
                  marginTop: 8,
                }}
              >
                {data?.stats?.absent || 0}
              </Text>
              <Text
                style={{
                  color: isDark ? "#fca5a5" : "#dc2626",
                  fontSize: 13,
                }}
              >
                Absent
              </Text>
            </View>
            {/* Late */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#78350f" : "#fffbeb",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? "#92400e" : "#fde68a",
              }}
            >
              <Ionicons
                name="time"
                size={28}
                color={isDark ? "#fbbf24" : "#d97706"}
              />
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: isDark ? "#fbbf24" : "#b45309",
                  marginTop: 8,
                }}
              >
                {data?.stats?.late || 0}
              </Text>
              <Text
                style={{
                  color: isDark ? "#fcd34d" : "#d97706",
                  fontSize: 13,
                }}
              >
                Late
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance Records */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#f3f4f6" : "#111827",
              marginBottom: 12,
            }}
          >
            {viewMode === "date"
              ? formatDisplayDate(selectedDate)
              : `${months[selectedMonth - 1]} ${selectedYear}`}
          </Text>

          {!data?.records || data.records.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 48,
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={64}
                color={isDark ? "#4b5563" : "#d1d5db"}
              />
              <Text
                style={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontSize: 18,
                  marginTop: 16,
                }}
              >
                No attendance records
              </Text>
              <Text
                style={{
                  color: isDark ? "#6b7280" : "#9ca3af",
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 32,
                }}
              >
                {viewMode === "date"
                  ? "No data for this date"
                  : `No data available for ${months[selectedMonth - 1]}`}
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            >
              {data.records.map((record, index) => {
                const statusStyle = getStatusColor(record.status, isDark);
                return (
                  <View
                    key={record.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      borderBottomWidth:
                        index < data.records.length - 1 ? 1 : 0,
                      borderBottomColor: isDark ? "#374151" : "#f3f4f6",
                    }}
                  >
                    {/* Date Column */}
                    <View style={{ marginRight: 16 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: isDark ? "#f3f4f6" : "#111827",
                        }}
                      >
                        {formatDate(record.date)}
                      </Text>
                    </View>

                    {/* Clock In/Out - Admin Style */}
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                      }}
                    >
                      {/* Clock In */}
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 10,
                            color: isDark ? "#9ca3af" : "#6b7280",
                            marginBottom: 2,
                          }}
                        >
                          IN
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            fontFamily:
                              Platform.OS === "ios" ? "Menlo" : "monospace",
                            color: record.clockIn
                              ? isDark
                                ? "#34d399"
                                : "#059669"
                              : isDark
                                ? "#6b7280"
                                : "#9ca3af",
                          }}
                        >
                          {record.clockIn || "--:--"}
                        </Text>
                      </View>

                      {/* Separator */}
                      <Text
                        style={{
                          fontSize: 18,
                          color: isDark ? "#4b5563" : "#d1d5db",
                        }}
                      >
                        →
                      </Text>

                      {/* Clock Out */}
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 10,
                            color: isDark ? "#9ca3af" : "#6b7280",
                            marginBottom: 2,
                          }}
                        >
                          OUT
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            fontFamily:
                              Platform.OS === "ios" ? "Menlo" : "monospace",
                            color: record.clockOut
                              ? isDark
                                ? "#f87171"
                                : "#dc2626"
                              : isDark
                                ? "#6b7280"
                                : "#9ca3af",
                          }}
                        >
                          {record.clockOut || "--:--"}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={{
                        backgroundColor: statusStyle.bg,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: statusStyle.text,
                          fontSize: 11,
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {record.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
