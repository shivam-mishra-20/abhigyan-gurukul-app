/**
 * useApi Hook
 * Generic hook for API data fetching with loading, error, and refresh states
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AsyncState } from '../types/index';

interface UseApiOptions<T> {
  /** Initial data before fetch */
  initialData?: T;
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
  /** Transform response data */
  transform?: (data: unknown) => T;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> extends AsyncState<T> {
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Manual set data */
  setData: (data: T | null) => void;
  /** Clear error */
  clearError: () => void;
  /** Is initial loading (no data yet) */
  isInitialLoading: boolean;
  /** Is refreshing (has data, loading more) */
  isRefreshing: boolean;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    initialData = null,
    immediate = true,
    deps = [],
    transform,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData as T | null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | undefined>();

  const mountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  const fetch = useCallback(async () => {
    const fetchId = ++fetchCountRef.current;
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      
      // Only update if this is the latest fetch and component is mounted
      if (fetchId === fetchCountRef.current && mountedRef.current) {
        const transformedData = transform ? transform(result) : result;
        setData(transformedData);
        setLastFetched(new Date());
        onSuccess?.(transformedData);
      }
    } catch (err) {
      if (fetchId === fetchCountRef.current && mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      if (fetchId === fetchCountRef.current && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, transform, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await fetch();
  }, [fetch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect for initial fetch and dependency changes
  useEffect(() => {
    if (immediate) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch,
    setData,
    clearError,
    isInitialLoading: loading && !data,
    isRefreshing: loading && !!data,
  };
}

/**
 * useMutation Hook
 * For API operations that modify data (POST, PUT, DELETE)
 */

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setIsError(false);

      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);
        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setIsError(true);
        onError?.(err instanceof Error ? err : new Error(errorMessage), variables);
        onSettled?.(null, err instanceof Error ? err : new Error(errorMessage), variables);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Error already handled in mutateAsync
      });
    },
    [mutateAsync]
  ) as (variables: TVariables) => Promise<TData>;

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
}

export default useApi;
