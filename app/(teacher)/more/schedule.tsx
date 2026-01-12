import { getLiveSchedule, LiveScheduleResponse } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = {
  primary: "#059669",
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherScheduleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveData, setLiveData] = useState<LiveScheduleResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const notificationListener = useRef<Notifications.Subscription>();

  const loadData = async () => {
    try {
      const data = await getLiveSchedule();
      setLiveData(data);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data && data.type === 'schedule_update') {
        loadData();
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const todaySchedule = liveData?.todaySchedule || [];
  const currentClass = liveData?.currentClass;
  const nextClass = liveData?.nextClass;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </Pressable>
          <Text style={styles.headerTitle}>My Teaching Schedule</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {DAYS.map((day, index) => {
            const isToday = index === new Date().getDay();
            const isSelected = index === selectedDay;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(index)}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonActive,
                  isToday && !isSelected && styles.dayButtonToday
                ]}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.dayTextActive,
                  isToday && !isSelected && styles.dayTextToday
                ]}>
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Current Class Highlight */}
        {currentClass && selectedDay === new Date().getDay() && (
          <View style={styles.highlightSection}>
            <View style={styles.currentCard}>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>YOUR CLASS IS ONGOING</Text>
              </View>
              <Text style={styles.currentSubject}>{currentClass.subject}</Text>
              <Text style={styles.currentMeta}>
                Class {currentClass.classLevel} - {currentClass.batch} | Room {currentClass.roomNumber}
              </Text>
              <Text style={styles.currentTime}>
                {currentClass.startTimeSlot} - {currentClass.endTimeSlot}
              </Text>
            </View>
          </View>
        )}

        {/* Next Class */}
        {nextClass && !currentClass && selectedDay === new Date().getDay() && (
          <View style={styles.highlightSection}>
            <View style={styles.nextCard}>
              <Text style={styles.nextLabel}>NEXT CLASS</Text>
              <Text style={styles.nextSubject}>{nextClass.subject}</Text>
              <Text style={styles.nextMeta}>
                Class {nextClass.classLevel} - {nextClass.batch} | {nextClass.startTimeSlot}
              </Text>
            </View>
          </View>
        )}

        {/* Schedule List */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>
            {selectedDay === new Date().getDay() ? "Today's Classes" : `${DAYS[selectedDay]} Classes`}
          </Text>
          
          {todaySchedule.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No classes assigned</Text>
            </View>
          ) : (
            <View style={styles.scheduleList}>
              {todaySchedule.map((item, index) => {
                const isCurrent = liveData?.currentSlot === item.startTimeSlot;
                return (
                  <View key={item._id || index} style={styles.scheduleItem}>
                    <View style={styles.timeColumn}>
                      <Text style={[styles.timeText, isCurrent && styles.timeTextActive]}>
                        {item.startTimeSlot}
                      </Text>
                      <Text style={styles.timeEndText}>{item.endTimeSlot}</Text>
                    </View>
                    <View style={[styles.scheduleCard, isCurrent && styles.scheduleCardActive]}>
                      <View style={styles.scheduleCardHeader}>
                        <Text style={[styles.subjectText, isCurrent && styles.subjectTextActive]}>
                          {item.subject}
                        </Text>
                        {isCurrent && (
                          <View style={styles.ongoingBadge}>
                            <Text style={styles.ongoingText}>ONGOING</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.scheduleCardMeta}>
                        <Text style={styles.classInfo}>
                          Class {item.classLevel} - {item.batch}
                        </Text>
                        <Text style={styles.roomInfo}>Room {item.roomNumber}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
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
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  daySelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  dayButtonActive: {
    backgroundColor: THEME.primary,
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: THEME.primary,
    backgroundColor: "white",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  dayTextActive: {
    color: "white",
  },
  dayTextToday: {
    color: THEME.primary,
  },
  highlightSection: {
    padding: 16,
  },
  currentCard: {
    backgroundColor: THEME.primary,
    padding: 20,
    borderRadius: 16,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1,
  },
  currentSubject: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  currentMeta: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  nextCard: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#b45309",
    letterSpacing: 1,
    marginBottom: 4,
  },
  nextSubject: {
    fontSize: 18,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 2,
  },
  nextMeta: {
    fontSize: 13,
    color: "#b45309",
  },
  scheduleSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9ca3af",
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeColumn: {
    width: 50,
    marginRight: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  timeTextActive: {
    color: THEME.primary,
  },
  timeEndText: {
    fontSize: 11,
    color: "#9ca3af",
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  scheduleCardActive: {
    borderColor: THEME.primary,
    borderWidth: 2,
    backgroundColor: "#f0fdf4",
  },
  scheduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  subjectTextActive: {
    color: THEME.primary,
  },
  ongoingBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ongoingText: {
    fontSize: 9,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  scheduleCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  classInfo: {
    fontSize: 13,
    color: "#6b7280",
  },
  roomInfo: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
});
