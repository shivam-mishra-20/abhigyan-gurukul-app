import { apiFetch } from '../api';

export interface OfflineResult {
  _id?: string;
  class: string;
  name: string;
  batch?: string;
  subject: string;
  marks: number;
  outOf: number;
  remarks?: string;
  testDate: string; // yyyy-mm-dd format
  createdAt?: string;
  updatedAt?: string;
  percentage?: number;
}

export interface BulkResultEntry {
  name: string;
  marks: string | number;
  outOf: string | number;
  remarks?: string;
}

export interface AddResultRequest {
  class: string;
  name: string;
  batch?: string;
  subject: string;
  marks: number;
  outOf: number;
  remarks?: string;
  testDate: string;
}

export interface AddBulkResultsRequest {
  class: string;
  batch?: string;
  subject: string;
  testDate: string;
  results: BulkResultEntry[];
}

export interface ResultsResponse {
  success: boolean;
  data?: OfflineResult[];
  count?: number;
  message?: string;
  error?: string;
}

export interface SingleResultResponse {
  success: boolean;
  data?: OfflineResult;
  message?: string;
  error?: string;
}

export interface StatsResponse {
  success: boolean;
  data?: {
    totalResults: number;
    averageMarks: number;
    averagePercentage: number;
    highestMarks: number;
    lowestMarks: number;
  };
  message?: string;
  error?: string;
}

/**
 * Add a single result
 */
export async function addResult(data: AddResultRequest): Promise<SingleResultResponse> {
  try {
    const response = await apiFetch('/api/results/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as SingleResultResponse;
  } catch (error) {
    console.error('Error adding result:', error);
    throw error;
  }
}

/**
 * Add multiple results in bulk
 */
export async function addBulkResults(data: AddBulkResultsRequest): Promise<ResultsResponse> {
  try {
    const response = await apiFetch('/api/results/bulk-add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as ResultsResponse;
  } catch (error) {
    console.error('Error adding bulk results:', error);
    throw error;
  }
}

/**
 * Get results for a specific student
 */
export async function getStudentResults(name: string, className: string): Promise<ResultsResponse> {
  try {
    const params = new URLSearchParams({ name, class: className });
    const response = await apiFetch(`/api/results/student?${params.toString()}`);
    return response as ResultsResponse;
  } catch (error) {
    console.error('Error fetching student results:', error);
    throw error;
  }
}

/**
 * Get all results with optional filters (teacher/admin only)
 */
export async function getAllResults(filters?: {
  class?: string;
  name?: string;
  batch?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<ResultsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.class) params.append('class', filters.class);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.batch) params.append('batch', filters.batch);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiFetch(`/api/results/all?${params.toString()}`);
    return response as ResultsResponse;
  } catch (error) {
    console.error('Error fetching all results:', error);
    throw error;
  }
}

/**
 * Update a result
 */
export async function updateResult(id: string, data: Partial<OfflineResult>): Promise<SingleResultResponse> {
  try {
    const response = await apiFetch(`/api/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response as SingleResultResponse;
  } catch (error) {
    console.error('Error updating result:', error);
    throw error;
  }
}

/**
 * Delete a result
 */
export async function deleteResult(id: string): Promise<SingleResultResponse> {
  try {
    const response = await apiFetch(`/api/results/${id}`, {
      method: 'DELETE',
    });
    return response as SingleResultResponse;
  } catch (error) {
    console.error('Error deleting result:', error);
    throw error;
  }
}

/**
 * Get result statistics (teacher/admin only)
 */
export async function getResultStats(filters?: {
  class?: string;
  batch?: string;
  subject?: string;
}): Promise<StatsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.class) params.append('class', filters.class);
    if (filters?.batch) params.append('batch', filters.batch);
    if (filters?.subject) params.append('subject', filters.subject);

    const response = await apiFetch(`/api/results/stats?${params.toString()}`);
    return response as StatsResponse;
  } catch (error) {
    console.error('Error fetching result stats:', error);
    throw error;
  }
}

export const resultsService = {
  addResult,
  addBulkResults,
  getStudentResults,
  getAllResults,
  updateResult,
  deleteResult,
  getResultStats,
};
