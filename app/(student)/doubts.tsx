import { apiFetch } from "@/lib/api";
import { uploadFileWithSignedUrl } from "@/lib/firebaseUpload";
import { getSocket, joinDoubtRoom, leaveDoubtRoom } from "@/lib/socket";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Send,
  User,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  senderRole: "student" | "teacher" | "admin";
  message: string;
  attachments: {
    url: string;
    fileName: string;
    fileType: string;
  }[];
  createdAt: string;
}

interface Doubt {
  _id: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  student: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  status: string;
  messages: Message[];
  createdAt: string;
}

export default function StudentDoubts() {
  const [view, setView] = useState<"teachers" | "chats" | "chat">("chats");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const getDisplayTeacher = (doubt: Doubt) => {
    // Primary: use the teacher field if populated
    if (
      doubt.teacher &&
      typeof doubt.teacher === "object" &&
      doubt.teacher.name
    ) {
      return doubt.teacher;
    }

    // Fallback: Check if any teacher has participated in messages
    if (doubt.messages && doubt.messages.length > 0) {
      const teacherMsg = doubt.messages.find(
        (m) =>
          (m.senderRole === "teacher" || m.senderRole === "admin") && m.sender,
      );

      if (teacherMsg && teacherMsg.sender) {
        // Check if sender is populated (object with name)
        if (
          typeof teacherMsg.sender === "object" &&
          "name" in teacherMsg.sender &&
          teacherMsg.sender.name
        ) {
          return {
            _id: teacherMsg.sender._id,
            name: teacherMsg.sender.name,
            email: "",
            profileImage: teacherMsg.sender.profileImage,
          } as Teacher;
        }

        // Sender exists but not populated (just an ObjectId) - user may have been deleted
        return {
          _id:
            typeof teacherMsg.sender === "string"
              ? teacherMsg.sender
              : "unknown",
          name: "Teacher",
          email: "",
          profileImage: undefined,
        } as Teacher;
      }
    }

    // No teacher assigned yet
    return null;
  };

  const fetchTeachers = async () => {
    try {
      const res = (await apiFetch("/api/doubts/teachers")) as {
        teachers: Teacher[];
      };
      setTeachers(res.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchDoubts = useCallback(async () => {
    try {
      const res = (await apiFetch("/api/doubts/student/my-doubts")) as {
        doubts: Doubt[];
      };
      console.log("[fetchDoubts] Received doubts:", res.doubts?.length);
      setDoubts(res.doubts || []);
    } catch (error) {
      console.error("Error fetching doubts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoubts();
    fetchTeachers();
    fetchTeachers();
  }, [fetchDoubts]);

  const selectedDoubtId = selectedDoubt?._id;

  useEffect(() => {
    let socketInstance: any = null;

    const setupSocket = async () => {
      if (view === "chat" && selectedDoubtId) {
        socketInstance = await getSocket();
        if (socketInstance) {
          joinDoubtRoom(socketInstance, selectedDoubtId);
          console.log("[Socket] Joined room:", selectedDoubtId);

          socketInstance.on("new_message", (updatedDoubt: Doubt) => {
            console.log("[Socket] New message received");
            if (updatedDoubt._id === selectedDoubtId) {
              // Server sends complete data with fresh URLs - trust it
              setSelectedDoubt(updatedDoubt);
              setDoubts((prev) =>
                prev.map((d) =>
                  d._id === updatedDoubt._id ? updatedDoubt : d,
                ),
              );
            }
          });
        }
      }
    };

    setupSocket();

    return () => {
      if (socketInstance && selectedDoubtId) {
        leaveDoubtRoom(socketInstance, selectedDoubtId);
        socketInstance.off("new_message");
        console.log("[Socket] Left room:", selectedDoubtId);
      }
    };
  }, [view, selectedDoubtId]);

  const handlePickImage = async () => {
    if (!selectedDoubt) return;
    try {
      console.log("[Image] Opening image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Show preview
        setImagePreview(asset.uri);
      }
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleSendImage = async () => {
    if (!selectedDoubt || !imagePreview) return;

    setUploading(true);
    try {
      const fileName = `image_${Date.now()}.jpg`;
      const mimeType = "image/jpeg";

      console.log("[Image] Uploading image:", { fileName, uri: imagePreview });

      // Optimistic UI update
      const tempMessage: Message = {
        _id: `temp_${Date.now()}`,
        sender: selectedDoubt.student,
        senderRole: "student",
        message: "📎 Image",
        attachments: [
          {
            url: imagePreview,
            fileName,
            fileType: mimeType,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setSelectedDoubt((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, tempMessage],
            }
          : null,
      );
      setImagePreview(null);

      // Upload file
      const uploadedFile = await uploadFileWithSignedUrl(
        imagePreview,
        fileName,
        mimeType,
        selectedDoubt._id,
      );
      console.log("[Image] File uploaded, creating message...");

      // Create message with attachment
      await apiFetch(`/api/doubts/${selectedDoubt._id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: "📎 Image",
          attachments: [
            {
              fileId: uploadedFile.id,
              fileName: uploadedFile.fileName,
              fileType: uploadedFile.fileType,
              fileSize: uploadedFile.fileSize,
              url: uploadedFile.url,
              storagePath: uploadedFile.storagePath,
            },
          ],
        }),
      });

      console.log("[Image] Message created successfully");

      // Socket will handle real-time update
    } catch (err) {
      console.error("Image error:", err);
      Alert.alert("Error", "Failed to upload image");
      setImagePreview(null);
      // Remove temp message on error
      setSelectedDoubt((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => !m._id.startsWith("temp_")),
            }
          : null,
      );
    } finally {
      setUploading(false);
    }
  };

  const handleStartChat = async (teacher: Teacher) => {
    try {
      const message = "Hi, I need help!";
      setSending(true);
      console.log(
        "[handleStartChat] Creating doubt with teacher:",
        teacher.name,
        teacher._id,
      );
      const newDoubt = (await apiFetch("/api/doubts", {
        method: "POST",
        body: JSON.stringify({
          teacherId: teacher._id,
          message,
        }),
      })) as Doubt;

      await fetchDoubts();
      setSelectedDoubt(newDoubt);
      setView("chat");
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start chat");
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedDoubt || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear immediately for better UX
    setSending(true);

    // Optimistic UI update
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      sender: selectedDoubt.student,
      senderRole: "student",
      message: messageText,
      attachments: [],
      createdAt: new Date().toISOString(),
    };

    setSelectedDoubt((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, tempMessage],
          }
        : null,
    );

    try {
      await apiFetch(`/api/doubts/${selectedDoubt._id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: messageText,
          attachments: [],
        }),
      });

      // Socket will update with real message
    } catch (err) {
      console.error("Send error:", err);
      Alert.alert("Error", "Failed to send message");
      // Revert optimistic update on error
      setSelectedDoubt((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => m._id !== tempMessage._id),
            }
          : null,
      );
    } finally {
      setSending(false);
    }
  };

  const openAttachment = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert("Error", "Cannot open attachment");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (view === "teachers") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setView("chats")}>
            <ArrowLeft size={24} color="#1f2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Select Teacher</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTeachers();
                setRefreshing(false);
              }}
            />
          }
        >
          {teachers.map((teacher) => (
            <Pressable
              key={teacher._id}
              style={styles.teacherCard}
              onPress={() => handleStartChat(teacher)}
              disabled={sending}
            >
              <View style={styles.teacherAvatar}>
                {teacher.profileImage ? (
                  <Image
                    source={{ uri: teacher.profileImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <User size={24} color="#8b5cf6" />
                )}
              </View>
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherEmail}>{teacher.email}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "chat" && selectedDoubt) {
    const displayTeacher = getDisplayTeacher(selectedDoubt);
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                setView("chats");
                setSelectedDoubt(null);
              }}
            >
              <ArrowLeft size={24} color="#1f2937" />
            </Pressable>
            <View style={styles.chatHeader}>
              <View style={styles.avatarSmall}>
                {displayTeacher?.profileImage ? (
                  <Image
                    source={{ uri: displayTeacher.profileImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <User size={16} color="#8b5cf6" />
                )}
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {displayTeacher
                    ? displayTeacher.name
                    : "Waiting for teacher..."}
                </Text>
                {displayTeacher?.email ? (
                  <Text style={styles.headerSubtitle}>
                    {displayTeacher.email}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            ref={flatListRef}
            data={selectedDoubt.messages}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyExtractor={(item) => item._id}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item: msg }) => (
              <View
                style={[
                  styles.messageBubble,
                  msg.senderRole === "student"
                    ? styles.myMessage
                    : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.senderRole === "student" && styles.myMessageText,
                  ]}
                >
                  {msg.message}
                </Text>
                {msg.attachments?.map(
                  (
                    att: { url: string; fileName: string; fileType: string },
                    i: number,
                  ) => (
                    <View key={i}>
                      {att.fileType.startsWith("image/") ? (
                        <Pressable onPress={() => setFullscreenImage(att.url)}>
                          <Image
                            source={{ uri: att.url }}
                            style={styles.attachmentImage}
                            resizeMode="cover"
                          />
                        </Pressable>
                      ) : (
                        <Pressable
                          style={styles.attachment}
                          onPress={() => openAttachment(att.url)}
                        >
                          <FileText size={16} color="#ef4444" />
                          <Text style={styles.attachmentText}>
                            {att.fileName}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  ),
                )}
                <Text style={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
          />

          <View style={styles.inputContainer}>
            <Pressable onPress={handlePickImage} style={styles.iconButton}>
              <ImageIcon size={24} color="#6366f1" />
            </Pressable>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={1000}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </Pressable>
          </View>

          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}

          {imagePreview && (
            <View style={styles.previewOverlay}>
              <View style={styles.previewContainer}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Send Image?</Text>
                  <Pressable onPress={() => setImagePreview(null)}>
                    <Text style={styles.previewCancel}>✕</Text>
                  </Pressable>
                </View>
                <Image
                  source={{ uri: imagePreview }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <View style={styles.previewActions}>
                  <Pressable
                    style={styles.previewButton}
                    onPress={() => setImagePreview(null)}
                  >
                    <Text style={styles.previewButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.previewButton, styles.previewButtonPrimary]}
                    onPress={handleSendImage}
                  >
                    <Text
                      style={[
                        styles.previewButtonText,
                        styles.previewButtonTextPrimary,
                      ]}
                    >
                      Send
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {fullscreenImage && (
            <Pressable
              style={styles.fullscreenOverlay}
              onPress={() => setFullscreenImage(null)}
            >
              <View style={styles.fullscreenContainer}>
                <Pressable
                  style={styles.fullscreenClose}
                  onPress={() => setFullscreenImage(null)}
                >
                  <Text style={styles.fullscreenCloseText}>✕ Close</Text>
                </Pressable>
                <Image
                  source={{ uri: fullscreenImage }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </View>
            </Pressable>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Doubts</Text>
        <Pressable
          style={styles.newChatButton}
          onPress={() => setView("teachers")}
        >
          <Text style={styles.newChatButtonText}>New</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDoubts} />
        }
      >
        {doubts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No doubts yet</Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => setView("teachers")}
            >
              <Text style={styles.emptyButtonText}>Ask a Teacher</Text>
            </Pressable>
          </View>
        ) : (
          doubts.map((doubt) => {
            const displayTeacher = getDisplayTeacher(doubt);
            return (
              <Pressable
                key={doubt._id}
                style={styles.chatCard}
                onPress={() => {
                  setSelectedDoubt(doubt);
                  setView("chat");
                }}
              >
                <View style={styles.chatAvatar}>
                  {displayTeacher?.profileImage ? (
                    <Image
                      source={{ uri: displayTeacher.profileImage }}
                      style={styles.avatar}
                    />
                  ) : (
                    <User size={20} color="#8b5cf6" />
                  )}
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>
                    {displayTeacher
                      ? displayTeacher.name
                      : "Waiting for teacher..."}
                  </Text>
                  <Text style={styles.chatLastMessage} numberOfLines={1}>
                    {doubt.messages[doubt.messages.length - 1]?.message ||
                      "No messages"}
                  </Text>
                </View>
                <View style={styles.chatMeta}>
                  <Text style={styles.chatTime}>
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </Text>
                  {doubt.status === "pending" && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>New</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  newChatButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  newChatButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 12,
  },
  teacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  teacherEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 12,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  chatLastMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  chatMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  chatTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  badge: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  messageList: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  messageListContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6366f1",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#1f2937",
  },
  myMessageText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  attachment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  attachmentText: {
    fontSize: 13,
    color: "#1f2937",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconButton: {
    padding: 10,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    minHeight: 44,
    maxHeight: 120,
    color: "#1f2937",
  },
  sendButton: {
    backgroundColor: "#6366f1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    elevation: 2,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
    elevation: 0,
    shadowOpacity: 0,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  previewCancel: {
    fontSize: 24,
    color: "#6b7280",
  },
  previewImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#f3f4f6",
  },
  previewActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  previewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  previewButtonPrimary: {
    backgroundColor: "#6366f1",
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  previewButtonTextPrimary: {
    color: "#fff",
  },
  fullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  fullscreenCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  empty: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  emptyButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
