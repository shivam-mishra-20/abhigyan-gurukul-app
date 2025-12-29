/**
 * Exams Service
 * Handles all exam-related API operations
 */

import type {
    CreateExamData,
    Exam,
    ExamFilters,
    Question
} from '../types/index';
import { api } from './api.service';

// =============================================================================
// TYPES
// =============================================================================

interface ExamsResponse {
  items: Exam[];
  total?: number;
}

interface QuestionsResponse {
  items: Question[];
  total?: number;
}

// =============================================================================
// EXAM OPERATIONS
// =============================================================================

export const ExamsService = {
  /**
   * Get all exams with optional filters
   */
  async getAll(filters?: ExamFilters): Promise<Exam[]> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
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
    const endpoint = query ? `/api/exams?${query}` : '/api/exams';
    
    const response = await api.get<ExamsResponse | Exam[]>(endpoint);
    
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || [];
  },

  /**
   * Get exam by ID
   */
  async getById(id: string): Promise<Exam> {
    return api.get<Exam>(`/api/exams/${id}`);
  },

  /**
   * Create new exam
   */
  async create(data: CreateExamData): Promise<Exam> {
    return api.post<Exam>('/api/exams', {
      ...data,
      sections: data.sections || [],
      isPublished: data.isPublished ?? false,
    });
  },

  /**
   * Update exam
   */
  async update(id: string, updates: Partial<Exam>): Promise<Exam> {
    return api.put<Exam>(`/api/exams/${id}`, updates);
  },

  /**
   * Delete exam
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/exams/${id}`);
  },

  /**
   * Publish exam
   */
  async publish(id: string): Promise<Exam> {
    return api.put<Exam>(`/api/exams/${id}`, { isPublished: true });
  },

  /**
   * Unpublish exam
   */
  async unpublish(id: string): Promise<Exam> {
    return api.put<Exam>(`/api/exams/${id}`, { isPublished: false });
  },

  /**
   * Toggle publish status
   */
  async togglePublish(exam: Exam): Promise<Exam> {
    return api.put<Exam>(`/api/exams/${exam._id}`, { 
      isPublished: !exam.isPublished 
    });
  },

  /**
   * Assign exam to class/batch
   */
  async assign(
    id: string, 
    classLevel: string, 
    batch: string
  ): Promise<void> {
    // Update exam with class/batch info
    await api.put(`/api/exams/${id}`, {
      classLevel,
      batch,
      isPublished: true,
    });

    // Create groups array for assignment
    const groups = batch === 'All Batches'
      ? [classLevel, 'Lakshya', 'Aadharshilla', 'Basic', 'Commerce']
      : [classLevel, batch];

    // Assign to groups
    await api.post(`/api/exams/${id}/assign`, { groups });
  },

  /**
   * Duplicate exam
   */
  async duplicate(id: string): Promise<Exam> {
    const original = await this.getById(id);
    return this.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      totalDurationMins: original.totalDurationMins,
      sections: original.sections,
      isPublished: false,
    });
  },

  /**
   * Get exam stats
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
  }> {
    const exams = await this.getAll();
    const published = exams.filter(e => e.isPublished).length;
    return {
      total: exams.length,
      published,
      draft: exams.length - published,
    };
  },
};

// =============================================================================
// QUESTION OPERATIONS
// =============================================================================

export const QuestionsService = {
  /**
   * Get all questions
   */
  async getAll(limit?: number): Promise<{ items: Question[]; total: number }> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get<QuestionsResponse>(`/api/exams/questions${params}`);
    return {
      items: response?.items || [],
      total: response?.total || 0,
    };
  },

  /**
   * Get question by ID
   */
  async getById(id: string): Promise<Question> {
    return api.get<Question>(`/api/exams/questions/${id}`);
  },

  /**
   * Create question
   */
  async create(data: Partial<Question>): Promise<Question> {
    return api.post<Question>('/api/exams/questions', data);
  },

  /**
   * Update question
   */
  async update(id: string, updates: Partial<Question>): Promise<Question> {
    return api.put<Question>(`/api/exams/questions/${id}`, updates);
  },

  /**
   * Delete question
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/exams/questions/${id}`);
  },
};

export default ExamsService;
