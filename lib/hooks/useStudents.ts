/**
 * useStudents Hook
 * Student data fetching and management
 */

import { useCallback, useMemo, useState } from 'react';
import { StudentsService } from '../services';
import type { Student, StudentFilters } from '../types/index';
import { useApi } from './useApi';

interface UseStudentsOptions {
  immediate?: boolean;
  filters?: StudentFilters;
}

interface UseStudentsReturn {
  students: Student[];
  filteredStudents: Student[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  classFilter: string;
  setClassFilter: (classLevel: string) => void;
  batchFilter: string;
  setBatchFilter: (batch: string) => void;
  
  // Metadata
  classes: string[];
  batches: string[];
  totalCount: number;
  
  // Actions
  refresh: () => Promise<void>;
  getStudent: (id: string) => Promise<Student>;
}

export function useStudents(options: UseStudentsOptions = {}): UseStudentsReturn {
  const { immediate = true, filters } = options;
  
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [classFilter, setClassFilter] = useState(filters?.classLevel || '');
  const [batchFilter, setBatchFilter] = useState(filters?.batch || '');

  // Fetch students
  const {
    data: students,
    loading,
    error,
    refetch,
    isRefreshing: refreshing,
  } = useApi<Student[]>(
    () => StudentsService.getAll(),
    {
      initialData: [],
      immediate,
    }
  );

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter(student => {
      // Search filter
      const matchesSearch = !searchTerm || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Class filter
      const matchesClass = !classFilter || student.classLevel === classFilter;
      
      // Batch filter
      const matchesBatch = !batchFilter || student.batch === batchFilter;
      
      return matchesSearch && matchesClass && matchesBatch;
    });
  }, [students, searchTerm, classFilter, batchFilter]);

  // Extract unique classes
  const classes = useMemo(() => {
    if (!students) return [];
    const uniqueClasses = new Set(
      students.map(s => s.classLevel).filter(Boolean) as string[]
    );
    return Array.from(uniqueClasses).sort();
  }, [students]);

  // Extract unique batches
  const batches = useMemo(() => {
    if (!students) return [];
    const uniqueBatches = new Set(
      students.map(s => s.batch).filter(Boolean) as string[]
    );
    return Array.from(uniqueBatches);
  }, [students]);

  // Get single student
  const getStudent = useCallback(async (id: string): Promise<Student> => {
    return StudentsService.getById(id);
  }, []);

  return {
    students: students || [],
    filteredStudents,
    loading,
    error,
    refreshing,
    searchTerm,
    setSearchTerm,
    classFilter,
    setClassFilter,
    batchFilter,
    setBatchFilter,
    classes,
    batches,
    totalCount: students?.length || 0,
    refresh: refetch,
    getStudent,
  };
}

export default useStudents;
