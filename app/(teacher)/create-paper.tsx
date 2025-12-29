import { MathText } from "@/components/ui/MathText";
import { COLORS, GRADIENTS, SHADOWS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "createPaperFlow_mobile";

// Form Data Interface
interface Question {
  _id: string;
  text: string;
  type: string;
  options?: { text: string; isCorrect?: boolean }[];
  chapter?: string;
  topic?: string;
  difficulty?: string;
}

interface Section {
  title: string;
  marksPerQuestion: number;
  instructions?: string;
  questionTypeKey?: string;
  selectedQuestions: Question[];
}

interface PaperFormData {
  className: string;
  subject: string;
  examTitle: string;
  totalMarks: number;
  duration: string;
  date: string;
  instituteName: string;
  board: string;
  selectedChapters: string[];
  sections: Section[];
}

const initialFormData: PaperFormData = {
  className: "",
  subject: "",
  examTitle: "",
  totalMarks: 0,
  duration: "",
  date: "",
  instituteName: "",
  board: "",
  selectedChapters: [],
  sections: [],
};

// Configuration
const CLASSES = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "Computer Science",
  "Accountancy",
  "Business Studies",
  "Economics",
];
const BOARDS = [
  { id: "CBSE", name: "CBSE", desc: "Central Board", icon: "school" },
  { id: "GSEB", name: "GSEB", desc: "Gujarat Board", icon: "business" },
  { id: "JEE", name: "JEE", desc: "Engineering", icon: "rocket" },
  { id: "NEET", name: "NEET", desc: "Medical", icon: "medkit" },
  { id: "Olympiad", name: "Olympiad", desc: "Competitive", icon: "trophy" },
  { id: "Custom", name: "Custom", desc: "Your Format", icon: "create" },
];

// Blueprint sections matching cbt-exam
const BLUEPRINT_SECTIONS: Omit<Section, "selectedQuestions">[] = [
  {
    title: "Section A: Objective Type",
    marksPerQuestion: 1,
    questionTypeKey: "objective",
    instructions: "MCQ, Fill in blanks, True/False",
  },
  {
    title: "Section B: Very Short Answer",
    marksPerQuestion: 2,
    questionTypeKey: "very_short",
    instructions: "Answer in 1-2 sentences",
  },
  {
    title: "Section C: Short Answer",
    marksPerQuestion: 3,
    questionTypeKey: "short",
    instructions: "Answer in 50-70 words",
  },
  {
    title: "Section D: Long Answer",
    marksPerQuestion: 5,
    questionTypeKey: "long",
    instructions: "Answer in 100-120 words",
  },
  {
    title: "Section E: Case Study/HOTS",
    marksPerQuestion: 6,
    questionTypeKey: "case_study",
    instructions: "Application based questions",
  },
];

const STEPS = [
  { id: 1, title: "Basic Info", icon: "document-text" },
  { id: 2, title: "Board", icon: "school" },
  { id: 3, title: "Chapters", icon: "book" },
  { id: 4, title: "Questions", icon: "list" },
  { id: 5, title: "Preview", icon: "eye" },
];

