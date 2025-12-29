/**
 * useReviews Hook
 * Review data fetching and management
 */

import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ReviewsService } from '../services';
import type { PendingReview, ReviewData } from '../types/index';
import { useApi, useMutation } from './useApi';

type ReviewFilter = 'all' | 'pending' | 'published';

interface UseReviewsReturn {
  reviews: PendingReview[];
  filteredReviews: PendingReview[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Filter
  filter: ReviewFilter;
  setFilter: (filter: ReviewFilter) => void;
  
  // Stats
  stats: {
    total: number;
    pending: number;
    published: number;
  };
  
  // Actions
  refresh: () => Promise<void>;
  openReview: (attemptId: string) => Promise<ReviewData>;
  publishResult: (attemptId: string) => Promise<void>;
  
  // Current review state
  activeReview: ReviewData | null;
  setActiveReview: (review: ReviewData | null) => void;
  
  // Mutation states
  isPublishing: boolean;
}

export function useReviews(): UseReviewsReturn {
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [activeReview, setActiveReview] = useState<ReviewData | null>(null);

  // Fetch pending reviews
  const {
    data: reviews,
    loading,
    error,
    refetch,
    isRefreshing: refreshing,
  } = useApi<PendingReview[]>(
    () => ReviewsService.getPending(),
    {
      initialData: [],
    }
  );

  // Publish mutation
  const publishMutation = useMutation<void, string>(
    (attemptId) => ReviewsService.publishResult(attemptId),
    {
      onSuccess: () => {
        refetch();
        setActiveReview(null);
        Alert.alert('Success', 'Result published successfully');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to publish result');
      },
    }
  );

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    return ReviewsService.filterByStatus(reviews, filter);
  }, [reviews, filter]);

  // Stats
  const stats = useMemo(() => {
    const all = reviews || [];
    const pending = all.filter(r => !r.resultPublished).length;
    return {
      total: all.length,
      pending,
      published: all.length - pending,
    };
  }, [reviews]);

  // Open review
  const openReview = useCallback(async (attemptId: string): Promise<ReviewData> => {
    const reviewData = await ReviewsService.getAttemptForReview(attemptId);
    setActiveReview(reviewData);
    return reviewData;
  }, []);

  // Publish result with confirmation
  const publishResult = useCallback(async (attemptId: string) => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        'Publish Result',
        'Are you sure you want to publish this result? The student will be able to see their score.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancelled')) },
          {
            text: 'Publish',
            onPress: async () => {
              try {
                await publishMutation.mutateAsync(attemptId);
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          },
        ]
      );
    });
  }, [publishMutation]);

  return {
    reviews: reviews || [],
    filteredReviews,
    loading,
    error,
    refreshing,
    filter,
    setFilter,
    stats,
    refresh: refetch,
    openReview,
    publishResult,
    activeReview,
    setActiveReview,
    isPublishing: publishMutation.isLoading,
  };
}

export default useReviews;
