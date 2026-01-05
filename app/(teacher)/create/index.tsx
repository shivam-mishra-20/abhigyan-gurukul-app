// Create Paper - Modular Implementation
import { getColors, GRADIENTS } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/lib/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import katex from "katex";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import modular components
import {
  BasicInfoStep,
  BLUEPRINT_SECTIONS,
  BoardSelectionStep,
  ChapterSelectionStep,
  computeQuestionTypeKey,
  initialFormData,
  PreviewStep,
  QuestionSelectionStep,
  STEPS,
  STORAGE_KEY,
  type PaperFormData,
  type Question,
} from "@/components/create-paper";

export default function CreatePaper() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  const [currentStep, setCurrentStep] = useState(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<PaperFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSections = BLUEPRINT_SECTIONS.length;

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
          )) as { chapter: string; count: number }[] | string[];

          const chapterNames = res?.length
            ? Array.isArray(res[0])
              ? res
              : (res as { chapter: string; count: number }[]).map((item) =>
                  typeof item === "string" ? item : item.chapter
                )
            : [
                `${formData.subject} - Chapter 1`,
                `${formData.subject} - Chapter 2`,
                `${formData.subject} - Chapter 3`,
                `${formData.subject} - Chapter 4`,
                `${formData.subject} - Chapter 5`,
              ];

          setChapters(chapterNames as string[]);
        } catch {
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

  // Fetch questions when chapters selected - fetch all in one request
  const fetchQuestions = useCallback(async () => {
    if (formData.selectedChapters.length === 0) return;
    setLoadingQuestions(true);
    try {
      // Fetch all questions for all chapters in a single batch
      const allQuestions: Question[] = [];

      // Use Promise.all for parallel fetching if multiple chapters
      const chapterPromises = formData.selectedChapters.map(async (chapter) => {
        const params = new URLSearchParams({
          subject: formData.subject,
          chapter: chapter,
          // limit=0 means fetch all (no limit)
        });
        if (formData.className) params.set("class", formData.className);
        if (formData.board) params.set("board", formData.board);

        const res = (await apiFetch(
          `/api/exams/questions/for-paper?${params}`
        )) as { items?: Question[]; questions?: Question[] };
        return res?.items || res?.questions || [];
      });

      const results = await Promise.all(chapterPromises);
      results.forEach((list) => allQuestions.push(...list));

      // Remove duplicates efficiently
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.className && formData.subject && formData.examTitle;
      case 2:
        return formData.board !== "";
      case 3:
        return formData.selectedChapters.length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
      if (currentSectionIndex < totalSections - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      } else {
        setCurrentStep(5);
        setCurrentSectionIndex(0);
      }
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 4) {
      if (currentSectionIndex > 0) {
        setCurrentSectionIndex(currentSectionIndex - 1);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 5) {
      setCurrentStep(4);
      setCurrentSectionIndex(totalSections - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalMarks = () => {
    return formData.sections.reduce((total, section) => {
      return (
        total + section.selectedQuestions.length * section.marksPerQuestion
      );
    }, 0);
  };

  const handlePrint = async () => {
    try {
      const currentDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const totalQs = formData.sections.reduce(
        (sum, s) => sum + s.selectedQuestions.length,
        0
      );

      // Helper function to render math in text using KaTeX
      const renderMathInText = (text: string): string => {
        if (!text) return "";

        let result = "";
        let lastIndex = 0;

        // Handle display math $$...$$
        const displayMathRegex = /\$\$(.*?)\$\$/g;
        const displayMatches: {
          start: number;
          end: number;
          content: string;
        }[] = [];
        let displayMatch: RegExpExecArray | null;
        while ((displayMatch = displayMathRegex.exec(text)) !== null) {
          displayMatches.push({
            start: displayMatch.index,
            end: displayMatch.index + displayMatch[0].length,
            content: displayMatch[1],
          });
        }

        // Handle inline math $...$
        const inlineMathRegex = /\$([^$]+?)\$/g;
        const inlineMatches: { start: number; end: number; content: string }[] =
          [];
        let inlineMatch: RegExpExecArray | null;
        while ((inlineMatch = inlineMathRegex.exec(text)) !== null) {
          const isInDisplay = displayMatches.some(
            (dm) =>
              inlineMatch!.index >= dm.start && inlineMatch!.index < dm.end
          );
          if (!isInDisplay) {
            inlineMatches.push({
              start: inlineMatch.index,
              end: inlineMatch.index + inlineMatch[0].length,
              content: inlineMatch[1],
            });
          }
        }

        // Combine and sort all matches
        const allMatches = [
          ...displayMatches.map((m) => ({ ...m, type: "display" as const })),
          ...inlineMatches.map((m) => ({ ...m, type: "inline" as const })),
        ].sort((a, b) => a.start - b.start);

        // Build result with rendered math
        allMatches.forEach((match) => {
          // Add text before math
          if (lastIndex < match.start) {
            const textPart = text
              .substring(lastIndex, match.start)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            result += textPart;
          }

          // Render math
          try {
            const html = katex.renderToString(match.content, {
              displayMode: match.type === "display",
              throwOnError: false,
              output: "html",
            });
            result += html;
          } catch {
            // If rendering fails, just show the original text
            result +=
              match.type === "display"
                ? `$$${match.content}$$`
                : `$${match.content}$`;
          }

          lastIndex = match.end;
        });

        // Add remaining text
        if (lastIndex < text.length) {
          const textPart = text
            .substring(lastIndex)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          result += textPart;
        }

        return (
          result ||
          text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        );
      };

      // Generate HTML for printing
      const questionsHTML = formData.sections
        .filter((s) => s.selectedQuestions.length > 0)
        .map(
          (section, sectionIdx) => `
          <div style="margin-top: ${sectionIdx > 0 ? "32px" : "24px"}; ${
            sectionIdx > 0
              ? "border-top: 2px solid #333; padding-top: 20px;"
              : ""
          }">
            <div style="background-color: #f5f5f5; padding: 12px; margin-bottom: 16px; border-left: 4px solid #333;">
              <h3 style="margin: 0 0 4px 0; font-size: 15px;">${
                section.title
              }</h3>
              ${
                section.instructions
                  ? `<p style="margin: 4px 0; font-size: 11px; font-style: italic; color: #666;">(${section.instructions})</p>`
                  : ""
              }
              <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 600; color: #333;">
                ${section.marksPerQuestion} mark${
            section.marksPerQuestion > 1 ? "s" : ""
          } each × ${section.selectedQuestions.length} questions = ${
            section.selectedQuestions.length * section.marksPerQuestion
          } marks
              </p>
            </div>
            ${section.selectedQuestions
              .map(
                (q, qIdx) => `
              <div style="margin-bottom: 20px; padding-left: 8px;">
                <div style="display: flex; margin-bottom: 8px;">
                  <span style="font-weight: 700; font-size: 13px; margin-right: 8px; min-width: 35px;">Q${
                    qIdx + 1
                  }.</span>
                  <div style="flex: 1;">
                    <span style="font-size: 13px; line-height: 1.6;">${renderMathInText(
                      q.text
                    )}</span>
                  </div>
                  <span style="font-size: 11px; font-weight: 600; color: #666; margin-left: 8px;">[${
                    section.marksPerQuestion
                  }]</span>
                </div>
                ${
                  q.options && q.options.length > 0
                    ? `
                  <div style="padding-left: 43px; margin-top: 6px;">
                    ${q.options
                      .map(
                        (opt, optIdx) => `
                      <div style="margin-bottom: 4px;">
                        <span style="font-size: 12px; margin-right: 6px; font-weight: 600;">${String.fromCharCode(
                          97 + optIdx
                        )})</span>
                        <span style="font-size: 12px;">${renderMathInText(
                          opt.text
                        )}</span>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `
                    : `
                  <div style="padding-left: 43px; margin-top: 8px;">
                    <p style="font-size: 11px; color: #999; font-style: italic; margin: 0;">
                      Ans: _________________________________________________________________
                    </p>
                  </div>
                `
                }
              </div>
            `
              )
              .join("")}
          </div>
        `
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${formData.examTitle}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
            <style>
              @page {
                margin: 20mm;
                size: A4;
              }
              body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 13px;
                color: #000;
              }
              * {
                box-sizing: border-box;
              }
              .katex { font-size: 1em; }
              .katex-display { margin: 0.5em 0; }
            </style>
          </head>
          <body>
            <!-- Header -->
            <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
              <h1 style="text-align: center; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                ${formData.instituteName || "YOUR INSTITUTE NAME"}
              </h1>
              <h2 style="text-align: center; font-size: 18px; font-weight: 700; margin: 0; color: #333;">
                ${formData.examTitle}
              </h2>
            </div>

            <!-- Exam Details Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ccc;">
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 8px; border-right: 1px solid #ccc;">
                  <div style="font-size: 11px; color: #666; font-weight: 600;">Class:</div>
                  <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${
                    formData.className
                  }</div>
                </td>
                <td style="padding: 8px; border-right: 1px solid #ccc;">
                  <div style="font-size: 11px; color: #666; font-weight: 600;">Subject:</div>
                  <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${
                    formData.subject
                  }</div>
                </td>
                <td style="padding: 8px;">
                  <div style="font-size: 11px; color: #666; font-weight: 600;">Board:</div>
                  <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${
                    formData.board
                  }</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border-right: 1px solid #ccc;">
                  <div style="font-size: 11px; color: #666; font-weight: 600;">Duration:</div>
                  <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${
                    formData.duration
                  }</div>
                </td>
                <td style="padding: 8px; border-right: 1px solid #ccc;">
                  <div style="font-size: 11px; color: #666; font-weight: 600;">Total Marks:</div>
                  <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${calculateTotalMarks()}</div>
                </td>
                <td style="padding: 8px;">
                  <div style="font-size: 11px; color: #666; font-weight: 600;">Date:</div>
                  <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${
                    formData.date || currentDate
                  }</div>
                </td>
              </tr>
            </table>

            <!-- General Instructions -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 8px; text-decoration: underline;">General Instructions:</h3>
              <ul style="padding-left: 20px; margin: 0;">
                <li style="font-size: 12px; margin-bottom: 4px;">All questions are compulsory.</li>
                <li style="font-size: 12px; margin-bottom: 4px;">Read each question carefully before answering.</li>
                <li style="font-size: 12px; margin-bottom: 4px;">Write your answers neatly and legibly.</li>
                <li style="font-size: 12px; margin-bottom: 4px;">Total questions: ${totalQs} | Total marks: ${calculateTotalMarks()}</li>
              </ul>
            </div>

            <!-- Questions -->
            ${questionsHTML}

            <!-- Footer -->
            <div style="border-top: 2px solid #000; padding-top: 12px; margin-top: 24px; text-align: center;">
              <p style="font-size: 12px; font-weight: 700; margin: 0;">*** END OF PAPER ***</p>
              <p style="font-size: 10px; color: #666; margin: 8px 0 0 0;">All the Best!</p>
            </div>
          </body>
        </html>
      `;

      // Use expo-print to print
      await Print.printAsync({
        html,
        printerUrl: undefined, // Let the user select printer
      });
    } catch (error) {
      console.error("Error printing:", error);
      Alert.alert(
        "Print Error",
        "Failed to print the question paper. Please try again."
      );
    }
  };

  const handleComplete = async () => {
    Alert.alert(
      "🎉 Paper Created!",
      "Your question paper has been created successfully.",
      [
        {
          text: "Print Paper",
          onPress: () => handlePrint(),
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.gray500 }}>Loading...</Text>
      </View>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            colors={colors}
          />
        );
      case 2:
        return (
          <BoardSelectionStep
            formData={formData}
            updateFormData={updateFormData}
            colors={colors}
          />
        );
      case 3:
        return (
          <ChapterSelectionStep
            formData={formData}
            chapters={chapters}
            toggleChapter={toggleChapter}
            colors={colors}
          />
        );
      case 4:
        return (
          <QuestionSelectionStep
            formData={formData}
            currentSectionIndex={currentSectionIndex}
            setCurrentSectionIndex={setCurrentSectionIndex}
            questions={questions}
            loadingQuestions={loadingQuestions}
            getFilteredQuestions={getFilteredQuestions}
            isQuestionSelected={isQuestionSelected}
            toggleQuestionInSection={toggleQuestionInSection}
            calculateTotalMarks={calculateTotalMarks}
            colors={colors}
          />
        );
      case 5:
        return (
          <PreviewStep
            formData={formData}
            calculateTotalMarks={calculateTotalMarks}
            colors={colors}
          />
        );
      default:
        return null;
    }
  };

  const headerGradient = isDark
    ? ["#6366F1", "#4F46E5"]
    : ["#059669", "#047857"];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <LinearGradient
        colors={headerGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
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
            <ArrowLeft size={22} color="white" strokeWidth={2.5} />
          </Pressable>
          <View>
            <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>
              Create Question Paper
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
              {currentStep === 4
                ? `Section ${currentSectionIndex + 1} of ${totalSections}: ${
                    formData.sections[currentSectionIndex]?.title?.split(
                      ": "
                    )[1] || "Questions"
                  }`
                : `Step ${currentStep} of 5: ${STEPS[currentStep - 1].title}`}
            </Text>
          </View>
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
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.gray100,
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
            borderColor: currentStep === 1 ? colors.gray200 : colors.primary,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <ArrowLeft
            size={18}
            color={currentStep === 1 ? colors.gray400 : colors.primary}
            strokeWidth={2.5}
          />
          <Text
            style={{
              marginLeft: 8,
              fontWeight: "600",
              color: currentStep === 1 ? colors.gray400 : colors.primary,
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
                  : [colors.gray300, colors.gray300]
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
              <ArrowRight size={18} color="white" strokeWidth={2.5} />
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
              <Printer size={18} color="white" strokeWidth={2.5} />
              <Text
                style={{ fontWeight: "600", color: "white", marginLeft: 8 }}
              >
                Complete & Print
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
