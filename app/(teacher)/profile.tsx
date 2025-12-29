import { COLORS, GRADIENTS, SHADOWS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Menu Item Component
const MenuItem = ({
  icon,
  label,
  value,
  onPress,
  danger = false,
  toggle = false,
  toggleValue = false,
  onToggle,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: COLORS.white,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: danger ? COLORS.errorLight : COLORS.primaryBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? COLORS.error : COLORS.primary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: danger ? COLORS.error : COLORS.gray800,
            }}
          >
            {label}
          </Text>
          {value && (
            <Text style={{ fontSize: 13, color: COLORS.gray500, marginTop: 2 }}>
              {value}
            </Text>
          )}
        </View>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
            thumbColor={toggleValue ? COLORS.primary : COLORS.gray400}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        )}
      </Pressable>
    </Animated.View>
  );
};

// Stat Badge Component
const StatBadge = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
    }}
  >
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: color + "20",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}
    >
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.gray900 }}>
      {value}
    </Text>
    <Text style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>
      {label}
    </Text>
  </View>
);

export default function TeacherProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      Alert.alert("Success", "Password changed successfully");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/splash");
        },
      },
    ]);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      edges={["top"]}
    >
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: COLORS.gray50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header with Profile */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 8, paddingBottom: 60, paddingHorizontal: 20 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </Pressable>
              <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>
                Profile
              </Text>
            </View>

            {/* Profile Info */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 4,
                  borderColor: "rgba(255,255,255,0.5)",
                }}
              >
                <Ionicons name="person" size={48} color="white" />
              </View>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "700" }}>
                {user?.name || "Teacher Name"}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {user?.email || "teacher@school.com"}
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role || "Teacher"} Account
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Card - Overlapping */}
        <View
          style={{
            marginTop: -40,
            marginHorizontal: 20,
            backgroundColor: COLORS.white,
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 12,
            flexDirection: "row",
            ...SHADOWS.lg,
          }}
        >
          <StatBadge
            icon="school"
            label="Students"
            value="245"
            color={COLORS.primary}
          />
          <View style={{ width: 1, backgroundColor: COLORS.gray200 }} />
          <StatBadge
            icon="document-text"
            label="Exams"
            value="32"
            color={COLORS.info}
          />
          <View style={{ width: 1, backgroundColor: COLORS.gray200 }} />
          <StatBadge
            icon="star"
            label="Rating"
            value="4.8"
            color={COLORS.warning}
          />
        </View>

        {/* About Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.gray500,
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            ABOUT
          </Text>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="briefcase-outline"
              label="Department"
              value="Science & Mathematics"
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="ribbon-outline"
              label="Experience"
              value="5 Years"
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem icon="calendar-outline" label="Joined" value="Jan 2019" />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.gray500,
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            PREFERENCES
          </Text>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="notifications-outline"
              label="Push Notifications"
              toggle
              toggleValue={notifications}
              onToggle={setNotifications}
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="moon-outline"
              label="Dark Mode"
              toggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.gray500,
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            SETTINGS
          </Text>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              onPress={() => {}}
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Change Password"
              onPress={() => setShowPasswordModal(true)}
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Settings"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.gray500,
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            SUPPORT
          </Text>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="chatbubble-outline"
              label="Contact Us"
              onPress={() => {}}
            />
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms & Conditions"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Logout */}
        <View
          style={{ marginTop: 24, marginHorizontal: 20, marginBottom: 100 }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </View>

          {/* Version Info */}
          <Text
            style={{
              textAlign: "center",
              color: COLORS.gray400,
              fontSize: 12,
              marginTop: 20,
            }}
          >
            Abhigyan Gurukul v1.0.0
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: COLORS.gray900,
                }}
              >
                Change Password
              </Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray400} />
              </Pressable>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, color: COLORS.gray600, marginBottom: 8 }}
              >
                Current Password
              </Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, currentPassword: text })
                }
                placeholder="Enter current password"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray200,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: COLORS.gray800,
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 14, color: COLORS.gray600, marginBottom: 8 }}
              >
                New Password
              </Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, newPassword: text })
                }
                placeholder="Enter new password"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray200,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: COLORS.gray800,
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{ fontSize: 14, color: COLORS.gray600, marginBottom: 8 }}
              >
                Confirm New Password
              </Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: text })
                }
                placeholder="Confirm new password"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray200,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: COLORS.gray800,
                }}
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              disabled={changingPassword}
              style={{
                backgroundColor: changingPassword
                  ? COLORS.gray400
                  : COLORS.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: COLORS.white, fontSize: 16, fontWeight: "600" }}
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
