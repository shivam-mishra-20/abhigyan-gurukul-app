// Step 2: Board Selection
import { ScrollView, Text, View } from "react-native";
import { BoardCard } from "./SharedComponents";
import type { Colors, PaperFormData } from "./types";
import { BOARDS } from "./types";

interface BoardSelectionStepProps {
  formData: PaperFormData;
  updateFormData: (data: Partial<PaperFormData>) => void;
  colors: Colors;
}

export const BoardSelectionStep = ({
  formData,
  updateFormData,
  colors,
}: BoardSelectionStepProps) => (
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
        Select Exam Board
      </Text>
      <Text style={{ fontSize: 14, color: colors.gray500 }}>
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
          colors={colors}
        />
      ))}
    </View>
  </ScrollView>
);
