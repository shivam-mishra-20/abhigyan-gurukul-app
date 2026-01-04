// Step 1: Basic Info - Class, Subject, Exam Title
import { ScrollView, Text, TextInput, View } from "react-native";
import { AnimatedChip } from "./SharedComponents";
import type { Colors, PaperFormData } from "./types";
import { CLASSES, SUBJECTS } from "./types";

interface BasicInfoStepProps {
  formData: PaperFormData;
  updateFormData: (data: Partial<PaperFormData>) => void;
  colors: Colors;
}

export const BasicInfoStep = ({
  formData,
  updateFormData,
  colors,
}: BasicInfoStepProps) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: colors.gray900,
          marginBottom: 4,
        }}
      >
        Basic Information
      </Text>
      <Text style={{ fontSize: 14, color: colors.gray500 }}>
        Enter exam details to get started
      </Text>
    </View>

    {/* Class Selection */}
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.gray700,
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
            colors={colors}
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
          color: colors.gray700,
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
            colors={colors}
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
          color: colors.gray700,
          marginBottom: 8,
        }}
      >
        Exam Title *
      </Text>
      <TextInput
        value={formData.examTitle}
        onChangeText={(t) => updateFormData({ examTitle: t })}
        placeholder="e.g., Mid-Term Examination 2024"
        placeholderTextColor={colors.gray400}
        style={{
          borderWidth: 2,
          borderColor: formData.examTitle ? colors.primary : colors.gray200,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 15,
          color: colors.gray800,
          backgroundColor: colors.surface,
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
            color: colors.gray700,
            marginBottom: 8,
          }}
        >
          Duration
        </Text>
        <TextInput
          value={formData.duration}
          onChangeText={(t) => updateFormData({ duration: t })}
          placeholder="3 Hours"
          placeholderTextColor={colors.gray400}
          style={{
            borderWidth: 2,
            borderColor: colors.gray200,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: colors.gray800,
            backgroundColor: colors.surface,
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.gray700,
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
          placeholderTextColor={colors.gray400}
          style={{
            borderWidth: 2,
            borderColor: colors.gray200,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: colors.gray800,
            backgroundColor: colors.surface,
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
          color: colors.gray700,
          marginBottom: 8,
        }}
      >
        Institute Name
      </Text>
      <TextInput
        value={formData.instituteName}
        onChangeText={(t) => updateFormData({ instituteName: t })}
        placeholder="Your School/Institute"
        placeholderTextColor={colors.gray400}
        style={{
          borderWidth: 2,
          borderColor: colors.gray200,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 15,
          color: colors.gray800,
          backgroundColor: colors.surface,
        }}
      />
    </View>
  </ScrollView>
);
