// Enhanced Student API service functions for new features

import { apiFetch } from "./api";

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
  status: "draft" | "published" | "archived";
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
  youtubeVideoId?: string;
  duration?: number;
  order: number;
  youtubeMeta?: {
    durationSec: number;
    thumbnail: string;
    title: string;
    fetchedAt: string;
  };
}

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
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

// Material interface moved to Materials APIs section below

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  target: "all" | "students" | "teachers" | "class" | "batch";
  createdBy?: { _id: string; name: string };
  createdAt: string;
  expiresAt?: string;
}

export interface ScheduleItem {
  _id: string;
  title: string;
  description?: string;
  scheduleType: "regular" | "custom";
  type: "class" | "exam" | "event" | "holiday";
  startTimeSlot: string;
  endTimeSlot: string;
  dayOfWeek?: number;
  date?: string;
  subject: string;
  classLevel?: string;
  batch?: string;
  roomNumber: number;
  teacherName?: string;
  instructor?: { _id: string; name: string };
  status?: "past" | "ongoing" | "upcoming";
}

export interface LiveScheduleResponse {
  currentClass: ScheduleItem | null;
  nextClass: ScheduleItem | null;
  todaySchedule: ScheduleItem[];
  currentTime: string;
  dayOfWeek: number;
  currentSlot: string | null;
  nextSlot: string | null;
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
  batch?: string;
}): Promise<Course[]> {
  const params = new URLSearchParams();
  if (filters?.classLevel) params.append("classLevel", filters.classLevel);
  if (filters?.subject) params.append("subject", filters.subject);
  if (filters?.batch) params.append("batch", filters.batch);

  const queryStr = params.toString();
  const url = queryStr ? `/api/courses?${queryStr}` : "/api/courses";
  return apiFetch(url) as Promise<Course[]>;
}

export async function getCourseDetail(courseId: string): Promise<Course> {
  return apiFetch(`/api/courses/${courseId}`) as Promise<Course>;
}

export async function enrollInCourse(
  courseId: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/api/courses/${courseId}/enroll`, {
    method: "POST",
  }) as Promise<{ success: boolean; message: string }>;
}

export async function updateCourseProgress(
  courseId: string,
  lectureId: string,
  timeSpent?: number,
): Promise<any> {
  return apiFetch(`/api/courses/${courseId}/progress`, {
    method: "POST",
    body: JSON.stringify({ lectureId, timeSpent }),
  });
}

export async function getEnrolledCourses(): Promise<Course[]> {
  return apiFetch("/api/courses/my/enrolled") as Promise<Course[]>;
}

// ============ Attendance APIs ============

export async function getMyAttendance(filters?: {
  month?: number;
  year?: number;
}): Promise<AttendanceResponse> {
  const params = new URLSearchParams();
  if (filters?.month) params.append("month", String(filters.month));
  if (filters?.year) params.append("year", String(filters.year));

  const queryStr = params.toString();
  const url = queryStr
    ? `/api/attendance/my?${queryStr}`
    : "/api/attendance/my";
  return apiFetch(url) as Promise<AttendanceResponse>;
}

export async function getAttendanceSummary(): Promise<AttendanceSummary> {
  return apiFetch("/api/attendance/summary") as Promise<AttendanceSummary>;
}

// ============ Materials APIs ============

export interface Material {
  _id: string;
  title: string;
  description?: string;
  type: "pdf" | "video" | "document" | "link" | "image" | "other";
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  subject: string;
  classLevel: string;
  chapter?: string;
  uploadedBy?: { _id: string; name: string };
  downloadCount: number;
  isPublished: boolean;
  version?: number;
  assignmentType?: "all" | "class" | "batch" | "students";
  assignedClasses?: string[];
  assignedBatches?: string[];
  createdAt: string;
  updatedAt?: string;
}

export async function getMaterials(filters?: {
  subject?: string;
  classLevel?: string;
  chapter?: string;
  type?: string;
}): Promise<Material[]> {
  const params = new URLSearchParams();
  if (filters?.subject) params.append("subject", filters.subject);
  if (filters?.classLevel) params.append("classLevel", filters.classLevel);
  if (filters?.chapter) params.append("chapter", filters.chapter);
  if (filters?.type) params.append("type", filters.type);

  const queryStr = params.toString();
  const url = queryStr ? `/api/materials?${queryStr}` : "/api/materials";
  return apiFetch(url) as Promise<Material[]>;
}

export async function getMaterialDetail(materialId: string): Promise<Material> {
  return apiFetch(`/api/materials/${materialId}`) as Promise<Material>;
}

export async function trackMaterialDownload(
  materialId: string,
): Promise<{ success: boolean; downloadUrl: string }> {
  return apiFetch(`/api/materials/${materialId}/download`, {
    method: "POST",
  }) as Promise<{ success: boolean; downloadUrl: string }>;
}

export async function deleteMaterial(
  materialId: string,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/materials/${materialId}`, {
    method: "DELETE",
  }) as Promise<{ success: boolean }>;
}

