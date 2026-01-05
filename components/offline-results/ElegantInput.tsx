import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface ElegantInputProps extends TextInputProps {
  label: string;
  icon?: LucideIcon;
  required?: boolean;
}

export function ElegantInput({
  label,
  icon: Icon,
  required = false,
  ...props
}: ElegantInputProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && "*"}
      </Text>
      <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
        {Icon && <Icon size={18} color="#6b7280" style={{ marginRight: 8 }} />}
        <TextInput
          {...props}
          placeholderTextColor="#9ca3af"
          className="flex-1 py-2 text-gray-800 dark:text-gray-100"
        />
      </View>
    </View>
  );
}
