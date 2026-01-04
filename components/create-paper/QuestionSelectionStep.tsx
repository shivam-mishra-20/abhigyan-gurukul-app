// Step 4: Question Selection - One section per page
import { FileText } from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { QuestionCard } from "./SharedComponents";
import type { Colors, PaperFormData, Question } from "./types";

interface QuestionSelectionStepProps {
  formData: PaperFormData;
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  questions: Question[];
  loadingQuestions: boolean;
  getFilteredQuestions: (sectionIdx: number) => Question[];
  isQuestionSelected: (questionId: string, sectionIndex: number) => boolean;
  toggleQuestionInSection: (sectionIdx: number, question: Question) => void;
  calculateTotalMarks: () => number;
  colors: Colors;
}

export const QuestionSelectionStep = ({
  formData,
  currentSectionIndex,
  setCurrentSectionIndex,
  loadingQuestions,
  getFilteredQuestions,
  isQuestionSelected,
  toggleQuestionInSection,
  calculateTotalMarks,
  colors,
}: QuestionSelectionStepProps) => {
  const section = formData.sections[currentSectionIndex];
  const sectionQuestions = getFilteredQuestions(currentSectionIndex);

  if (!section) return null;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Section Header */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.gray900,
            }}
          >
            {section.title}
          </Text>
          <View
            style={{
              backgroundColor: colors.primaryBg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}
            >
              {section.marksPerQuestion} marks each
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, color: colors.gray500, marginTop: 4 }}>
          {section.instructions}
        </Text>
      </View>

      {/* Section Progress Indicator */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {formData.sections.map((s, idx) => (
          <Pressable
            key={idx}
            onPress={() => setCurrentSectionIndex(idx)}
            style={{
              flex: 1,
              height: 6,
              marginHorizontal: 2,
              borderRadius: 3,
              backgroundColor:
                idx <= currentSectionIndex
                  ? s.selectedQuestions.length > 0
                    ? colors.primary
                    : colors.primaryMuted
                  : colors.gray200,
            }}
          />
        ))}
      </View>

      {/* Stats bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.primaryBg,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}
          >
            {section.selectedQuestions.length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.gray600 }}>Selected</Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: colors.primary,
            marginHorizontal: 12,
            opacity: 0.3,
          }}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}
          >
            {sectionQuestions.length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.gray600 }}>Available</Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: colors.primary,
            marginHorizontal: 12,
            opacity: 0.3,
          }}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}
          >
            {calculateTotalMarks()}
          </Text>
          <Text style={{ fontSize: 11, color: colors.gray600 }}>
            Total Marks
          </Text>
        </View>
      </View>

      {/* Questions List */}
      {loadingQuestions ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.gray500 }}>
            Loading questions...
          </Text>
        </View>
      ) : sectionQuestions.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 60,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.gray200,
          }}
        >
          <FileText size={48} color={colors.gray300} strokeWidth={1.5} />
          <Text
            style={{ color: colors.gray500, marginTop: 12, fontSize: 16 }}
          >
            No questions available for this section
          </Text>
          <Text
            style={{
              color: colors.gray400,
              marginTop: 4,
              fontSize: 13,
              textAlign: "center",
              paddingHorizontal: 32,
            }}
          >
            Try selecting more chapters or adjust your filters
          </Text>
        </View>
      ) : (
        <View>
          {sectionQuestions.map((q) => (
            <QuestionCard
              key={q._id}
              question={q}
              selected={isQuestionSelected(q._id, currentSectionIndex)}
              onToggle={() => toggleQuestionInSection(currentSectionIndex, q)}
              colors={colors}
            />
          ))}
        </View>
      )}

      {/* Navigation Hint */}
      <View style={{ marginTop: 16, alignItems: "center", paddingBottom: 20 }}>
        <Text style={{ fontSize: 12, color: colors.gray400 }}>
          Section {currentSectionIndex + 1} of {formData.sections.length}
        </Text>
      </View>
    </ScrollView>
  );
};