// ============ Announcements APIs ============

export async function getAnnouncements(
  limit?: number,
): Promise<Announcement[]> {
  const url = limit
    ? `/api/announcements?limit=${limit}`
    : "/api/announcements";
  return apiFetch(url) as Promise<Announcement[]>;
}

// ============ Schedule APIs ============

export async function getSchedule(filters?: {
  startDate?: string;
  endDate?: string;
  type?: string;
}): Promise<ScheduleItem[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.type) params.append("type", filters.type);

  const queryStr = params.toString();
  const url = queryStr ? `/api/schedule?${queryStr}` : "/api/schedule";
  return apiFetch(url) as Promise<ScheduleItem[]>;
}

export async function getDaySchedule(date?: string): Promise<ScheduleItem[]> {
  const url = date
    ? `/api/schedule/day-view?date=${date}`
    : "/api/schedule/day-view";
  return apiFetch(url) as Promise<ScheduleItem[]>;
}

export async function getLiveSchedule(): Promise<LiveScheduleResponse> {
  return apiFetch("/api/schedule/live") as Promise<LiveScheduleResponse>;
}

export async function getUpcomingSchedule(
  limit?: number,
): Promise<ScheduleItem[]> {
  const url = limit
    ? `/api/schedule/upcoming?limit=${limit}`
    : "/api/schedule/upcoming";
  return apiFetch(url) as Promise<ScheduleItem[]>;
}

export async function getInstituteSchedule(
  date?: string,
): Promise<ScheduleItem[]> {
  const url = date
    ? `/api/schedule/institute-view?date=${date}`
    : `/api/schedule/institute-view`;
  return apiFetch(url) as Promise<ScheduleItem[]>;
}

// ============ Leaderboard APIs ============

export async function getLeaderboard(filters?: {
  classLevel?: string;
  batch?: string;
  limit?: number;
  mode?: "online" | "offline";
}): Promise<LeaderboardResponse> {
  const params = new URLSearchParams();
  if (filters?.classLevel) params.append("classLevel", filters.classLevel);
  if (filters?.batch) params.append("batch", filters.batch);
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.mode) params.append("mode", filters.mode);

  const queryStr = params.toString();
  const url = queryStr ? `/api/leaderboard?${queryStr}` : "/api/leaderboard";
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
  return apiFetch("/api/bookmarks") as Promise<Bookmark[]>;
}

export async function getCourseBookmarks(
  courseId: string,
): Promise<Bookmark[]> {
  return apiFetch(`/api/bookmarks/course/${courseId}`) as Promise<Bookmark[]>;
}

export async function addBookmark(data: {
  courseId: string;
  lectureId: string;
  lectureTitle: string;
  timestamp?: number;
  note?: string;
}): Promise<Bookmark> {
  return apiFetch("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Bookmark>;
}

export async function removeBookmark(
  bookmarkId: string,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  }) as Promise<{ success: boolean }>;
}

export async function removeBookmarkByLecture(
  courseId: string,
  lectureId: string,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/bookmarks/lecture/${courseId}/${lectureId}`, {
    method: "DELETE",
  }) as Promise<{ success: boolean }>;
}

// ============ Video Position APIs ============

export async function saveVideoPosition(
  courseId: string,
  lectureId: string,
  position: number,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/courses/${courseId}/lectures/${lectureId}/position`, {
    method: "POST",
    body: JSON.stringify({ position }),
  }) as Promise<{ success: boolean }>;
}

export async function getVideoPosition(
  courseId: string,
  lectureId: string,
): Promise<{ position: number; lectureId: string }> {
  return apiFetch(
    `/api/courses/${courseId}/lectures/${lectureId}/position`,
  ) as Promise<{ position: number; lectureId: string }>;
}

// ============ Auth & Password Reset APIs ============

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; message: string; token?: string }> {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  }) as Promise<{ success: boolean; message: string; token?: string }>;
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, token, newPassword }),
  }) as Promise<{ success: boolean; message: string }>;
}

export async function completeWelcomeTutorial(): Promise<{ success: boolean }> {
  return apiFetch("/api/auth/welcome-tutorial/complete", {
    method: "POST",
  }) as Promise<{ success: boolean }>;
}

// ============ Homework Types ============

export type AssignmentType = "all" | "class" | "batch" | "students";
export type HomeworkStatus = "draft" | "published" | "closed";
export type ProgressStatus =
  | "not_started"
  | "viewed"
  | "in_progress"
  | "completed"
  | "submitted";

