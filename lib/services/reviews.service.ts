/**
 * Reviews/Attempts Service
 * Handles exam attempt reviews and scoring
 */

import type { Attempt, PendingReview, ReviewData } from '../types/index';
import { api } from './api.service';

// =============================================================================
// TYPES
// =============================================================================

interface PendingReviewsResponse {
  items?: PendingReview[];
  total?: number;
}

// =============================================================================
// REVIEW OPERATIONS
// =============================================================================

export const ReviewsService = {
  /**
   * Get pending reviews
   */
  async getPending(): Promise<PendingReview[]> {
    const response = await api.get<PendingReview[] | PendingReviewsResponse>(
      '/api/attempts/review/pending'
    );
    
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || [];
  },

  /**
   * Get review count
   */
  async getPendingCount(): Promise<number> {
    const pending = await this.getPending();
    return pending.length;
  },

  /**
   * Get attempt for review
   */
  async getAttemptForReview(attemptId: string): Promise<ReviewData> {
    return api.get<ReviewData>(`/api/attempts/${attemptId}/review`);
  },

  /**
   * Submit review scores
   */
  async submitReview(
    attemptId: string,
    scores: Record<string, number>,
    notes?: string
  ): Promise<Attempt> {
    return api.post<Attempt>(`/api/attempts/${attemptId}/review`, {
      scores,
      notes,
    });
  },

  /**
   * Update answer score
   */
  async updateAnswerScore(
    attemptId: string,
    questionId: string,
    score: number
  ): Promise<void> {
    await api.patch(`/api/attempts/${attemptId}/answers/${questionId}`, {
      scoreAwarded: score,
    });
  },

  /**
   * Publish result
   */
  async publishResult(attemptId: string): Promise<void> {
    await api.post(`/api/attempts/${attemptId}/publish`, {
      publish: true,
    });
  },

  /**
   * Unpublish result
   */
  async unpublishResult(attemptId: string): Promise<void> {
    await api.post(`/api/attempts/${attemptId}/publish`, {
      publish: false,
    });
  },

  /**
   * Get all attempts for an exam
   */
  async getExamAttempts(examId: string): Promise<Attempt[]> {
    const response = await api.get<Attempt[] | { items: Attempt[] }>(
      `/api/attempts/exam/${examId}`
    );
    
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || [];
  },

  /**
   * Get student's attempts
   */
  async getStudentAttempts(studentId: string): Promise<Attempt[]> {
    const response = await api.get<Attempt[] | { items: Attempt[] }>(
      `/api/attempts/student/${studentId}`
    );
    
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || [];
  },

  /**
   * Get review stats
   */
  async getStats(): Promise<{
    pending: number;
    reviewed: number;
    published: number;
  }> {
    const pending = await this.getPending();
    // You might need to add additional API calls for reviewed/published counts
    return {
      pending: pending.length,
      reviewed: 0, // Implement if API supports
      published: 0, // Implement if API supports
    };
  },

  /**
   * Filter pending reviews
   */
  filterByStatus(
    reviews: PendingReview[],
    status: 'pending' | 'published' | 'all'
  ): PendingReview[] {
    if (status === 'all') return reviews;
    if (status === 'pending') return reviews.filter(r => !r.resultPublished);
    if (status === 'published') return reviews.filter(r => r.resultPublished);
    return reviews;
  },
};

export default ReviewsService;
