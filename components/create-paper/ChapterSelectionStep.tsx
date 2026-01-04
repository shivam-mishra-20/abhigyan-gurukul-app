// Step 3: Chapter Selection
import { SHADOWS } from "@/constants/colors";
import { Bookmark, Check } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { Colors, PaperFormData } from "./types";

interface ChapterSelectionStepProps {
  formData: PaperFormData;
  chapters: string[];
  toggleChapter: (chapter: string) => void;
  colors: Colors;
}

export const ChapterSelectionStep = ({
  formData,
  chapters,
  toggleChapter,
  colors,
}: ChapterSelectionStepProps) => (
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
        Select Chapters
      </Text>
      <Text style={{ fontSize: 14, color: colors.gray500 }}>
        Choose topics to include ({formData.selectedChapters.length} selected)
      </Text>
    </View>

    {chapters.map((chapter, idx) => {
      const selected = formData.selectedChapters.includes(chapter);
      return (
        <Pressable
          key={`chapter-${idx}`}
          onPress={() => toggleChapter(chapter)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: selected ? colors.primaryBg : colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
            borderWidth: 2,
            borderColor: selected ? colors.primary : colors.gray200,
            ...SHADOWS.sm,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: selected ? colors.primary : colors.gray200,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {selected && <Check size={16} color="white" strokeWidth={2.5} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.gray800,
              }}
            >
              {chapter}
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}
            >
              Chapter {idx + 1}
            </Text>
          </View>
          <Bookmark
            size={20}
            color={selected ? colors.primary : colors.gray400}
            strokeWidth={2}
            fill={selected ? colors.primary : "transparent"}
          />
        </Pressable>
      );
    })}
  </ScrollView>
);
