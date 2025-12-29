/**
 * Students Service
 * Handles student-related API operations
 */

import type { Student, StudentFilters } from '../types/index';
import { api } from './api.service';

// =============================================================================
// TYPES
// =============================================================================

interface StudentsResponse {
  students?: Student[];
  items?: Student[];
  total?: number;
}

interface StudentPerformanceData {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  highestScore: number;
  recentAttempts?: any[];
}

// =============================================================================
// STUDENT OPERATIONS
// =============================================================================

export const StudentsService = {
  /**
   * Get all students (teacher view)
   */
  async getAll(filters?: StudentFilters): Promise<Student[]> {
    const params = new URLSearchParams();
    
    if (filters?.classLevel) {
      params.append('classLevel', filters.classLevel);
    }
    if (filters?.batch) {
      params.append('batch', filters.batch);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const query = params.toString();
    const endpoint = query 
      ? `/api/teacher/students?${query}` 
      : '/api/teacher/students';
    
    const response = await api.get<StudentsResponse | Student[]>(endpoint);
    
    if (Array.isArray(response)) {
      return response;
    }
    return response?.students || response?.items || [];
  },

  /**
   * Get student by ID
   */
  async getById(id: string): Promise<Student> {
    return api.get<Student>(`/api/teacher/students/${id}`);
  },

  /**
   * Get student performance/report
   */
  async getPerformance(studentId: string): Promise<StudentPerformanceData> {
    return api.get<StudentPerformanceData>(`/api/teacher/students/${studentId}/performance`);
  },

  /**
   * Get students by class level
   */
  async getByClass(classLevel: string): Promise<Student[]> {
    return this.getAll({ classLevel });
  },

  /**
   * Get students by batch
   */
  async getByBatch(batch: string): Promise<Student[]> {
    return this.getAll({ batch });
  },

  /**
   * Search students
   */
  async search(query: string): Promise<Student[]> {
    return this.getAll({ search: query });
  },

  /**
   * Get student count
   */
  async getCount(): Promise<number> {
    const students = await this.getAll();
    return students.length;
  },

  /**
   * Get unique class levels
   */
  async getClassLevels(): Promise<string[]> {
    const students = await this.getAll();
    const classes = new Set(students.map(s => s.classLevel).filter(Boolean));
    return Array.from(classes).sort();
  },

  /**
   * Get unique batches
   */
  async getBatches(): Promise<string[]> {
    const students = await this.getAll();
    const batches = new Set(students.map(s => s.batch).filter(Boolean));
    return Array.from(batches);
  },

  /**
   * Get students grouped by class
   */
  async getGroupedByClass(): Promise<Record<string, Student[]>> {
    const students = await this.getAll();
    return students.reduce((acc, student) => {
      const key = student.classLevel || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(student);
      return acc;
    }, {} as Record<string, Student[]>);
  },
};

export default StudentsService;
