import type { BulkResultEntry } from "@/lib/services/results.service";
import { BarChart3, ClipboardList } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ElegantDropdown } from "./ElegantDropdown";

interface BulkEntryFormProps {
  // Dropdown options
  batchOptions: string[];
  classOptions: string[];
  subjects: string[];

  // Selected values
  selectedBatch: string;
  selectedClass: string;
  subject: string;
  outOf: string;
  bulkTestDate: string;
  bulkResults: BulkResultEntry[];

  // Callbacks
  onBatchChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onOutOfChange: (value: string) => void;
  onTestDateChange: (value: string) => void;
  onBulkResultsChange: (results: BulkResultEntry[]) => void;
  onSubmit: () => void;

  // State
  submitting: boolean;
}

export function BulkEntryForm({
  batchOptions,
  classOptions,
  subjects,
  selectedBatch,
  selectedClass,
  subject,
  outOf,
  bulkTestDate,
  bulkResults,
  onBatchChange,
  onClassChange,
  onSubjectChange,
  onOutOfChange,
  onTestDateChange,
  onBulkResultsChange,
  onSubmit,
  submitting,
}: BulkEntryFormProps) {
  const handleMarksChange = (idx: number, value: string) => {
    const updated = [...bulkResults];
    updated[idx].marks = value;
    onBulkResultsChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ClipboardList size={20} color="#10b981" strokeWidth={2.5} />
        <Text style={styles.title}>
          Bulk Entry
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Batch Selector */}
        <ElegantDropdown
          label="Batch"
          value={selectedBatch}
          options={["", ...batchOptions]}
          onSelect={onBatchChange}
          placeholder="All Batches"
        />

        {/* Class Selector */}
        <ElegantDropdown
          label="Class"
          value={selectedClass}
          options={classOptions}
          onSelect={onClassChange}
          placeholder="Select Class"
          required
        />

        {/* Subject */}
        <ElegantDropdown
          label="Subject"
          value={subject}
          options={subjects}
          onSelect={onSubjectChange}
          placeholder="Select Subject"
          required
        />

        {/* Out Of (for all) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Out Of (for all) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={outOf}
            onChangeText={onOutOfChange}
            keyboardType="numeric"
            placeholder="e.g., 100"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
        </View>

        {/* Test Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Test Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={bulkTestDate}
            onChangeText={onTestDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
        </View>

        {/* Bulk Entry Table */}
        {bulkResults.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <BarChart3 size={18} color="#374151" strokeWidth={2.5} />
              <Text style={styles.tableTitle}>
                Enter Marks for Each Student ({bulkResults.length} students)
              </Text>
            </View>
            <ScrollView style={styles.scrollView} nestedScrollEnabled>
              {bulkResults.map((result, idx) => (
                <View
                  key={`${result.name}-${idx}`}
                  style={styles.studentRow}
                >
                  <View style={styles.studentNameContainer}>
                    <Text style={styles.studentName}>
                      {result.name}
                    </Text>
                  </View>
                  <TextInput
                    value={result.marks?.toString() || ""}
                    onChangeText={(val) => handleMarksChange(idx, val)}
                    keyboardType="numeric"
                    placeholder="Marks"
                    placeholderTextColor="#9ca3af"
                    style={styles.marksInput}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {bulkResults.length === 0 && selectedClass && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No students found for the selected class/batch.
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          onPress={onSubmit}
          disabled={submitting || bulkResults.length === 0}
          style={[
            styles.submitButton,
            (submitting || bulkResults.length === 0) && styles.submitButtonDisabled
          ]}
        >
          <Text style={styles.submitButtonText}>
            {submitting
              ? "Submitting..."
              : `Submit All Results (${bulkResults.length})`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  formContainer: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#10b981',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  tableContainer: {
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  scrollView: {
    maxHeight: 384,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  studentNameContainer: {
    flex: 1,
  },
  studentName: {
    color: '#1f2937',
    fontWeight: '600',
  },
  marksInput: {
    width: 80,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