// Animated chip component
const AnimatedChip = ({
  selected,
  label,
  onPress,
  small = false,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  small?: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={
            selected ? GRADIENTS.primary : [COLORS.gray100, COLORS.gray100]
          }
          style={{
            paddingHorizontal: small ? 12 : 16,
            paddingVertical: small ? 8 : 10,
            borderRadius: 20,
            marginRight: 8,
            marginBottom: 8,
            ...SHADOWS.sm,
          }}
        >
          <Text
            style={{
              color: selected ? COLORS.white : COLORS.gray700,
              fontWeight: selected ? "600" : "500",
              fontSize: small ? 13 : 14,
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// Board Card component
const BoardCard = ({
  board,
  selected,
  onPress,
}: {
  board: (typeof BOARDS)[0];
  selected: boolean;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale }], width: "48%", marginBottom: 12 }}
    >
      <Pressable onPress={handlePress}>
        <View
          style={{
            backgroundColor: selected ? COLORS.primaryBg : COLORS.white,
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor: selected ? COLORS.primary : COLORS.gray200,
            ...SHADOWS.sm,
          }}
        >
          {selected && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: COLORS.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          )}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: selected ? COLORS.primaryMuted : COLORS.gray100,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name={board.icon as any}
              size={22}
              color={selected ? COLORS.primary : COLORS.gray500}
            />
          </View>
          <Text
            style={{ fontSize: 16, fontWeight: "700", color: COLORS.gray900 }}
          >
            {board.name}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>
            {board.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Question Card with MathText
const QuestionCard = ({
  question,
  selected,
  onToggle,
}: {
  question: Question;
  selected: boolean;
  onToggle: () => void;
}) => (
  <Pressable
    onPress={onToggle}
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: selected ? COLORS.primaryBg : COLORS.white,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: selected ? COLORS.primary : COLORS.gray200,
    }}
  >
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: selected ? COLORS.primary : COLORS.gray200,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 2,
      }}
    >
      {selected && <Ionicons name="checkmark" size={14} color="white" />}
    </View>
    <View style={{ flex: 1 }}>
      <MathText text={question.text} fontSize={14} />
      {question.topic && (
        <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 4 }}>
          📚 {question.topic}
        </Text>
      )}
    </View>
  </Pressable>
);

