// Practice Test API service functions

import { apiFetch } from "./api";

// ============ Types ============

export interface PracticeTestMeta {
  subjects: { name: string; questionCount: number }[];
  chapters: Record<string, { name: string; questionCount: number }[]>;
  difficultyStats: { easy: number; medium: number; hard: number };
  totalQuestions: number;
}

export interface PracticeTestPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: {
    questionCount: number;
    duration: {
      type: "total" | "per-question" | "none";
      totalMins?: number;
      perQuestionSecs?: number;
    };
    difficulty: { easy: number; medium: number; hard: number };
    markingScheme: { correct: number; incorrect: number; unattempted: number };
  };
}

export interface CreatePracticeTestRequest {
  subjects: string[];
  chapters?: string[];
  questionCount: number;
  difficulty: { easy: number; medium: number; hard: number };
  duration: {
    type: "total" | "per-question" | "none";
    totalMins?: number;
    perQuestionSecs?: number;
  };
  markingScheme: { correct: number; incorrect: number; unattempted: number };
  preset?: string;
  title?: string;
}

export interface PracticeTest {
  _id: string;
  userId: string;
  title: string;
  filters: {
    subjects: string[];
    chapters: string[];
    difficulty: { easy: number; medium: number; hard: number };
  };
  questionCount: number;
  actualQuestionCount: number;
  questionIds: string[];
  duration: {
    type: "total" | "per-question" | "none";
    totalMins?: number;
    perQuestionSecs?: number;
  };
  markingScheme: { correct: number; incorrect: number; unattempted: number };
  preset?: string;
  status: "created" | "in-progress" | "completed";
  insufficientQuestionsWarning?: string;
  createdAt: string;
}

export interface ChapterPerformance {
  chapter: string;
  subject: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  total: number;
  percentage: number;
}

// ============ API Functions ============

/**
 * Get metadata for custom test builder (subjects, chapters, stats)
 */
export async function getPracticeTestMeta(): Promise<PracticeTestMeta> {
  const data = await apiFetch("/api/practice-tests/meta");
  return data as PracticeTestMeta;
}

/**
 * Get quick test presets
 */
export async function getPresets(): Promise<PracticeTestPreset[]> {
  const data = await apiFetch("/api/practice-tests/presets");
  return data as PracticeTestPreset[];
}

/**
 * Get user's practice test history
 */
export async function getPracticeTestHistory(opts?: {
  status?: string;
  limit?: number;
}): Promise<PracticeTest[]> {
  const params = new URLSearchParams();
  if (opts?.status) params.append("status", opts.status);
  if (opts?.limit) params.append("limit", String(opts.limit));

  const url = `/api/practice-tests/history${params.toString() ? "?" + params.toString() : ""}`;
  const data = await apiFetch(url);
  return data as PracticeTest[];
}

/**
 * Create a new custom practice test
 */
export async function createPracticeTest(
  config: CreatePracticeTestRequest,
): Promise<PracticeTest> {
  const data = await apiFetch("/api/practice-tests", {
    method: "POST",
    body: JSON.stringify(config),
  });
  return data as PracticeTest;
}

/**
 * Get practice test details
 */
export async function getPracticeTest(
  practiceTestId: string,
): Promise<{ practiceTest: PracticeTest; questions: Record<string, any> }> {
  const data = await apiFetch(`/api/practice-tests/${practiceTestId}`);
  return data as { practiceTest: PracticeTest; questions: Record<string, any> };
}

/**
 * Start an attempt for a practice test
 */
export async function startPracticeTestAttempt(
  practiceTestId: string,
): Promise<{ _id: string }> {
  const data = await apiFetch(`/api/practice-tests/${practiceTestId}/start`, {
    method: "POST",
  });
  return data as { _id: string };
}

/**
 * Get attempt view for a practice test
 */
export async function getPracticeTestAttempt(
  practiceTestId: string,
): Promise<any> {
  const data = await apiFetch(`/api/practice-tests/${practiceTestId}/attempt`);
  return data;
}

/**
 * Save answer for a practice test question
 */
export async function savePracticeTestAnswer(
  practiceTestId: string,
  questionId: string,
  answer: {
    chosenOptionId?: string;
    textAnswer?: string;
    timeSpentSec?: number;
  },
): Promise<void> {
  await apiFetch(`/api/practice-tests/${practiceTestId}/answer`, {
    method: "POST",
    body: JSON.stringify({ questionId, ...answer }),
  });
}

/**
 * Mark/unmark a question for review
 */
export async function markPracticeTestQuestion(
  practiceTestId: string,
  questionId: string,
  marked: boolean,
): Promise<void> {
  await apiFetch(`/api/practice-tests/${practiceTestId}/mark`, {
    method: "POST",
    body: JSON.stringify({ questionId, marked }),
  });
}

/**
 * Submit practice test
 */
export async function submitPracticeTest(
  practiceTestId: string,
  auto = false,
): Promise<void> {
  await apiFetch(`/api/practice-tests/${practiceTestId}/submit`, {
    method: "POST",
    body: JSON.stringify({ auto }),
  });
}

/**
 * Get practice test result with chapter-wise analysis
 */
export async function getPracticeTestResult(practiceTestId: string): Promise<{
  practiceTest: PracticeTest;
  attempt: any;
  questions: Record<string, any>;
  sections: any[];
  chapterAnalysis: ChapterPerformance[];
}> {
  const data = await apiFetch(`/api/practice-tests/${practiceTestId}/result`);
  return data as any;
}
