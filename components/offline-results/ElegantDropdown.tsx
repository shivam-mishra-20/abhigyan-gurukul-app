import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface ElegantDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function ElegantDropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select...",
  required = false,
}: ElegantDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <Text className="text-emerald-500">*</Text>}
      </Text>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-3 flex-row items-center justify-between"
      >
        <Text
          className={
            value
              ? "text-gray-800 dark:text-gray-100"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color="#6b7280" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setIsOpen(false)}
        >
          <View
            className="bg-white dark:bg-gray-800 rounded-2xl m-4 max-h-96 w-4/5"
            onStartShouldSetResponder={() => true}
          >
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {label}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${
                    value === option
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : ""
                  }`}
                >
                  <Text
                    className={`${
                      value === option
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
