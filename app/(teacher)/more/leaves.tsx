import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};

interface Leave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function TeacherLeaveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState("personal");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const leaveTypes = [
    { value: "sick", label: "Sick Leave", icon: "medkit" },
    { value: "personal", label: "Personal", icon: "person" },
    { value: "emergency", label: "Emergency", icon: "alert-circle" },
    { value: "vacation", label: "Vacation", icon: "sunny" },
    { value: "other", label: "Other", icon: "ellipsis-horizontal" },
  ];

  const fetchLeaves = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await apiFetch("/api/leaves");
      setLeaves(data as Leave[]);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      Alert.alert("Error", "Failed to load leave requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for leave");
      return;
    }

    if (startDate > endDate) {
      Alert.alert("Error", "Start date must be before end date");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/leaves", {
        method: "POST",
        body: JSON.stringify({
          leaveType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: reason.trim(),
        }),
      });

      Alert.alert("Success", "Leave request submitted successfully");
      setShowForm(false);
      setReason("");
      setLeaveType("personal");
      setStartDate(new Date());
      setEndDate(new Date());
      fetchLeaves();
    } catch (error: any) {
      console.error("Error submitting leave:", error);
      Alert.alert("Error", error.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (leaveId: string) => {
    Alert.alert(
      "Delete Leave Request",
      "Are you sure you want to delete this leave request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/leaves/${leaveId}`, { method: "DELETE" });
              Alert.alert("Success", "Leave request deleted");
              fetchLeaves();
            } catch {
              Alert.alert("Error", "Failed to delete leave request");
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return THEME.success;
      case "rejected":
        return THEME.danger;
      default:
        return THEME.warning;
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    const leaveTypeData = leaveTypes.find((lt) => lt.value === type);
    return leaveTypeData?.icon || "document";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setShowForm(false)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Apply for Leave</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.formContainer}>
          {/* Leave Type Selection */}
          <Text style={styles.formLabel}>Leave Type</Text>
          <View style={styles.leaveTypeGrid}>
            {leaveTypes.map((type) => (
              <Pressable
                key={type.value}
                style={[
                  styles.leaveTypeCard,
                  leaveType === type.value && styles.leaveTypeCardActive,
                ]}
                onPress={() => setLeaveType(type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={leaveType === type.value ? THEME.primary : "#6B7280"}
                />
                <Text
                  style={[
                    styles.leaveTypeLabel,
                    leaveType === type.value && styles.leaveTypeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Date Selection */}
          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <Text style={styles.formLabel}>Start Date</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={THEME.primary}
                />
                <Text style={styles.dateText}>
                  {formatDate(startDate.toISOString())}
                </Text>
              </Pressable>
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.formLabel}>End Date</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={THEME.primary}
                />
                <Text style={styles.dateText}>
                  {formatDate(endDate.toISOString())}
                </Text>
              </Pressable>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === "ios");
                if (date) setStartDate(date);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === "ios");
                if (date) setEndDate(date);
              }}
            />
          )}

          {/* Reason */}
          <Text style={styles.formLabel}>Reason for Leave</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Please provide a reason for your leave request..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>
                  Submit Leave Request
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>My Leaves</Text>
        <View style={{ width: 40 }} />
      </View>

      <Pressable style={styles.applyButton} onPress={() => setShowForm(true)}>
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.applyButtonText}>Apply for Leave</Text>
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLeaves(true);
            }}
            tintColor={THEME.primary}
          />
        }
      >
        {leaves.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No leave requests yet</Text>
            <Text style={styles.emptySubtext}>
              Tap &quot;Apply for Leave&quot; to create a new request
            </Text>
          </View>
        ) : (
          <View style={styles.leavesList}>
            {leaves.map((leave) => (
              <View key={leave._id} style={styles.leaveCard}>
                <View style={styles.leaveHeader}>
                  <View style={styles.leaveTypeIconContainer}>
                    <Ionicons
                      name={getLeaveTypeIcon(leave.leaveType) as any}
                      size={20}
                      color={THEME.primary}
                    />
                  </View>
                  <View style={styles.leaveHeaderText}>
                    <Text style={styles.leaveTypeText}>
                      {leaveTypes.find((lt) => lt.value === leave.leaveType)
                        ?.label || leave.leaveType}
                    </Text>
                    <Text style={styles.leaveDateRange}>
                      {formatDate(leave.startDate)} -{" "}
                      {formatDate(leave.endDate)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(leave.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(leave.status) },
                      ]}
                    >
                      {leave.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.leaveReason}>{leave.reason}</Text>

                {leave.status === "approved" && leave.approvedBy && (
                  <View style={styles.approvalInfo}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={THEME.success}
                    />
                    <Text style={styles.approvalText}>
                      Approved by {leave.approvedBy.name}
                    </Text>
                  </View>
                )}

                {leave.status === "rejected" && leave.rejectionReason && (
                  <View style={styles.rejectionInfo}>
                    <Ionicons
                      name="close-circle"
                      size={14}
                      color={THEME.danger}
                    />
                    <Text style={styles.rejectionText}>
                      {leave.rejectionReason}
                    </Text>
                  </View>
                )}

                {leave.status === "pending" && (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(leave._id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={THEME.danger}
                    />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  leavesList: {
    padding: 16,
    gap: 12,
  },
  leaveCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  leaveHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  leaveTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${THEME.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  leaveTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  leaveDateRange: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  leaveReason: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  approvalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  approvalText: {
    fontSize: 13,
    color: THEME.success,
    fontWeight: "500",
  },
  rejectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    color: THEME.danger,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  deleteButtonText: {
    fontSize: 14,
    color: THEME.danger,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  leaveTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  leaveTypeCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  leaveTypeCardActive: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}05`,
  },
  leaveTypeLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  leaveTypeLabelActive: {
    color: THEME.primary,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  dateCol: {
    flex: 1,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  reasonInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
