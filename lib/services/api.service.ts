/**
 * API Service Configuration
 * Centralized API setup with retry logic, timeouts, and error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { ApiError } from '../types/index';

// =============================================================================
// CONFIGURATION
// =============================================================================

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
  RETRY_MULTIPLIER: 2, // Exponential backoff
} as const;

// =============================================================================
// BASE URL DETECTION
// =============================================================================

const getApiBaseUrl = (): string => {
  // Production URL - Replace with your actual production URL
  const PRODUCTION_URL = 'https://api.abhigyangurukul.com';
  const PORT = 5000;

  // Check if we're in production
  if (!__DEV__) {
    return PRODUCTION_URL;
  }

  // Development: Auto-detect host IP from Expo
  const debuggerHost = 
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  const hostIp = debuggerHost ? debuggerHost.split(':')[0] : null;

  if (Platform.OS === 'android') {
    if (hostIp) return `http://${hostIp}:${PORT}`;
    return `http://10.0.2.2:${PORT}`; // Android emulator fallback
  }

  if (Platform.OS === 'ios') {
    if (hostIp) return `http://${hostIp}:${PORT}`;
    return `http://localhost:${PORT}`; // iOS simulator fallback
  }

  return `http://localhost:${PORT}`; // Web fallback
};

export const API_BASE_URL = getApiBaseUrl();

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

const TOKEN_KEY = 'accessToken';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class ApiServiceError extends Error implements ApiError {
  status?: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status?: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const createNetworkError = (originalError: Error): ApiServiceError => {
  const troubleshoot = [
    `Backend URL: ${API_BASE_URL}`,
    `Platform: ${Platform.OS}`,
    '',
    'Please check:',
    '• Backend server is running',
    '• Device and server are on same network',
    '• Firewall allows connections',
  ].join('\n');

  return new ApiServiceError(
    `Network Error\n\n${troubleshoot}`,
    0,
    'NETWORK_ERROR',
    { originalError: originalError.message }
  );
};

// =============================================================================
// RETRY LOGIC
// =============================================================================

const wait = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: ApiServiceError, attempt: number): boolean => {
  // Don't retry if max attempts reached
  if (attempt >= API_CONFIG.RETRY_ATTEMPTS) return false;

  // Don't retry client errors (4xx) except for specific cases
  if (error.status && error.status >= 400 && error.status < 500) {
    // Retry on 408 (timeout) and 429 (rate limit)
    return error.status === 408 || error.status === 429;
  }

  // Retry on network errors and server errors (5xx)
  return !error.status || error.status >= 500;
};

const getRetryDelay = (attempt: number): number => {
  // Exponential backoff with jitter
  const baseDelay = API_CONFIG.RETRY_DELAY * Math.pow(API_CONFIG.RETRY_MULTIPLIER, attempt);
  const jitter = Math.random() * 500; // Add up to 500ms random jitter
  return baseDelay + jitter;
};

// =============================================================================
// CORE FETCH WITH TIMEOUT
// =============================================================================

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = API_CONFIG.TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new ApiServiceError('Request timeout', 408, 'TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// =============================================================================
// MAIN API FUNCTION
// =============================================================================

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  timeout?: number;
  retries?: number;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    body,
    skipAuth = false,
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    ...fetchOptions
  } = options;

  // Build URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Build headers
  const headers = new Headers(fetchOptions.headers);

  // Add auth token
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Set content type for JSON body
  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  // Attempt request with retry logic
  let lastError: ApiServiceError | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Log in development only
      if (__DEV__ && attempt === 0) {
        console.log(`[API] ${fetchOptions.method || 'GET'} ${endpoint}`);
      }

      const response = await fetchWithTimeout(url, requestOptions, timeout);

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      // Parse response
      let data: unknown = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // Response wasn't valid JSON
        }
      } else {
        data = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        const message = 
          (data && typeof data === 'object' && 'message' in data)
            ? String((data as { message: string }).message)
            : response.statusText || 'Request failed';

        throw new ApiServiceError(message, response.status, undefined, data);
      }

      if (__DEV__) {
        console.log(`[API] ✓ ${endpoint}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiServiceError) {
        lastError = error;
      } else if (error instanceof Error) {
        lastError = error.message.includes('Network request failed')
          ? createNetworkError(error)
          : new ApiServiceError(error.message);
      } else {
        lastError = new ApiServiceError('Unknown error occurred');
      }

      // Check if we should retry
      if (shouldRetry(lastError, attempt + 1)) {
        const delay = getRetryDelay(attempt);
        if (__DEV__) {
          console.log(`[API] Retry ${attempt + 1}/${retries} in ${delay}ms`);
        }
        await wait(delay);
        continue;
      }

      // No more retries, throw the error
      break;
    }
  }

  throw lastError || new ApiServiceError('Request failed after retries');
}

// =============================================================================
// CONVENIENCE METHODS
// =============================================================================

export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<FetchOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
