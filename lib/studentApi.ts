// Student API service functions

import { apiFetch } from "./api";
import type {
    Attempt,
    AttemptDetailResponse,
    Exam,
    StudentAnalytics,
} from "./types";

// ============ Exam & Attempt APIs ============

/**
 * Get list of exams assigned to the logged-in student
 * Calls both /assigned (for exams) and /mine (for attempts) to match web app behavior
 */
export async function getAssignedExams(): Promise<{
  exams: Exam[];
  attempts: Record<string, Attempt>;
}> {
  // Call both APIs in parallel like the web app does
  const [examsData, attemptsData] = await Promise.all([
    apiFetch("/api/attempts/assigned"),
    apiFetch("/api/attempts/mine"),
  ]);

  // Exams API returns an array directly
  const exams = Array.isArray(examsData) ? (examsData as Exam[]) : [];

  // Attempts API returns an array, convert to Record<examId, Attempt>
  const attempts: Record<string, Attempt> = {};
  if (Array.isArray(attemptsData)) {
    for (const attempt of attemptsData as Attempt[]) {
      const examId =
        typeof attempt.examId === "string"
          ? attempt.examId
          : (attempt.examId as any)?._id;
      if (examId) {
        attempts[examId] = attempt;
      }
    }
  }

  return { exams, attempts };
}

/**
 * Start a new exam attempt
 * The API returns the full attempt object, we extract the _id as attemptId
 */
export async function startExamAttempt(
  examId: string,
): Promise<{ attemptId: string }> {
  const data = await apiFetch(`/api/attempts/${examId}/start`, {
    method: "POST",
  });
  // API returns the full attempt object with _id
  const attempt = data as Attempt;
  return { attemptId: attempt._id };
}

/**
 * Get all attempts by the logged-in student
 */
export async function getMyAttempts(): Promise<Attempt[]> {
  const data = await apiFetch("/api/attempts/mine");
  return data as Attempt[];
}

/**
 * Get attempt details with questions (for exam player)
 */
export async function getAttempt(
  attemptId: string,
): Promise<AttemptDetailResponse> {
  const data = await apiFetch(`/api/attempts/${attemptId}`);
  return data as AttemptDetailResponse;
}

/**
 * Save an answer for a question
 */
export async function saveAnswer(
  attemptId: string,
  questionId: string,
  response: string | number | string[],
): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/answer`, {
    method: "POST",
    body: JSON.stringify({ questionId, response }),
  });
}

/**
 * Mark/unmark a question for review
 */
export async function markForReview(
  attemptId: string,
  questionId: string,
  marked: boolean,
): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/mark`, {
    method: "POST",
    body: JSON.stringify({ questionId, marked }),
  });
}

/**
 * Submit the attempt
 */
export async function submitAttempt(attemptId: string): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/submit`, {
    method: "POST",
  });
}

// ============ Analytics APIs ============

/**
 * Get student's progress analytics
 */
export async function getMyProgress(
  mode: "online" | "offline" | "combined" = "combined",
): Promise<StudentAnalytics> {
  const data = await apiFetch(`/api/analytics/me/progress?mode=${mode}`);
  return data as StudentAnalytics;
}
