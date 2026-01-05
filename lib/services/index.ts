/**
 * Services Index
 * Central export for all services
 */

export { API_BASE_URL, API_CONFIG, api, apiFetch } from './api.service';
export { AuthService, getStoredUser, setStoredUser } from './auth.service';
export { ExamsService, QuestionsService } from './exams.service';
export { resultsService } from './results.service';
export { ReviewsService } from './reviews.service';
export { StudentsService } from './students.service';

// Re-export types for convenience
export type { FetchOptions } from './api.service';
export type { AddBulkResultsRequest, AddResultRequest, BulkResultEntry, OfflineResult } from './results.service';

