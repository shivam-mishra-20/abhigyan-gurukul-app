// Step 5: Preview - Print Ready Format
import { MathText } from "@/components/ui/MathText";
import { ScrollView, Text, View } from "react-native";
import type { Colors, PaperFormData } from "./types";

interface PreviewStepProps {
  formData: PaperFormData;
  calculateTotalMarks: () => number;
  colors: Colors;
}

export const PreviewStep = ({
  formData,
  calculateTotalMarks,
  colors,
}: PreviewStepProps) => {
  const totalQs = formData.sections.reduce(
    (sum, s) => sum + s.selectedQuestions.length,
    0
  );

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Print-Ready Question Paper Format */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 4,
          padding: 24,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: colors.gray300,
        }}
      >
        {/* Header */}
        <View
          style={{
            borderBottomWidth: 2,
            borderColor: colors.gray800,
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 22,
              fontWeight: "800",
              color: colors.gray900,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {formData.instituteName || "YOUR INSTITUTE NAME"}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: "700",
              color: colors.gray800,
              marginTop: 6,
            }}
          >
            {formData.examTitle}
          </Text>
        </View>

        {/* Exam Details Grid */}
        <View
          style={{
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.gray300,
          }}
        >
          {/* Row 1 */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: colors.gray300,
            }}
          >
            <View
              style={{
                flex: 1,
                padding: 8,
                borderRightWidth: 1,
                borderColor: colors.gray300,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.gray600,
                  fontWeight: "600",
                }}
              >
                Class:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.gray900,
                  marginTop: 2,
                }}
              >
                {formData.className}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: 8,
                borderRightWidth: 1,
                borderColor: colors.gray300,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.gray600,
                  fontWeight: "600",
                }}
              >
                Subject:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.gray900,
                  marginTop: 2,
                }}
              >
                {formData.subject}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.gray600,
                  fontWeight: "600",
                }}
              >
                Board:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.gray900,
                  marginTop: 2,
                }}
              >
                {formData.board}
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                padding: 8,
                borderRightWidth: 1,
                borderColor: colors.gray300,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.gray600,
                  fontWeight: "600",
                }}
              >
                Duration:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.gray900,
                  marginTop: 2,
                }}
              >
                {formData.duration}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: 8,
                borderRightWidth: 1,
                borderColor: colors.gray300,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.gray600,
                  fontWeight: "600",
                }}
              >
                Total Marks:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.gray900,
                  marginTop: 2,
                }}
              >
                {calculateTotalMarks()}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.gray600,
                  fontWeight: "600",
                }}
              >
                Date:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.gray900,
                  marginTop: 2,
                }}
              >
                {formData.date || currentDate}
              </Text>
            </View>
          </View>
        </View>

        {/* General Instructions */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.gray900,
              marginBottom: 8,
              textDecorationLine: "underline",
            }}
          >
            General Instructions:
          </Text>
          <View style={{ paddingLeft: 8 }}>
            <Text
              style={{ fontSize: 12, color: colors.gray700, marginBottom: 4 }}
            >
              • All questions are compulsory.
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.gray700, marginBottom: 4 }}
            >
              • Read each question carefully before answering.
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.gray700, marginBottom: 4 }}
            >
              • Write your answers neatly and legibly.
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.gray700, marginBottom: 4 }}
            >
              • Total questions: {totalQs} | Total marks:{" "}
              {calculateTotalMarks()}
            </Text>
          </View>
        </View>

        {/* Questions by Section */}
        {formData.sections
          .filter((s) => s.selectedQuestions.length > 0)
          .map((section, sectionIdx) => (
            <View
              key={sectionIdx}
              style={{
                marginBottom: 24,
                paddingTop: 16,
                borderTopWidth: sectionIdx > 0 ? 2 : 0,
                borderTopColor: colors.gray300,
              }}
            >
              {/* Section Header */}
              <View
                style={{
                  backgroundColor: colors.gray100,
                  padding: 10,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.gray800,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.gray900,
                    marginBottom: 2,
                  }}
                >
                  {section.title}
                </Text>
                {section.instructions && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.gray600,
                      fontStyle: "italic",
                    }}
                  >
                    ({section.instructions})
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.gray700,
                    fontWeight: "600",
                    marginTop: 4,
                  }}
                >
                  {section.marksPerQuestion} mark
                  {section.marksPerQuestion > 1 ? "s" : ""} each ×{" "}
                  {section.selectedQuestions.length} questions ={" "}
                  {section.selectedQuestions.length * section.marksPerQuestion}{" "}
                  marks
                </Text>
              </View>

              {/* Questions */}
              {section.selectedQuestions.map((question, qIdx) => (
                <View
                  key={question._id}
                  style={{
                    marginBottom: 16,
                    paddingLeft: 8,
                  }}
                >
                  <View style={{ flexDirection: "row", marginBottom: 6 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: colors.gray900,
                        marginRight: 8,
                        minWidth: 30,
                      }}
                    >
                      Q{qIdx + 1}.
                    </Text>
                    <View style={{ flex: 1 }}>
                      <MathText
                        text={question.text}
                        fontSize={13}
                        style={{ color: colors.gray800, lineHeight: 20 }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: colors.gray600,
                        marginLeft: 8,
                      }}
                    >
                      [{section.marksPerQuestion}]
                    </Text>
                  </View>

                  {/* Show options for MCQ type questions */}
                  {question.options && question.options.length > 0 && (
                    <View style={{ paddingLeft: 38, marginTop: 4 }}>
                      {question.options.map((option, optIdx) => (
                        <View
                          key={optIdx}
                          style={{
                            flexDirection: "row",
                            marginBottom: 3,
                            alignItems: "flex-start",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.gray700,
                              marginRight: 6,
                              fontWeight: "600",
                            }}
                          >
                            {String.fromCharCode(97 + optIdx)})
                          </Text>
                          <MathText
                            text={option.text}
                            fontSize={12}
                            style={{ color: colors.gray700, flex: 1 }}
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Answer space for non-MCQ questions */}
                  {(!question.options || question.options.length === 0) && (
                    <View style={{ paddingLeft: 38, marginTop: 6 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.gray500,
                          fontStyle: "italic",
                        }}
                      >
                        Ans: _______________________________________________
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}

        {/* Footer */}
        <View
          style={{
            borderTopWidth: 2,
            borderColor: colors.gray800,
            paddingTop: 12,
            marginTop: 12,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: "700",
              color: colors.gray900,
            }}
          >
            *** END OF PAPER ***
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 10,
              color: colors.gray600,
              marginTop: 8,
            }}
          >
            All the Best!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