export default function CreatePaper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PaperFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load saved state
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData(parsed.formData || initialFormData);
          setCurrentStep(parsed.currentStep || 1);
        }
      } catch (error) {
        console.error("Error loading state:", error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  // Save state on changes
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ formData, currentStep })
      );
    }
  }, [formData, currentStep, loading]);

  // Initialize sections when entering step 4
  useEffect(() => {
    if (currentStep === 4 && formData.sections.length === 0) {
      updateFormData({
        sections: BLUEPRINT_SECTIONS.map((s) => ({
          ...s,
          selectedQuestions: [],
        })),
      });
    }
  }, [currentStep, formData.sections.length]);

  // Animate step transitions
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentStep,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [currentStep, slideAnim]);

  const updateFormData = (data: Partial<PaperFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Fetch chapters when subject changes
  useEffect(() => {
    if (formData.subject && formData.className) {
      const fetchChapters = async () => {
        try {
          const res = (await apiFetch(
            `/api/exams/questions/chapters?subject=${encodeURIComponent(
              formData.subject
            )}&class=${encodeURIComponent(formData.className)}`
          )) as string[];
          setChapters(
            res?.length
              ? res
              : [
                  `${formData.subject} - Chapter 1`,
                  `${formData.subject} - Chapter 2`,
                  `${formData.subject} - Chapter 3`,
                  `${formData.subject} - Chapter 4`,
                  `${formData.subject} - Chapter 5`,
                ]
          );
        } catch {
          // Fallback mock chapters
          setChapters([
            `${formData.subject} - Chapter 1`,
            `${formData.subject} - Chapter 2`,
            `${formData.subject} - Chapter 3`,
            `${formData.subject} - Chapter 4`,
            `${formData.subject} - Chapter 5`,
          ]);
        }
      };
      fetchChapters();
    }
  }, [formData.subject, formData.className]);

  // Fetch questions when chapters selected
  const fetchQuestions = useCallback(async () => {
    if (formData.selectedChapters.length === 0) return;
    setLoadingQuestions(true);
    try {
      const allQuestions: Question[] = [];
      for (const chapter of formData.selectedChapters) {
        const params = new URLSearchParams({
          subject: formData.subject,
          chapter: chapter,
          limit: "100",
          page: "1",
        });
        if (formData.className) params.set("class", formData.className);
        if (formData.board) params.set("board", formData.board);

        const res = (await apiFetch(
          `/api/exams/questions/for-paper?${params}`
        )) as { items?: Question[]; questions?: Question[] };
        const list = res?.items || res?.questions || [];
        allQuestions.push(...list);
      }
      // Remove duplicates
      const unique = Array.from(
        new Map(allQuestions.map((q) => [q._id, q])).values()
      );
      setQuestions(unique);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, [
    formData.selectedChapters,
    formData.subject,
    formData.className,
    formData.board,
  ]);

  useEffect(() => {
    if (currentStep === 4) {
      fetchQuestions();
    }
  }, [currentStep, fetchQuestions]);

  // Question type mapping
  const computeQuestionTypeKey = (q: Question): string => {
    const t = (q.type || "").toLowerCase();
    if (["mcq", "truefalse", "fill", "integer", "assertionreason"].includes(t))
      return "objective";
    if (t === "long") return "long";
    if (["case_study", "case", "case-study"].includes(t)) return "case_study";
    return "short";
  };

  const toggleQuestionInSection = (sectionIdx: number, question: Question) => {
    const newSections = [...formData.sections];
    const section = newSections[sectionIdx];
    const exists = section.selectedQuestions.some(
      (q) => q._id === question._id
    );

    if (exists) {
      section.selectedQuestions = section.selectedQuestions.filter(
        (q) => q._id !== question._id
      );
    } else {
      section.selectedQuestions.push(question);
    }

    updateFormData({ sections: newSections });
  };

  const isQuestionSelected = (questionId: string, sectionIndex: number) => {
    return formData.sections[sectionIndex]?.selectedQuestions.some(
      (q) => q._id === questionId
    );
  };

  const getFilteredQuestions = (sectionIdx: number) => {
    const section = formData.sections[sectionIdx];
    if (!section) return [];
    return questions.filter((q) => {
      const key = computeQuestionTypeKey(q);
      return section.questionTypeKey === key;
    });
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.className && formData.subject && formData.examTitle;
      case 2:
        return formData.board !== "";
      case 3:
        return formData.selectedChapters.length > 0;
      case 4:
        return formData.sections.some((s) => s.selectedQuestions.length > 0);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const calculateTotalMarks = () => {
    return formData.sections.reduce((total, section) => {
      return (
        total + section.selectedQuestions.length * section.marksPerQuestion
      );
    }, 0);
  };

  const handleComplete = async () => {
    Alert.alert(
      "🎉 Paper Created!",
      "Your question paper has been created successfully.",
      [
        {
          text: "Share/Export",
          onPress: () => handleShare(),
        },
        {
          text: "Create Another",
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setFormData(initialFormData);
            setCurrentStep(1);
          },
        },
        {
          text: "Go to Dashboard",
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            router.push("/(teacher)");
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    const totalQs = formData.sections.reduce(
      (sum, s) => sum + s.selectedQuestions.length,
      0
    );
    const paperText = `
📝 ${formData.examTitle}
🏫 ${formData.instituteName || "Your Institute"}
📚 ${formData.className} - ${formData.subject}
⏱️ Duration: ${formData.duration}
📊 Total Marks: ${calculateTotalMarks()}
❓ Total Questions: ${totalQs}

${formData.sections
  .map(
    (section, idx) => `
${section.title}
${section.selectedQuestions
  .map((q, qIdx) => `${qIdx + 1}. ${q.text}`)
  .join("\n")}
`
  )
  .join("\n")}
    `.trim();

    try {
      await Share.share({
        message: paperText,
        title: formData.examTitle,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const toggleChapter = (chapter: string) => {
    const exists = formData.selectedChapters.includes(chapter);
    if (exists) {
      updateFormData({
        selectedChapters: formData.selectedChapters.filter(
          (c) => c !== chapter
        ),
      });
    } else {
      updateFormData({
        selectedChapters: [...formData.selectedChapters, chapter],
      });
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Step 1: Basic Info
  const renderBasicInfo = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: COLORS.gray900,
            marginBottom: 4,
          }}
        >
          Basic Information
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.gray500 }}>
          Enter exam details to get started
        </Text>
      </View>

      {/* Class Selection */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: COLORS.gray700,
            marginBottom: 10,
          }}
        >
          Class *
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {CLASSES.map((cls) => (
            <AnimatedChip
              key={cls}
              label={cls}
              selected={formData.className === cls}
              onPress={() => updateFormData({ className: cls })}
              small
            />
          ))}
        </View>
      </View>

      {/* Subject Selection */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: COLORS.gray700,
            marginBottom: 10,
          }}
        >
          Subject *
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {SUBJECTS.map((sub) => (
            <AnimatedChip
              key={sub}
              label={sub}
              selected={formData.subject === sub}
              onPress={() => updateFormData({ subject: sub })}
              small
            />
          ))}
        </View>
      </View>

      {/* Exam Title */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: COLORS.gray700,
            marginBottom: 8,
          }}
        >
          Exam Title *
        </Text>
        <TextInput
          value={formData.examTitle}
          onChangeText={(t) => updateFormData({ examTitle: t })}
          placeholder="e.g., Mid-Term Examination 2024"
          placeholderTextColor={COLORS.gray400}
          style={{
            borderWidth: 2,
            borderColor: formData.examTitle ? COLORS.primary : COLORS.gray200,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: COLORS.gray800,
            backgroundColor: COLORS.white,
          }}
        />
      </View>

      {/* Duration & Marks Row */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: COLORS.gray700,
              marginBottom: 8,
            }}
          >
            Duration
          </Text>
          <TextInput
            value={formData.duration}
            onChangeText={(t) => updateFormData({ duration: t })}
            placeholder="3 Hours"
            placeholderTextColor={COLORS.gray400}
            style={{
              borderWidth: 2,
              borderColor: COLORS.gray200,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              color: COLORS.gray800,
              backgroundColor: COLORS.white,
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: COLORS.gray700,
              marginBottom: 8,
            }}
          >
            Total Marks
          </Text>
          <TextInput
            value={formData.totalMarks ? String(formData.totalMarks) : ""}
            onChangeText={(t) =>
              updateFormData({ totalMarks: parseInt(t) || 0 })
            }
            placeholder="100"
            keyboardType="numeric"
            placeholderTextColor={COLORS.gray400}
            style={{
              borderWidth: 2,
              borderColor: COLORS.gray200,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              color: COLORS.gray800,
              backgroundColor: COLORS.white,
            }}
          />
        </View>
      </View>

      {/* Institute Name */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: COLORS.gray700,
            marginBottom: 8,
          }}
        >
          Institute Name
        </Text>
        <TextInput
          value={formData.instituteName}
          onChangeText={(t) => updateFormData({ instituteName: t })}
          placeholder="Your School/Institute"
          placeholderTextColor={COLORS.gray400}
          style={{
            borderWidth: 2,
            borderColor: COLORS.gray200,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: COLORS.gray800,
            backgroundColor: COLORS.white,
          }}
        />
      </View>
    </ScrollView>
  );

  // Step 2: Board Selection
  const renderBoardSelection = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: COLORS.gray900,
            marginBottom: 4,
          }}
        >
          Select Exam Board
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.gray500 }}>
          Choose the board or exam type
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {BOARDS.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            selected={formData.board === board.id}
            onPress={() => updateFormData({ board: board.id })}
          />
        ))}
      </View>
    </ScrollView>
  );

  // Step 3: Chapter Selection
  const renderChapterSelection = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: COLORS.gray900,
            marginBottom: 4,
          }}
        >
          Select Chapters
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.gray500 }}>
          Choose topics to include ({formData.selectedChapters.length} selected)
        </Text>
      </View>

      {chapters.map((chapter, idx) => {
        const selected = formData.selectedChapters.includes(chapter);
        return (
          <Pressable
            key={chapter}
            onPress={() => toggleChapter(chapter)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: selected ? COLORS.primaryBg : COLORS.white,
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: selected ? COLORS.primary : COLORS.gray200,
              ...SHADOWS.sm,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: selected ? COLORS.primary : COLORS.gray200,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {selected && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: COLORS.gray800,
                }}
              >
                {chapter}
              </Text>
              <Text
                style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}
              >
                Chapter {idx + 1}
              </Text>
            </View>
            <Ionicons
              name={selected ? "bookmark" : "bookmark-outline"}
              size={20}
              color={selected ? COLORS.primary : COLORS.gray400}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // Step 4: Question Selection with Sections
  const renderQuestionSelection = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: COLORS.gray900,
            marginBottom: 4,
          }}
        >
          Select Questions
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.gray500 }}>
          Questions are auto-organized by section type
        </Text>
      </View>

      {/* Stats bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.primaryBg,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: COLORS.primary }}
          >
            {formData.sections.reduce(
              (sum, s) => sum + s.selectedQuestions.length,
              0
            )}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.gray600 }}>Questions</Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: COLORS.primary,
            marginHorizontal: 12,
            opacity: 0.3,
          }}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: COLORS.primary }}
          >
            {calculateTotalMarks()}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.gray600 }}>
            Total Marks
          </Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: COLORS.primary,
            marginHorizontal: 12,
            opacity: 0.3,
          }}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: COLORS.primary }}
          >
            {questions.length}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.gray600 }}>Available</Text>
        </View>
      </View>

      {loadingQuestions ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.gray500 }}>
            Loading questions...
          </Text>
        </View>
      ) : (
        formData.sections.map((section, sIdx) => {
          const sectionQuestions = getFilteredQuestions(sIdx);
          const isExpanded = expandedSections.has(sIdx);

          return (
            <View
              key={sIdx}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.gray200,
                overflow: "hidden",
                ...SHADOWS.sm,
              }}
            >
              {/* Section Header */}
              <Pressable
                onPress={() => toggleSection(sIdx)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor:
                    section.selectedQuestions.length > 0
                      ? COLORS.primaryBg
                      : COLORS.gray50,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: COLORS.gray900,
                    }}
                  >
                    {section.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.gray500,
                      marginTop: 2,
                    }}
                  >
                    {section.instructions} • {section.marksPerQuestion} marks
                    each
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor:
                        section.selectedQuestions.length > 0
                          ? COLORS.primary
                          : COLORS.gray300,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: COLORS.white,
                      }}
                    >
                      {section.selectedQuestions.length} /{" "}
                      {sectionQuestions.length}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.gray500}
                  />
                </View>
              </Pressable>

              {/* Questions List */}
              {isExpanded && (
                <View style={{ padding: 12, paddingTop: 0 }}>
                  {sectionQuestions.length === 0 ? (
                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                      <Ionicons
                        name="document-text-outline"
                        size={32}
                        color={COLORS.gray300}
                      />
                      <Text style={{ color: COLORS.gray500, marginTop: 8 }}>
                        No questions available for this section
                      </Text>
                    </View>
                  ) : (
                    <ScrollView style={{ maxHeight: 300 }}>
                      {sectionQuestions.map((q) => (
                        <QuestionCard
                          key={q._id}
                          question={q}
                          selected={isQuestionSelected(q._id, sIdx)}
                          onToggle={() => toggleQuestionInSection(sIdx, q)}
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  // Step 5: Preview
  const renderPreview = () => {
    const totalQs = formData.sections.reduce(
      (sum, s) => sum + s.selectedQuestions.length,
      0
    );

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: COLORS.gray900,
              marginBottom: 4,
            }}
          >
            Paper Preview
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.gray500 }}>
            Review your question paper
          </Text>
        </View>

        {/* Paper Header Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: COLORS.primaryMuted,
            ...SHADOWS.md,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.gray900,
            }}
          >
            {formData.instituteName || "Your Institute"}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              color: COLORS.gray600,
              marginTop: 4,
            }}
          >
            {formData.examTitle}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: COLORS.gray200,
              paddingVertical: 12,
              marginTop: 16,
            }}
          >
            <Text style={{ color: COLORS.gray600 }}>{formData.className}</Text>
            <Text style={{ color: COLORS.gray600 }}>{formData.subject}</Text>
            <Text style={{ color: COLORS.gray600 }}>{formData.duration}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 16,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 11, color: COLORS.gray500 }}>Board</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: COLORS.gray900,
                }}
              >
                {formData.board}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 11, color: COLORS.gray500 }}>
                Total Marks
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: COLORS.primary,
                }}
              >
                {calculateTotalMarks()}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 11, color: COLORS.gray500 }}>
                Questions
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: COLORS.gray900,
                }}
              >
                {totalQs}
              </Text>
            </View>
          </View>
        </View>

        {/* Sections Summary */}
        {formData.sections
          .filter((s) => s.selectedQuestions.length > 0)
          .map((section, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: COLORS.primary,
                ...SHADOWS.sm,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: COLORS.gray900,
                  }}
                >
                  {section.title}
                </Text>
                <View
                  style={{
                    backgroundColor: COLORS.primaryBg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: COLORS.primary,
                    }}
                  >
                    {section.selectedQuestions.length} ×{" "}
                    {section.marksPerQuestion} ={" "}
                    {section.selectedQuestions.length *
                      section.marksPerQuestion}{" "}
                    marks
                  </Text>
                </View>
              </View>
              {section.selectedQuestions.slice(0, 2).map((q, qIdx) => (
                <View
                  key={q._id}
                  style={{ marginTop: 8, flexDirection: "row" }}
                >
                  <Text style={{ fontSize: 13, color: COLORS.gray600 }}>
                    {qIdx + 1}.{" "}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <MathText
                      text={q.text}
                      fontSize={13}
                      style={{ color: COLORS.gray600 }}
                    />
                  </View>
                </View>
              ))}
              {section.selectedQuestions.length > 2 && (
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.gray500,
                    marginTop: 8,
                    fontStyle: "italic",
                  }}
                >
                  + {section.selectedQuestions.length - 2} more questions
                </Text>
              )}
            </View>
          ))}

        {/* Ready Message */}
        <View
          style={{
            backgroundColor: COLORS.primaryBg,
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          <Text style={{ marginLeft: 12, color: COLORS.primaryDark, flex: 1 }}>
            Paper is ready! Click Complete to save and export.
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderBoardSelection();
      case 3:
        return renderChapterSelection();
      case 4:
        return renderQuestionSelection();
      case 5:
        return renderPreview();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      edges={["top"]}
    >
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 8, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
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
          <View>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
              Create Question Paper
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              Step {currentStep} of 5: {STEPS[currentStep - 1].title}
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {STEPS.map((step, idx) => (
            <View
              key={step.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: idx < STEPS.length - 1 ? 1 : 0,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor:
                    currentStep >= step.id ? "white" : "rgba(255,255,255,0.3)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentStep > step.id ? (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                ) : (
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={
                      currentStep === step.id
                        ? COLORS.primary
                        : "rgba(255,255,255,0.6)"
                    }
                  />
                )}
              </View>
              {idx < STEPS.length - 1 && (
                <View
                  style={{
                    flex: 1,
                    height: 3,
                    backgroundColor:
                      currentStep > step.id ? "white" : "rgba(255,255,255,0.3)",
                    marginHorizontal: 4,
                    borderRadius: 2,
                  }}
                />
              )}
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        {renderStep()}
      </View>

      {/* Navigation */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray100,
          gap: 12,
        }}
      >
        <Pressable
          onPress={handlePrevious}
          disabled={currentStep === 1}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: currentStep === 1 ? COLORS.gray200 : COLORS.primary,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={currentStep === 1 ? COLORS.gray400 : COLORS.primary}
          />
          <Text
            style={{
              marginLeft: 8,
              fontWeight: "600",
              color: currentStep === 1 ? COLORS.gray400 : COLORS.primary,
            }}
          >
            Back
          </Text>
        </Pressable>

        {currentStep < 5 ? (
          <Pressable
            onPress={handleNext}
            disabled={!canProceed()}
            style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}
          >
            <LinearGradient
              colors={
                canProceed()
                  ? GRADIENTS.primary
                  : [COLORS.gray300, COLORS.gray300]
              }
              style={{
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontWeight: "600", color: "white", marginRight: 8 }}
              >
                Next
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleComplete}
            style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              style={{
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text
                style={{ fontWeight: "600", color: "white", marginLeft: 8 }}
              >
                Complete
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
