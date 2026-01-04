// Shared UI components for Create Paper flow
import { MathText } from "@/components/ui/MathText";
import { GRADIENTS, SHADOWS } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { Colors, Question } from "./types";
import { BOARDS } from "./types";

// Animated chip component for class/subject selection
export const AnimatedChip = ({
  selected,
  label,
  onPress,
  small = false,
  colors,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  small?: boolean;
  colors: Colors;
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
            selected ? GRADIENTS.primary : [colors.gray100, colors.gray100]
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
              color: selected ? colors.white : colors.gray700,
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
export const BoardCard = ({
  board,
  selected,
  onPress,
  colors,
}: {
  board: (typeof BOARDS)[0];
  selected: boolean;
  onPress: () => void;
  colors: Colors;
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
            backgroundColor: selected ? colors.primaryBg : colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor: selected ? colors.primary : colors.border,
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
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={14} color="white" strokeWidth={2.5} />
            </View>
          )}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: selected ? colors.primaryMuted : colors.gray100,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: selected ? colors.primary : colors.gray500,
              }}
            >
              {board.name.charAt(0)}
            </Text>
          </View>
          <Text
            style={{ fontSize: 16, fontWeight: "700", color: colors.gray900 }}
          >
            {board.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}>
            {board.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Question Card with MathText
export const QuestionCard = ({
  question,
  selected,
  onToggle,
  colors,
}: {
  question: Question;
  selected: boolean;
  onToggle: () => void;
  colors: Colors;
}) => (
  <Pressable
    onPress={onToggle}
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: selected ? colors.primaryBg : colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: selected ? colors.primary : colors.border,
    }}
  >
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: selected ? colors.primary : colors.gray200,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 2,
      }}
    >
      {selected && <Check size={14} color="white" strokeWidth={2.5} />}
    </View>
    <View style={{ flex: 1 }}>
      <MathText text={question.text} fontSize={14} />
      {question.topic && (
        <Text style={{ fontSize: 11, color: colors.gray500, marginTop: 4 }}>
          📚 {question.topic}
        </Text>
      )}
    </View>
  </Pressable>
);
