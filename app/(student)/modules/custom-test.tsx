import {
    createPracticeTest,
    getPracticeTestMeta,
    getPresets,
    startPracticeTestAttempt,
    type CreatePracticeTestRequest,
    type PracticeTestMeta,
    type PracticeTestPreset,
} from "@/lib/practiceTestApi";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Rich green theme colors
const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  error: "#ef4444",
  warning: "#f59e0b",
};

export default function CustomTestScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [meta, setMeta] = useState<PracticeTestMeta | null>(null);
  const [presets, setPresets] = useState<PracticeTestPreset[]>([]);

  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [allChapters, setAllChapters] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);
  const [durationType, setDurationType] = useState<
    "total" | "per-question" | "none"
  >("none");
  const [totalMins, setTotalMins] = useState(30);
  const [perQuestionSecs, setPerQuestionSecs] = useState(60);
  const [easyPercent, setEasyPercent] = useState(30);
  const [mediumPercent, setMediumPercent] = useState(50);
  const [hardPercent, setHardPercent] = useState(20);
  const [correctMarks, setCorrectMarks] = useState(1);
  const [incorrectMarks, setIncorrectMarks] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metaData, presetsData] = await Promise.all([
        getPracticeTestMeta(),
        getPresets(),
      ]);
      setMeta(metaData);
      setPresets(presetsData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      return [...prev, subject];
    });
    // Reset chapters when subjects change
    setSelectedChapters([]);
  }, []);

  const toggleChapter = useCallback((chapter: string) => {
    setSelectedChapters((prev) => {
      if (prev.includes(chapter)) {
        return prev.filter((c) => c !== chapter);
      }
      return [...prev, chapter];
    });
  }, []);

  const applyPreset = useCallback((preset: PracticeTestPreset) => {
    setSelectedPreset(preset.id);
    setQuestionCount(preset.config.questionCount);
    setDurationType(preset.config.duration.type);
    if (preset.config.duration.totalMins) {
      setTotalMins(preset.config.duration.totalMins);
    }
    if (preset.config.duration.perQuestionSecs) {
      setPerQuestionSecs(preset.config.duration.perQuestionSecs);
    }
    setEasyPercent(preset.config.difficulty.easy);
    setMediumPercent(preset.config.difficulty.medium);
    setHardPercent(preset.config.difficulty.hard);
    setCorrectMarks(preset.config.markingScheme.correct);
    setIncorrectMarks(preset.config.markingScheme.incorrect);
  }, []);

  const handleCreateTest = async () => {
    if (selectedSubjects.length === 0) {
      Alert.alert("Select Subjects", "Please select at least one subject");
      return;
    }

    // Validate difficulty distribution
    const totalDiff = easyPercent + mediumPercent + hardPercent;
    if (Math.abs(totalDiff - 100) > 1) {
      Alert.alert(
        "Invalid Distribution",
        "Difficulty percentages must sum to 100%",
      );
      return;
    }

    try {
      setCreating(true);

      const config: CreatePracticeTestRequest = {
        subjects: selectedSubjects,
        chapters: allChapters ? [] : selectedChapters,
        questionCount,
        difficulty: {
          easy: easyPercent,
          medium: mediumPercent,
          hard: hardPercent,
        },
        duration: {
          type: durationType,
          ...(durationType === "total" && { totalMins }),
          ...(durationType === "per-question" && { perQuestionSecs }),
        },
        markingScheme: {
          correct: correctMarks,
          incorrect: incorrectMarks,
          unattempted: 0,
        },
      };

      // Create the practice test
      const practiceTest = await createPracticeTest(config);

      // Show warning if fewer questions available
      if (practiceTest.insufficientQuestionsWarning) {
        Alert.alert("Note", practiceTest.insufficientQuestionsWarning);
      }

      // Start the attempt
      const attempt = await startPracticeTestAttempt(practiceTest._id);

      // Navigate to the attempt screen
      router.push({
        pathname: "/(student)/attempt/[attemptId]",
        params: {
          attemptId: attempt._id,
          practiceTestId: practiceTest._id,
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create test");
    } finally {
      setCreating(false);
    }
  };

  const availableChapters = selectedSubjects.flatMap(
    (subject) => meta?.chapters[subject] || [],
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={{ marginTop: 16, color: THEME.textSecondary }}>
            Loading test options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: THEME.card,
          borderBottomWidth: 1,
          borderBottomColor: THEME.border,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: "700", color: THEME.text }}>
          Custom Practice Test
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Quick Presets */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: THEME.text,
            marginBottom: 12,
          }}
        >
          Quick Presets
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
        >
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <Pressable
                key={preset.id}
                onPress={() => applyPreset(preset)}
                style={{
                  backgroundColor: isSelected ? "#ecfdf5" : THEME.card,
                  borderRadius: 12,
                  padding: 16,
                  marginRight: 12,
                  width: 160,
                  borderWidth: 2,
                  borderColor: isSelected ? THEME.primary : THEME.border,
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: THEME.primary,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
                <Ionicons
                  name={preset.icon as any}
                  size={28}
                  color={THEME.primary}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: THEME.text,
                    marginBottom: 4,
                  }}
                >
                  {preset.name}
                </Text>
                <Text
                  style={{ fontSize: 12, color: THEME.textSecondary }}
                  numberOfLines={2}
                >
                  {preset.description}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Subject Selection */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: THEME.text,
            marginBottom: 12,
          }}
        >
          Select Subjects *
        </Text>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
        >
          {meta?.subjects && meta.subjects.length > 0 ? (
            meta.subjects.map((subject) => (
              <Pressable
                key={subject.name}
                onPress={() => toggleSubject(subject.name)}
                style={{
                  backgroundColor: selectedSubjects.includes(subject.name)
                    ? THEME.primary
                    : THEME.card,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: selectedSubjects.includes(subject.name)
                    ? THEME.primary
                    : THEME.border,
                }}
              >
                <Text
                  style={{
                    color: selectedSubjects.includes(subject.name)
                      ? "#fff"
                      : THEME.text,
                    fontSize: 14,
                  }}
                >
                  {subject.name} ({subject.questionCount})
                </Text>
              </Pressable>
            ))
          ) : (
            <View
              style={{
                backgroundColor: THEME.card,
                borderRadius: 12,
                padding: 20,
                width: "100%",
                alignItems: "center",
                borderWidth: 1,
                borderColor: THEME.border,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color={THEME.textSecondary}
              />
              <Text
                style={{
                  color: THEME.textSecondary,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                No subjects found in question bank.{"\n"}Please add questions
                with subject tags.
              </Text>
            </View>
          )}
        </View>

        {/* Chapter Selection */}
        {selectedSubjects.length > 0 && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: THEME.text }}
              >
                Chapters
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: THEME.textSecondary, marginRight: 8 }}>
                  All Chapters
                </Text>
                <Switch
                  value={allChapters}
                  onValueChange={setAllChapters}
                  trackColor={{ false: THEME.border, true: THEME.primaryLight }}
                  thumbColor={allChapters ? THEME.primary : "#f4f3f4"}
                />
              </View>
            </View>

            {!allChapters && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {availableChapters.map((chapter, index) => (
                  <Pressable
                    key={`${chapter.name}-${index}`}
                    onPress={() => toggleChapter(chapter.name)}
                    style={{
                      backgroundColor: selectedChapters.includes(chapter.name)
                        ? THEME.primary
                        : THEME.card,
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: selectedChapters.includes(chapter.name)
                        ? THEME.primary
                        : THEME.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedChapters.includes(chapter.name)
                          ? "#fff"
                          : THEME.text,
                        fontSize: 12,
                      }}
                    >
                      {chapter.name} ({chapter.questionCount})
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        {/* Question Count */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: THEME.text,
              marginBottom: 8,
            }}
          >
            Number of Questions: {questionCount}
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={5}
            maximumValue={100}
            step={5}
            value={questionCount}
            onValueChange={setQuestionCount}
            minimumTrackTintColor={THEME.primary}
            maximumTrackTintColor={THEME.border}
            thumbTintColor={THEME.primary}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: THEME.textSecondary, fontSize: 12 }}>5</Text>
            <Text style={{ color: THEME.textSecondary, fontSize: 12 }}>
              100
            </Text>
          </View>
        </View>

        {/* Time Limit */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: THEME.text,
            marginBottom: 12,
          }}
        >
          Time Limit
        </Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {(["none", "total", "per-question"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setDurationType(type)}
              style={{
                flex: 1,
                backgroundColor:
                  durationType === type ? THEME.primary : THEME.card,
                borderRadius: 8,
                paddingVertical: 12,
                marginRight: type !== "per-question" ? 8 : 0,
                alignItems: "center",
                borderWidth: 1,
                borderColor:
                  durationType === type ? THEME.primary : THEME.border,
              }}
            >
              <Text
                style={{
                  color: durationType === type ? "#fff" : THEME.text,
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                {type === "none"
                  ? "Untimed"
                  : type === "total"
                    ? "Total Time"
                    : "Per Question"}
              </Text>
            </Pressable>
          ))}
        </View>

        {durationType === "total" && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: THEME.textSecondary, marginBottom: 8 }}>
              Total time: {totalMins} minutes
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={180}
              step={5}
              value={totalMins}
              onValueChange={setTotalMins}
              minimumTrackTintColor={THEME.primary}
              maximumTrackTintColor={THEME.border}
              thumbTintColor={THEME.primary}
            />
          </View>
        )}

        {durationType === "per-question" && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: THEME.textSecondary, marginBottom: 8 }}>
              Time per question: {perQuestionSecs} seconds
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={30}
              maximumValue={300}
              step={10}
              value={perQuestionSecs}
              onValueChange={setPerQuestionSecs}
              minimumTrackTintColor={THEME.primary}
              maximumTrackTintColor={THEME.border}
              thumbTintColor={THEME.primary}
            />
          </View>
        )}

        {/* Advanced Options Toggle */}
        <Pressable
          onPress={() => setShowAdvanced(!showAdvanced)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: THEME.card,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: THEME.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: THEME.text }}>
            Advanced Options
          </Text>
          <Ionicons
            name={showAdvanced ? "chevron-up" : "chevron-down"}
            size={20}
            color={THEME.textSecondary}
          />
        </Pressable>

        {showAdvanced && (
          <View
            style={{
              backgroundColor: THEME.card,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: THEME.border,
            }}
          >
            {/* Difficulty Distribution */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: THEME.text,
                marginBottom: 12,
              }}
            >
              Difficulty Distribution
            </Text>

            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: THEME.textSecondary }}>Easy</Text>
                <Text style={{ color: THEME.primary, fontWeight: "600" }}>
                  {easyPercent}%
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 30 }}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={easyPercent}
                onValueChange={(val) => {
                  setEasyPercent(val);
                  // Adjust medium and hard proportionally
                  const remaining = 100 - val;
                  const ratio =
                    mediumPercent / (mediumPercent + hardPercent || 1);
                  setMediumPercent(Math.round(remaining * ratio));
                  setHardPercent(Math.round(remaining * (1 - ratio)));
                }}
                minimumTrackTintColor="#22c55e"
                maximumTrackTintColor={THEME.border}
                thumbTintColor="#22c55e"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: THEME.textSecondary }}>Medium</Text>
                <Text style={{ color: THEME.warning, fontWeight: "600" }}>
                  {mediumPercent}%
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 30 }}
                minimumValue={0}
                maximumValue={100 - easyPercent}
                step={5}
                value={mediumPercent}
                onValueChange={(val) => {
                  setMediumPercent(val);
                  setHardPercent(100 - easyPercent - val);
                }}
                minimumTrackTintColor={THEME.warning}
                maximumTrackTintColor={THEME.border}
                thumbTintColor={THEME.warning}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: THEME.textSecondary }}>Hard</Text>
                <Text style={{ color: THEME.error, fontWeight: "600" }}>
                  {hardPercent}%
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: THEME.border,
                  borderRadius: 4,
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${hardPercent}%`,
                    backgroundColor: THEME.error,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* Marking Scheme */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: THEME.text,
                marginBottom: 12,
              }}
            >
              Marking Scheme
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: THEME.textSecondary,
                    marginBottom: 4,
                    fontSize: 12,
                  }}
                >
                  Correct (+)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: THEME.background,
                    borderRadius: 8,
                    padding: 12,
                    color: THEME.text,
                    borderWidth: 1,
                    borderColor: THEME.border,
                  }}
                  value={String(correctMarks)}
                  onChangeText={(val) => setCorrectMarks(Number(val) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: THEME.textSecondary,
                    marginBottom: 4,
                    fontSize: 12,
                  }}
                >
                  Wrong (−)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: THEME.background,
                    borderRadius: 8,
                    padding: 12,
                    color: THEME.text,
                    borderWidth: 1,
                    borderColor: THEME.border,
                  }}
                  value={String(incorrectMarks)}
                  onChangeText={(val) => setIncorrectMarks(Number(val) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Button */}
      <View
        style={{
          padding: 16,
          backgroundColor: THEME.card,
          borderTopWidth: 1,
          borderTopColor: THEME.border,
        }}
      >
        <Pressable
          onPress={handleCreateTest}
          disabled={creating || selectedSubjects.length === 0}
          style={{
            backgroundColor:
              selectedSubjects.length === 0 ? THEME.border : THEME.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {creating ? (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons
              name="play-circle"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {creating
              ? "Creating Test..."
              : `Start Test (${questionCount} Questions)`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
