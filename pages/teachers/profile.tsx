import { GRADIENTS, SHADOWS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { useAppTheme } from "@/lib/context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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
  isDark = false,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  isDark?: boolean;
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
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: danger
              ? isDark
                ? "rgba(239, 68, 68, 0.2)"
                : "#FEE2E2"
              : isDark
                ? "rgba(139, 197, 63, 0.2)"
                : "#F0F9E8",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? "#EF4444" : "#4E74F9"}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: danger ? "#EF4444" : isDark ? "#F3F4F6" : "#1F2937",
            }}
          >
            {label}
          </Text>
          {value && (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginTop: 2,
              }}
            >
              {value}
            </Text>
          )}
        </View>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{
              false: isDark ? "#374151" : "#E5E7EB",
              true: "#4E74F9",
            }}
            thumbColor={
              toggleValue ? "#FFFFFF" : isDark ? "#6B7280" : "#9CA3AF"
            }
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#6B7280" : "#9CA3AF"}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

// Stat Badge Component (commented out - no longer used)
/*
const StatBadge = ({
  icon,
  label,
  value,
  color,
  isDark = false,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  isDark?: boolean;
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
    <Text
      style={{
        fontSize: 18,
        fontWeight: "700",
        color: isDark ? "#F3F4F6" : "#111827",
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: isDark ? "#9CA3AF" : "#6B7280",
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  </View>
);
*/