export interface HomeworkAttachment {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

export interface Homework {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  material?: Material;
  attachments: HomeworkAttachment[];
  assignmentType: AssignmentType;
  assignedClasses: string[];
  assignedBatches: string[];
  assignedStudents: string[];
  dueDate?: string;
  createdBy: { _id: string; name: string };
  subject: string;
  classLevel: string;
  status: HomeworkStatus;
  allowLateSubmission: boolean;
  maxPoints?: number;
  myProgress?: StudentProgress;
  stats?: {
    totalAssigned: number;
    notStarted: number;
    viewed: number;
    inProgress: number;
    completed: number;
    submitted: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  _id?: string;
  student:
    | string
    | {
        _id: string;
        name: string;
        email?: string;
        classLevel?: string;
        batch?: string;
      };
  targetType: "material" | "homework";
  targetId: string;
  status: ProgressStatus;
  viewedAt?: string;
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
  submissionUrl?: string;
  submissionFileName?: string;
  submissionNotes?: string;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface MaterialComment {
  _id: string;
  targetType: "material" | "homework";
  targetId: string;
  author: { _id: string; name: string; role: string; profileImage?: string };
  content: string;
  parentComment?: { _id: string; content: string; author: { name: string } };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ Homework APIs ============

export async function getHomework(filters?: {
  status?: HomeworkStatus;
  subject?: string;
  classLevel?: string;
  page?: number;
  limit?: number;
}): Promise<{
  homework: Homework[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.subject) params.append("subject", filters.subject);
  if (filters?.classLevel) params.append("classLevel", filters.classLevel);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));

  const queryStr = params.toString();
  const url = queryStr ? `/api/homework?${queryStr}` : "/api/homework";
  return apiFetch(url) as Promise<{
    homework: Homework[];
    total: number;
    page: number;
    limit: number;
  }>;
}

export async function getHomeworkDetail(homeworkId: string): Promise<Homework> {
  return apiFetch(`/api/homework/${homeworkId}`) as Promise<Homework>;
}

export async function createHomework(
  data: Partial<Homework>,
): Promise<Homework> {
  return apiFetch("/api/homework", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Homework>;
}

export async function updateHomework(
  homeworkId: string,
  data: Partial<Homework>,
): Promise<Homework> {
  return apiFetch(`/api/homework/${homeworkId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Homework>;
}

export async function deleteHomework(
  homeworkId: string,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/homework/${homeworkId}`, {
    method: "DELETE",
  }) as Promise<{ success: boolean }>;
}

export async function getHomeworkSubmissions(
  homeworkId: string,
): Promise<StudentProgress[]> {
  return apiFetch(`/api/homework/${homeworkId}/submissions`) as Promise<
    StudentProgress[]
  >;
}

export async function gradeHomework(
  homeworkId: string,
  studentId: string,
  data: { grade: number; feedback?: string },
): Promise<StudentProgress> {
  return apiFetch(`/api/homework/${homeworkId}/grade/${studentId}`, {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<StudentProgress>;
}

// ============ Student Progress APIs ============

export async function markAsViewed(
  targetType: "material" | "homework",
  targetId: string,
): Promise<StudentProgress> {
  return apiFetch("/api/progress/view", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId }),
  }) as Promise<StudentProgress>;
}

export async function markAsCompleted(
  targetType: "material" | "homework",
  targetId: string,
): Promise<StudentProgress> {
  return apiFetch("/api/progress/complete", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId }),
  }) as Promise<StudentProgress>;
}

export async function submitHomework(
  targetId: string,
  data: {
    submissionUrl?: string;
    submissionFileName?: string;
    submissionNotes?: string;
  },
): Promise<StudentProgress> {
  return apiFetch("/api/progress/submit", {
    method: "POST",
    body: JSON.stringify({ targetId, ...data }),
  }) as Promise<StudentProgress>;
}

export async function getMyProgress(
  targetType?: "material" | "homework",
): Promise<StudentProgress[]> {
  const url = targetType
    ? `/api/progress/my?targetType=${targetType}`
    : "/api/progress/my";
  return apiFetch(url) as Promise<StudentProgress[]>;
}

export async function getMaterialProgress(
  materialId: string,
): Promise<{ progress: StudentProgress[]; material: Material }> {
  return apiFetch(`/api/progress/material/${materialId}`) as Promise<{
    progress: StudentProgress[];
    material: Material;
  }>;
}

export async function getHomeworkProgress(
  homeworkId: string,
): Promise<StudentProgress[]> {
  return apiFetch(`/api/progress/homework/${homeworkId}`) as Promise<
    StudentProgress[]
  >;
}

// ============ Comment APIs ============

export async function addComment(data: {
  targetType: "material" | "homework";
  targetId: string;
  content: string;
  parentComment?: string;
}): Promise<MaterialComment> {
  return apiFetch("/api/comments", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<MaterialComment>;
}

export async function getComments(
  targetType: "material" | "homework",
  targetId: string,
): Promise<MaterialComment[]> {
  return apiFetch(`/api/comments/${targetType}/${targetId}`) as Promise<
    MaterialComment[]
  >;
}

export async function deleteComment(
  commentId: string,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  }) as Promise<{ success: boolean }>;
}
