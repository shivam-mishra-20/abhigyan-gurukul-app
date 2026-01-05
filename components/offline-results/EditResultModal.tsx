import { Calendar, CheckCircle, Edit2, X } from "lucide-react-native";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ElegantDropdown } from "./ElegantDropdown";
import { ElegantInput } from "./ElegantInput";

interface EditResultModalProps {
  visible: boolean;
  onClose: () => void;
  editedResult: {
    subject: string;
    marks: string;
    outOf: string;
    remarks: string;
    testDate: string;
  };
  onUpdateField: (field: string, value: string) => void;
  onSave: () => void;
  subjects: string[];
  saving: boolean;
}

export function EditResultModal({
  visible,
  onClose,
  editedResult,
  onUpdateField,
  onSave,
  subjects,
  saving,
}: EditResultModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <Animated.View
          entering={FadeIn}
          className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[85%]"
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center">
                <Edit2 size={20} color="#10b981" strokeWidth={2.5} />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-3">
                Edit Result
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center"
            >
              <X size={20} color="#6b7280" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView
            className="px-6 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="space-y-4 pb-6">
              <ElegantDropdown
                label="Subject"
                value={editedResult.subject}
                options={subjects}
                onSelect={(value) => onUpdateField("subject", value)}
                required
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ElegantInput
                    label="Marks"
                    value={editedResult.marks}
                    onChangeText={(value) => onUpdateField("marks", value)}
                    keyboardType="numeric"
                    placeholder="e.g., 85"
                    required
                  />
                </View>
                <View className="flex-1">
                  <ElegantInput
                    label="Out Of"
                    value={editedResult.outOf}
                    onChangeText={(value) => onUpdateField("outOf", value)}
                    keyboardType="numeric"
                    placeholder="e.g., 100"
                    required
                  />
                </View>
              </View>

              <ElegantInput
                label="Test Date"
                icon={Calendar}
                value={editedResult.testDate}
                onChangeText={(value) => onUpdateField("testDate", value)}
                placeholder="YYYY-MM-DD"
                required
              />

              <ElegantInput
                label="Remarks"
                value={editedResult.remarks}
                onChangeText={(value) => onUpdateField("remarks", value)}
                placeholder="Optional remarks"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View className="p-6 border-t border-gray-100 dark:border-gray-700 flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl"
            >
              <Text className="text-gray-700 dark:text-gray-300 text-center font-bold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={saving}
              className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${
                saving ? "bg-gray-400" : "bg-emerald-500 dark:bg-emerald-600"
              }`}
            >
              <CheckCircle size={20} color="white" strokeWidth={2.5} />
              <Text className="text-white text-center font-bold text-base">
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
