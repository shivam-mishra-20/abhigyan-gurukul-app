/**
 * useDashboard Hook
 * Dashboard data fetching and state management for teacher home
 */

import { useCallback, useEffect, useState } from 'react';
import { ExamsService, QuestionsService, ReviewsService, StudentsService } from '../services';
import { AuthService } from '../services/auth.service';
import type { DashboardStats, Exam } from '../types/index';

// Define PendingReviewData locally to avoid import issues
interface PendingReviewData {
  _id: string;
  examId: string | { _id: string; title?: string };
  userId: string | { _id: string; name?: string };
  status: string;
  startedAt?: string;
  submittedAt?: string;
  totalScore?: number;
  maxScore?: number;
  studentName?: string;
  examTitle?: string;
}

export interface UseDashboardReturn {
  stats: DashboardStats & { teacherName?: string };
  recentExams: Exam[];
  pendingReviews: PendingReviewData[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refetch: () => Promise<void>;
}

const initialStats: DashboardStats & { teacherName?: string } = {
  totalQuestions: 0,
  totalExams: 0,
  pendingReviews: 0,
  totalPapers: 0,
  totalStudents: 0,
  publishedExams: 0,
  draftExams: 0,
  teacherName: undefined,
};

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState(initialStats);
  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch all data in parallel for better performance
      const [
        user,
        questionsData,
        exams,
        pending,
        studentCount,
      ] = await Promise.all([
        AuthService.getCurrentUser().catch(() => null),
        QuestionsService.getAll(1).catch(() => ({ items: [], total: 0 })),
        ExamsService.getAll().catch(() => []),
        ReviewsService.getPending().catch(() => []),
        StudentsService.getCount().catch(() => 0),
      ]);

      const publishedExams = exams.filter((e: Exam) => e.isPublished).length;

      setStats({
        totalQuestions: questionsData.total || 0,
        totalExams: exams.length,
        pendingReviews: pending.length,
        totalPapers: questionsData.total || 0,
        totalStudents: studentCount,
        publishedExams,
        draftExams: exams.length - publishedExams,
        teacherName: user?.name,
      });
      setRecentExams(exams.slice(0, 5));
      setPendingReviews(pending.slice(0, 5) as PendingReviewData[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    recentExams,
    pendingReviews,
    loading,
    error,
    refreshing,
    refetch,
  };
}

export default useDashboard;
