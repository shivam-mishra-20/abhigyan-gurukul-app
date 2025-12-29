// Student API service functions

import { apiFetch } from './api';
import type {
    Attempt,
    AttemptDetailResponse,
    Exam,
    ProgressDataPoint
} from './types';

// ============ Exam & Attempt APIs ============

/**
 * Get list of exams assigned to the logged-in student
 */
export async function getAssignedExams(): Promise<{
  exams: Exam[];
  attempts: Record<string, Attempt>;
}> {
  const data = await apiFetch('/api/attempts/assigned');
  return data as { exams: Exam[]; attempts: Record<string, Attempt> };
}

/**
 * Start a new exam attempt
 */
export async function startExamAttempt(examId: string): Promise<{ attemptId: string }> {
  const data = await apiFetch(`/api/attempts/${examId}/start`, {
    method: 'POST',
  });
  return data as { attemptId: string };
}

/**
 * Get all attempts by the logged-in student
 */
export async function getMyAttempts(): Promise<Attempt[]> {
  const data = await apiFetch('/api/attempts/mine');
  return data as Attempt[];
}

/**
 * Get attempt details with questions (for exam player)
 */
export async function getAttempt(attemptId: string): Promise<AttemptDetailResponse> {
  const data = await apiFetch(`/api/attempts/${attemptId}`);
  return data as AttemptDetailResponse;
}

/**
 * Save an answer for a question
 */
export async function saveAnswer(
  attemptId: string,
  questionId: string,
  response: string | number | string[]
): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, response }),
  });
}

/**
 * Mark/unmark a question for review
 */
export async function markForReview(
  attemptId: string,
  questionId: string,
  marked: boolean
): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/mark`, {
    method: 'POST',
    body: JSON.stringify({ questionId, marked }),
  });
}

/**
 * Submit the attempt
 */
export async function submitAttempt(attemptId: string): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/submit`, {
    method: 'POST',
  });
}

// ============ Analytics APIs ============

/**
 * Get student's progress analytics
 */
export async function getMyProgress(): Promise<ProgressDataPoint[]> {
  const data = await apiFetch('/api/analytics/me/progress');
  return data as ProgressDataPoint[];
}