export default function TeacherProfile() {
  const router = useRouter();
  const { isDark } = useAppTheme(); // themeMode, setThemeMode commented out - not used
  const [user, setUser] = useState<any>(null);

  // Modals
  const [notifications, setNotifications] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Forms
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Fetch fresh data from backend
      const response = (await apiFetch("/api/auth/me")) as any;
      setUser(response);
      if (response) {
        setProfileForm({
          name: response.name || "",
          phone: response.phone || "",
          bio: response.bio || "",
        });
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Fallback to AsyncStorage if API fails
      const userData = await getUser();
      setUser(userData);
      if (userData) {
        setProfileForm({
          name: userData.name || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
        });
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };
  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      const fileName = asset.uri.split("/").pop() || "profile.jpg";
      const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

      // @ts-ignore
      formData.append("image", {
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });

      // Use the same endpoint as student profile for consistency
      const response = (await apiFetch("/api/auth/profile/image", {
        method: "POST",
        headers: {
          // Content-Type is purposely omitted to allow boundary to be set automatically
        },
        body: formData,
      })) as { profileImage: string; user: any };

      if (response?.profileImage) {
        Alert.alert("Success", "Profile image updated");
        // Update user state immediately with new image
        setUser((prev: any) => {
          const updated = { ...prev, profileImage: response.profileImage };
          // Persist to AsyncStorage to prevent staleness on reload
          import("@react-native-async-storage/async-storage").then((mod) => {
            mod.default.setItem("user", JSON.stringify(updated));
          });
          return updated;
        });
      } else {
        throw new Error("Failed to get profile image url from response");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setUpdatingProfile(true);
    try {
      const response = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(profileForm),
      });

      // Save updated data to AsyncStorage
      if (response) {
        await import("@react-native-async-storage/async-storage").then(
          (mod) => {
            mod.default.setItem("user", JSON.stringify(response));
          },
        );
      }

      Alert.alert("Success", "Profile updated successfully");
      setShowEditProfileModal(false);
      loadUser();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
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
      style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#FFFFFF" }}
      edges={["top"]}
    >
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
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
              <Pressable
                onPress={handlePickImage}
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
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Ionicons name="person" size={48} color="white" />
                )}

                {/* Edit Badge */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: 30,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="camera" size={16} color="white" />
                  )}
                </View>
              </Pressable>

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
              {user?.empCode && (
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  ID: {user.empCode}
                </Text>
              )}
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
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 16,
            ...SHADOWS.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#ecfdf5",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="briefcase" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Role
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "#F3F4F6" : "#111827",
                  marginTop: 2,
                  textTransform: "capitalize",
                }}
              >
                {user?.role || "Teacher"}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: isDark ? "#374151" : "#F3F4F6",
              marginVertical: 12,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#dbeafe",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="card" size={20} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Employee ID
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "#F3F4F6" : "#111827",
                  marginTop: 2,
                }}
              >
                {user?.empCode || "Not Assigned"}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            ABOUT
          </Text>
          <View
            style={{
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="briefcase-outline"
              label="Bio"
              value={user?.bio || "No bio added"}
              isDark={isDark}
            />
            <View
              style={{
                height: 1,
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="call-outline"
              label="Phone"
              value={user?.phone || "--"}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            PREFERENCES
          </Text>
          <View
            style={{
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
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
              isDark={isDark}
            />
            {/* <View
              style={{
                height: 1,
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="moon-outline"
              label="Dark Mode"
              toggle
              toggleValue={themeMode === "dark"}
              onToggle={(value) => setThemeMode(value ? "dark" : "light")}
              isDark={isDark}
            /> */}
          </View>
        </View>

        {/* Settings Section */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            SETTINGS
          </Text>
          <View
            style={{
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOWS.sm,
            }}
          >
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              onPress={() => setShowEditProfileModal(true)}
              isDark={isDark}
            />
            <View
              style={{
                height: 1,
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                marginLeft: 70,
              }}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Change Password"
              onPress={() => setShowPasswordModal(true)}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Logout */}
        <View
          style={{ marginTop: 24, marginHorizontal: 20, marginBottom: 100 }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
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
              isDark={isDark}
            />
          </View>

          {/* Version Info */}
          <Text
            style={{
              textAlign: "center",
              color: isDark ? "#6B7280" : "#9CA3AF",
              fontSize: 12,
              marginTop: 20,
            }}
          >
            Abhigyan Gurukul v1.0.0
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfileModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
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
                  color: isDark ? "#F3F4F6" : "#111827",
                }}
              >
                Edit Profile
              </Text>
              <Pressable onPress={() => setShowEditProfileModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#6B7280" : "#9CA3AF"}
                />
              </Pressable>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  marginBottom: 8,
                }}
              >
                Full Name
              </Text>
              <TextInput
                value={profileForm.name}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, name: text })
                }
                placeholder="Enter your name"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: isDark ? "#F3F4F6" : "#1F2937",
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  marginBottom: 8,
                }}
              >
                Phone Number
              </Text>
              <TextInput
                value={profileForm.phone}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, phone: text })
                }
                placeholder="Enter phone number"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: isDark ? "#F3F4F6" : "#1F2937",
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  marginBottom: 8,
                }}
              >
                Bio
              </Text>
              <TextInput
                value={profileForm.bio}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, bio: text })
                }
                placeholder="Tell us about yourself"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: isDark ? "#F3F4F6" : "#1F2937",
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                  textAlignVertical: "top",
                  minHeight: 80,
                }}
              />
            </View>

            <Pressable
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
              style={{
                backgroundColor: updatingProfile ? "#9CA3AF" : "#4E74F9",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {updatingProfile ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
                >
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

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
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
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
                  color: isDark ? "#F3F4F6" : "#111827",
                }}
              >
                Change Password
              </Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#6B7280" : "#9CA3AF"}
                />
              </Pressable>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  marginBottom: 8,
                }}
              >
                Current Password
              </Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, currentPassword: text })
                }
                placeholder="Enter current password"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: isDark ? "#F3F4F6" : "#1F2937",
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  marginBottom: 8,
                }}
              >
                New Password
              </Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, newPassword: text })
                }
                placeholder="Enter new password"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: isDark ? "#F3F4F6" : "#1F2937",
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  marginBottom: 8,
                }}
              >
                Confirm New Password
              </Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: text })
                }
                placeholder="Confirm new password"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: isDark ? "#F3F4F6" : "#1F2937",
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              disabled={changingPassword}
              style={{
                backgroundColor: changingPassword ? "#9CA3AF" : "#4E74F9",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
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
