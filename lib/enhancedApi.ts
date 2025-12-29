// Enhanced Student API service functions for new features

import { apiFetch } from './api';

// ============ Types ============

export interface Course {
  _id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  batch?: string;
  instructor?: { _id: string; name: string };
  thumbnail?: string;
  duration?: number;
  lectureCount?: number;
  status: 'draft' | 'published' | 'archived';
  isFree: boolean;
  isEnrolled?: boolean;
  progressPercent?: number;
  syllabus?: CourseSyllabus[];
}

export interface CourseSyllabus {
  title: string;
  description?: string;
  lectures: CourseLecture[];
}

export interface CourseLecture {
  _id?: string;
  title: string;
  videoUrl?: string;
  duration?: number;
  order: number;
}

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  classLevel?: string;
  batch?: string;
  subject?: string;
  notes?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface AttendanceResponse {
  records: AttendanceRecord[];
  stats: AttendanceStats;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  percentage: number;
  byDate: Record<string, string>;
}

export interface Material {
  _id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'document' | 'link' | 'other';
  fileUrl: string;
  fileSize?: number;
  subject: string;
  classLevel: string;
  batch?: string;
  chapter?: string;
  downloadCount: number;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target: 'all' | 'students' | 'teachers' | 'class' | 'batch';
  createdBy?: { _id: string; name: string };
  createdAt: string;
  expiresAt?: string;
}

export interface ScheduleItem {
  _id: string;
  title: string;
  description?: string;
  type: 'class' | 'exam' | 'event' | 'holiday';
  startTime: string;
  endTime: string;
  subject?: string;
  classLevel?: string;
  batch?: string;
  instructor?: { _id: string; name: string };
  location?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  classLevel?: string;
  batch?: string;
  totalScore: number;
  maxPossibleScore: number;
  examsTaken: number;
  avgPercentage: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
  totalParticipants: number;
}

// ============ Course APIs ============

export async function getCourses(filters?: { 
  classLevel?: string; 
  subject?: string; 
  batch?: string 
}): Promise<Course[]> {
  const params = new URLSearchParams();
  if (filters?.classLevel) params.append('classLevel', filters.classLevel);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.batch) params.append('batch', filters.batch);
  
  const queryStr = params.toString();
  const url = queryStr ? `/api/courses?${queryStr}` : '/api/courses';
  return apiFetch(url) as Promise<Course[]>;
}

export async function getCourseDetail(courseId: string): Promise<Course> {
  return apiFetch(`/api/courses/${courseId}`) as Promise<Course>;
}

export async function enrollInCourse(courseId: string): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/api/courses/${courseId}/enroll`, { method: 'POST' }) as Promise<{ success: boolean; message: string }>;
}

export async function updateCourseProgress(
  courseId: string, 
  lectureId: string, 
  timeSpent?: number
): Promise<any> {
  return apiFetch(`/api/courses/${courseId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ lectureId, timeSpent })
  });
}

export async function getEnrolledCourses(): Promise<Course[]> {
  return apiFetch('/api/courses/my/enrolled') as Promise<Course[]>;
}

// ============ Attendance APIs ============

export async function getMyAttendance(filters?: { 
  month?: number; 
  year?: number 
}): Promise<AttendanceResponse> {
  const params = new URLSearchParams();
  if (filters?.month) params.append('month', String(filters.month));
  if (filters?.year) params.append('year', String(filters.year));
  
  const queryStr = params.toString();
  const url = queryStr ? `/api/attendance/my?${queryStr}` : '/api/attendance/my';
  return apiFetch(url) as Promise<AttendanceResponse>;
}

export async function getAttendanceSummary(): Promise<AttendanceSummary> {
  return apiFetch('/api/attendance/summary') as Promise<AttendanceSummary>;
}

// ============ Materials APIs ============

export async function getMaterials(filters?: {
  subject?: string;
  classLevel?: string;
  chapter?: string;
  type?: string;
}): Promise<Material[]> {
  const params = new URLSearchParams();
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.classLevel) params.append('classLevel', filters.classLevel);
  if (filters?.chapter) params.append('chapter', filters.chapter);
  if (filters?.type) params.append('type', filters.type);
  
  const queryStr = params.toString();
  const url = queryStr ? `/api/materials?${queryStr}` : '/api/materials';
  return apiFetch(url) as Promise<Material[]>;
}

