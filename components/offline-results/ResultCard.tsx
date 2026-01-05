import { Edit2, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

interface ResultCardProps {
  result: {
    _id?: string;
    subject: string;
    marks: number;
    outOf: number;
    testDate: string;
    remarks?: string;
  };
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResultCard({
  result,
  index,
  onEdit,
  onDelete,
}: ResultCardProps) {
  const percentage = ((result.marks / result.outOf) * 100).toFixed(1);

  const getGradeColor = (marks: number, outOf: number) => {
    const percent = (marks / outOf) * 100;
    if (percent >= 90)
      return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    if (percent >= 75)
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    if (percent >= 60)
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    if (percent >= 40)
      return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50)}
      className={`p-4 rounded-xl border-2 ${getGradeColor(
        result.marks,
        result.outOf
      )}`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-bold text-lg text-gray-800 dark:text-gray-100">
            {result.subject}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {new Date(result.testDate).toLocaleDateString()}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-bold text-2xl text-gray-800 dark:text-gray-100">
            {result.marks}/{result.outOf}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {percentage}%
          </Text>
        </View>
      </View>

      {result.remarks && (
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
          {result.remarks}
        </Text>
      )}

      <View className="flex-row gap-3">
        <Pressable
          onPress={onEdit}
          className="flex-1 py-2.5 bg-emerald-500 dark:bg-emerald-600 rounded-lg flex-row items-center justify-center gap-2"
        >
          <Edit2 size={16} color="white" strokeWidth={2.5} />
          <Text className="text-white text-center font-semibold">Edit</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="flex-1 py-2.5 bg-red-500 dark:bg-red-600 rounded-lg flex-row items-center justify-center gap-2"
        >
          <Trash2 size={16} color="white" strokeWidth={2.5} />
          <Text className="text-white text-center font-semibold">Delete</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
