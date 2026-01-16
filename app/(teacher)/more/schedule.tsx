import { apiFetch } from "@/lib/api";
import { getInstituteSchedule, getLiveSchedule, LiveScheduleResponse, ScheduleItem } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  
  // Core state
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Separate data states for each view mode
  const [myScheduleData, setMyScheduleData] = useState<ScheduleItem[]>([]);
  const [instituteScheduleData, setInstituteScheduleData] = useState<ScheduleItem[]>([]);
  const [liveData, setLiveData] = useState<LiveScheduleResponse | null>(null);
  
  // Get schedule data based on view mode
  const scheduleData = viewMode === 'my' ? myScheduleData : instituteScheduleData;
  
  // Refs
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const lastFetchKey = useRef<string>('');
  
  // Calculate dates for the week (for display in day selector)
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    return DAYS.map((_, index) => {
      const diff = index - currentDay;
      const date = new Date(today);
      date.setDate(today.getDate() + diff);
      return date;
    });
  }, []);
  
  // Calculate the date for the selected day
  const targetDate = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = selectedDay - currentDay;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date;
  }, [selectedDay]);
  
  const targetDateStr = useMemo(() => targetDate.toISOString().split('T')[0], [targetDate]);
  
  // Format date for display
  const formatDisplayDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      dayName: fullDays[date.getDay()],
      monthDay: `${months[date.getMonth()]} ${date.getDate()}`,
      dayNumber: date.getDate(),
    };
  };
  
  const fetchKey = useMemo(() => `${selectedDay}-${viewMode}`, [selectedDay, viewMode]);
  
  // Fetch schedule data
  const fetchScheduleData = useCallback(async (isRefresh = false) => {
    const key = `${selectedDay}-${viewMode}`;
    
    if (!isRefresh && isFetching && lastFetchKey.current === key) {
      return;
    }
    
    lastFetchKey.current = key;
    
    if (!isRefresh) {
      setIsFetching(true);
    }
    
    try {
      const isToday = selectedDay === new Date().getDay();
      
      if (viewMode === 'all') {
        // Institute-wide schedule
        try {
          const data = await getInstituteSchedule(targetDateStr);
          setInstituteScheduleData(data || []);
        } catch (e) {
          console.log('Error fetching institute schedule:', e);
          setInstituteScheduleData([]);
        }
      } else {
        // My Classes
        if (isToday) {
          try {
            const live = await getLiveSchedule();
            setLiveData(live);
            if (live?.todaySchedule) {
              setMyScheduleData(live.todaySchedule);
            }
          } catch (e) {
            console.log('Error fetching live data:', e);
          }
        } else {
          try {
            const data = await apiFetch(`/api/schedule/day-view?date=${targetDateStr}`) as ScheduleItem[];
            setMyScheduleData(data || []);
          } catch (e) {
            console.log('Error fetching day schedules:', e);
            setMyScheduleData([]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setIsInitialLoading(false);
      setIsFetching(false);
      setRefreshing(false);
    }
  }, [selectedDay, viewMode, targetDateStr, isFetching]);
  
  // Initial load and when parameters change
  useEffect(() => {
    fetchScheduleData();
  }, [fetchKey]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Setup notification listener and periodic refresh
  useEffect(() => {
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        const data = notification.request.content.data;
        if (data && data.type === 'schedule_update') {
          fetchScheduleData(true);
        }
      });
    } catch {
      console.log('Push notifications not available in Expo Go');
    }

    const refreshInterval = setInterval(() => {
      fetchScheduleData(true);
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScheduleData(true);
  }, [fetchScheduleData]);
  
  // Determine if we should show live banner
  const isToday = selectedDay === new Date().getDay();
  const currentClass = isToday ? liveData?.currentClass : null;
  const nextClass = isToday ? liveData?.nextClass : null;

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>
            {viewMode === 'my' ? 'My Classes' : 'Institute Schedule'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggleContainer}>
          <Pressable
            onPress={() => setViewMode('my')}
            style={[
              styles.viewToggleButton,
              viewMode === 'my' && styles.viewToggleButtonActive
            ]}
          >
            <Ionicons 
              name="person" 
              size={16} 
              color={viewMode === 'my' ? 'white' : '#6b7280'} 
            />
            <Text style={[
              styles.viewToggleText,
              viewMode === 'my' && styles.viewToggleTextActive
            ]}>My Classes</Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('all')}
            style={[
              styles.viewToggleButton,
              viewMode === 'all' && styles.viewToggleButtonActive
            ]}
          >
            <Ionicons 
              name="business" 
              size={16} 
              color={viewMode === 'all' ? 'white' : '#6b7280'} 
            />
            <Text style={[
              styles.viewToggleText,
              viewMode === 'all' && styles.viewToggleTextActive
            ]}>Institute</Text>
          </Pressable>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {DAYS.map((day, index) => {
            const isTodayIndex = index === new Date().getDay();
            const isSelected = index === selectedDay;
            const dateNum = weekDates[index].getDate();
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(index)}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonActive,
                  isTodayIndex && !isSelected && styles.dayButtonToday
                ]}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.dayTextActive,
                  isTodayIndex && !isSelected && styles.dayTextToday
                ]}>
                  {day}
                </Text>
                <Text style={[
                  styles.dateNum,
                  isSelected && styles.dateNumActive,
                  isTodayIndex && !isSelected && styles.dateNumToday
                ]}>
                  {dateNum}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Fetching indicator */}
        {isFetching && !refreshing && (
          <View style={styles.fetchingIndicator}>
            <ActivityIndicator size="small" color={THEME.primary} />
            <Text style={styles.fetchingText}>Updating...</Text>
          </View>
        )}

        {/* Current Class Highlight */}
        {currentClass && isToday && (
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
        {nextClass && !currentClass && isToday && (
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
            {isToday 
              ? `Today's Classes • ${formatDisplayDate(targetDate).monthDay}` 
              : `${formatDisplayDate(targetDate).dayName}, ${formatDisplayDate(targetDate).monthDay}`
            }
          </Text>
          
          {scheduleData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No classes assigned</Text>
            </View>
          ) : (
            <View style={styles.scheduleList}>
              {scheduleData.map((item, index) => {
                const isCurrent = liveData?.currentSlot === item.startTimeSlot && isToday;
                const isCustom = item.scheduleType === 'custom';
                
                return (
                  <View key={item._id || `schedule-${index}`} style={styles.scheduleItem}>
                    <View style={styles.timeColumn}>
                      <Text style={[styles.timeText, isCurrent && styles.timeTextActive]}>
                        {item.startTimeSlot}
                      </Text>
                      <Text style={styles.timeEndText}>{item.endTimeSlot}</Text>
                    </View>
                    <View style={[
                      styles.scheduleCard, 
                      isCurrent && styles.scheduleCardActive,
                      isCustom && styles.scheduleCardCustom
                    ]}>
                      <View style={styles.scheduleCardHeader}>
                        <Text style={[styles.subjectText, isCurrent && styles.subjectTextActive]}>
                          {item.subject}
                        </Text>
                        {isCurrent && (
                          <View style={styles.ongoingBadge}>
                            <Text style={styles.ongoingText}>ONGOING</Text>
                          </View>
                        )}
                        {isCustom && !isCurrent && (
                          <View style={styles.customBadge}>
                            <Text style={styles.customBadgeText}>Special</Text>
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
  fetchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    gap: 8,
  },
  fetchingText: {
    fontSize: 12,
    color: THEME.primary,
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
  dateNum: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 2,
  },
  dateNumActive: {
    color: "white",
  },
  dateNumToday: {
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
  scheduleCardCustom: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
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
  customBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  customBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d97706',
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
  // View Mode Toggle
  viewToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: THEME.primary,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewToggleTextActive: {
    color: 'white',
  },
});