export async function trackMaterialDownload(materialId: string): Promise<{ success: boolean; downloadUrl: string }> {
  return apiFetch(`/api/materials/${materialId}/download`, { method: 'POST' }) as Promise<{ success: boolean; downloadUrl: string }>;
}

// ============ Announcements APIs ============

export async function getAnnouncements(limit?: number): Promise<Announcement[]> {
  const url = limit ? `/api/announcements?limit=${limit}` : '/api/announcements';
  return apiFetch(url) as Promise<Announcement[]>;
}

// ============ Schedule APIs ============

export async function getSchedule(filters?: {
  startDate?: string;
  endDate?: string;
  type?: string;
}): Promise<ScheduleItem[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.type) params.append('type', filters.type);
  
  const queryStr = params.toString();
  const url = queryStr ? `/api/schedule?${queryStr}` : '/api/schedule';
  return apiFetch(url) as Promise<ScheduleItem[]>;
}

export async function getTodaySchedule(): Promise<ScheduleItem[]> {
  return apiFetch('/api/schedule/today') as Promise<ScheduleItem[]>;
}

export async function getUpcomingSchedule(limit?: number): Promise<ScheduleItem[]> {
  const url = limit ? `/api/schedule/upcoming?limit=${limit}` : '/api/schedule/upcoming';
  return apiFetch(url) as Promise<ScheduleItem[]>;
}

// ============ Leaderboard APIs ============

export async function getLeaderboard(filters?: {
  classLevel?: string;
  batch?: string;
  limit?: number;
}): Promise<LeaderboardResponse> {
  const params = new URLSearchParams();
  if (filters?.classLevel) params.append('classLevel', filters.classLevel);
  if (filters?.batch) params.append('batch', filters.batch);
  if (filters?.limit) params.append('limit', String(filters.limit));
  
  const queryStr = params.toString();
  const url = queryStr ? `/api/leaderboard?${queryStr}` : '/api/leaderboard';
  return apiFetch(url) as Promise<LeaderboardResponse>;
}

// ============ Bookmark APIs ============

export interface Bookmark {
  _id: string;
  studentId: string;
  courseId: any;
  lectureId: string;
  lectureTitle: string;
  timestamp: number;
  note?: string;
  createdAt: string;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return apiFetch('/api/bookmarks') as Promise<Bookmark[]>;
}

export async function getCourseBookmarks(courseId: string): Promise<Bookmark[]> {
  return apiFetch(`/api/bookmarks/course/${courseId}`) as Promise<Bookmark[]>;
}

export async function addBookmark(data: {
  courseId: string;
  lectureId: string;
  lectureTitle: string;
  timestamp?: number;
  note?: string;
}): Promise<Bookmark> {
  return apiFetch('/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify(data)
  }) as Promise<Bookmark>;
}

export async function removeBookmark(bookmarkId: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE' }) as Promise<{ success: boolean }>;
}

export async function removeBookmarkByLecture(courseId: string, lectureId: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/bookmarks/lecture/${courseId}/${lectureId}`, { method: 'DELETE' }) as Promise<{ success: boolean }>;
}

// ============ Video Position APIs ============

export async function saveVideoPosition(courseId: string, lectureId: string, position: number): Promise<{ success: boolean }> {
  return apiFetch(`/api/courses/${courseId}/lectures/${lectureId}/position`, {
    method: 'POST',
    body: JSON.stringify({ position })
  }) as Promise<{ success: boolean }>;
}

export async function getVideoPosition(courseId: string, lectureId: string): Promise<{ position: number; lectureId: string }> {
  return apiFetch(`/api/courses/${courseId}/lectures/${lectureId}/position`) as Promise<{ position: number; lectureId: string }>;
}

// ============ Auth & Password Reset APIs ============

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; token?: string }> {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }) as Promise<{ success: boolean; message: string; token?: string }>;
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword })
  }) as Promise<{ success: boolean; message: string }>;
}

export async function completeWelcomeTutorial(): Promise<{ success: boolean }> {
  return apiFetch('/api/auth/welcome-tutorial/complete', { method: 'POST' }) as Promise<{ success: boolean }>;
}

