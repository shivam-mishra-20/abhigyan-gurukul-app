import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  label: string;
  value: string | string[];
  options: SelectOption[];
  onSelect: (value: string | string[]) => void;
  placeholder?: string;
  required?: boolean;
  multiSelect?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function SelectDropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select...",
  required = false,
  multiSelect = false,
  icon,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayValue = () => {
    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const opt = options.find((o) => o.value === value[0]);
        return opt?.label || value[0];
      }
      return `${value.length} selected`;
    }
    const opt = options.find((o) => o.value === value);
    return opt?.label || (value as string) || placeholder;
  };

  const isSelected = (optValue: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(optValue);
    }
    return value === optValue;
  };

  const handleSelect = (optValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optValue)) {
        onSelect(currentValues.filter((v) => v !== optValue));
      } else {
        onSelect([...currentValues, optValue]);
      }
    } else {
      onSelect(optValue);
      setIsOpen(false);
    }
  };

  const hasValue = multiSelect
    ? Array.isArray(value) && value.length > 0
    : Boolean(value);

  return (
    <View className="mb-4">
      <Text className="text-gray-800 font-medium mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center flex-1">
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={hasValue ? "#059669" : "#9ca3af"}
              style={{ marginRight: 10 }}
            />
          )}
          <Text
            className={hasValue ? "text-gray-800" : "text-gray-400"}
            numberOfLines={1}
          >
            {getDisplayValue()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
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
            className="bg-white rounded-2xl m-4 max-h-[70%] w-[85%]"
            onStartShouldSetResponder={() => true}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Header */}
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">{label}</Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                className="p-1"
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            {/* Options */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={{ maxHeight: 350 }}
            >
              {options.map((option, index) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`px-4 py-3.5 flex-row items-center justify-between ${
                    index !== options.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  } ${isSelected(option.value) ? "bg-emerald-50" : ""}`}
                >
                  <Text
                    className={`text-base ${
                      isSelected(option.value)
                        ? "text-emerald-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isSelected(option.value) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#059669"
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>

            {/* Done button for multi-select */}
            {multiSelect && (
              <View className="p-3 border-t border-gray-100">
                <Pressable
                  onPress={() => setIsOpen(false)}
                  className="bg-emerald-600 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
