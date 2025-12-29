/**
 * useExams Hook
 * Exam data fetching and management
 */

import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ExamsService } from '../services';
import type { CreateExamData, Exam, ExamFilters } from '../types/index';
import { useApi, useMutation } from './useApi';

interface UseExamsOptions {
  immediate?: boolean;
  filters?: ExamFilters;
}

interface UseExamsReturn {
  // Data
  exams: Exam[];
  filteredExams: Exam[];
  
  // State
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Filters
  filter: ExamFilters['status'];
  setFilter: (filter: ExamFilters['status']) => void;
  
  // Stats
  stats: {
    total: number;
    published: number;
    draft: number;
  };
  
  // Actions
  refresh: () => Promise<void>;
  createExam: (data: CreateExamData) => Promise<Exam>;
  updateExam: (id: string, data: Partial<Exam>) => Promise<void>;
  deleteExam: (exam: Exam) => Promise<void>;
  togglePublish: (exam: Exam) => Promise<void>;
  assignExam: (exam: Exam, classLevel: string, batch: string) => Promise<void>;
  
  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useExams(options: UseExamsOptions = {}): UseExamsReturn {
  const { immediate = true, filters } = options;
  
  const [filter, setFilter] = useState<ExamFilters['status']>('all');

  // Fetch exams
  const {
    data: exams,
    loading,
    error,
    refetch,
    isRefreshing: refreshing,
    setData: setExams,
  } = useApi<Exam[]>(
    () => ExamsService.getAll(filters),
    {
      initialData: [],
      immediate,
    }
  );

  // Create exam mutation
  const createMutation = useMutation<Exam, CreateExamData>(
    (data) => ExamsService.create(data),
    {
      onSuccess: (newExam) => {
        setExams([...(exams || []), newExam]);
      },
    }
  );

  // Update exam mutation
  const updateMutation = useMutation<Exam, { id: string; data: Partial<Exam> }>(
    ({ id, data }) => ExamsService.update(id, data),
    {
      onSuccess: (updatedExam) => {
        setExams(
          (exams || []).map(e => e._id === updatedExam._id ? updatedExam : e)
        );
      },
    }
  );

  // Delete exam mutation
  const deleteMutation = useMutation<void, string>(
    (id) => ExamsService.delete(id),
    {
      onSuccess: (_, id) => {
        setExams((exams || []).filter(e => e._id !== id));
      },
    }
  );

  // Filtered exams based on status
  const filteredExams = useMemo(() => {
    if (!exams) return [];
    if (filter === 'published') return exams.filter(e => e.isPublished);
    if (filter === 'draft') return exams.filter(e => !e.isPublished);
    return exams;
  }, [exams, filter]);

  // Stats
  const stats = useMemo(() => {
    const all = exams || [];
    const published = all.filter(e => e.isPublished).length;
    return {
      total: all.length,
      published,
      draft: all.length - published,
    };
  }, [exams]);

  // Actions
  const createExam = useCallback(async (data: CreateExamData): Promise<Exam> => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const updateExam = useCallback(async (id: string, data: Partial<Exam>) => {
    await updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteExam = useCallback(async (exam: Exam) => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        'Delete Exam',
        `Are you sure you want to delete "${exam.title}"?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancelled')) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMutation.mutateAsync(exam._id);
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          },
        ]
      );
    });
  }, [deleteMutation]);

  const togglePublish = useCallback(async (exam: Exam) => {
    await updateExam(exam._id, { isPublished: !exam.isPublished });
  }, [updateExam]);

  const assignExam = useCallback(async (
    exam: Exam,
    classLevel: string,
    batch: string
  ) => {
    await ExamsService.assign(exam._id, classLevel, batch);
    await refetch();
  }, [refetch]);

  return {
    exams: exams || [],
    filteredExams,
    loading,
    error,
    refreshing,
    filter,
    setFilter,
    stats,
    refresh: refetch,
    createExam,
    updateExam,
    deleteExam,
    togglePublish,
    assignExam,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}

export default useExams;
