/**
 * Core TypeScript interfaces for the Abhigyan Gurukul App
 * Centralized type definitions for consistent typing across the app
 */

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  classLevel?: string;
  batch?: string;
  groups?: string[];
  firebaseUid?: string;
  welcomeTutorialCompleted?: boolean;
  targetExams?: string[];
  studyGoals?: string[];
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: UserRole;
  classLevel?: string;
  batch?: string;
}

// =============================================================================
// EXAM TYPES
// =============================================================================

export interface ExamOption {
  _id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  _id: string;
  text: string;
  type:
    | "mcq"
    | "mcq-single"
    | "mcq-multi"
    | "text"
    | "essay"
    | "numerical"
    | "integer"
    | "true_false"
    | "true-false"
    | "truefalse"
    | "multi_select"
    | "assertion_reason"
    | "assertionreason"
    | "short"
    | "long"
    | "subjective";
  options?: ExamOption[];
  correctAnswer?: string;
  marks?: number;
  hint?: string;
  solution?: string;
  explanation?: string;
  imageUrl?: string;
  diagramUrl?: string;
  subject?: string;
  topic?: string;
  assertionText?: string;
  reasonText?: string;
  difficulty?: "easy" | "medium" | "hard";
  createdAt?: string;
}

export interface ExamSection {
  _id?: string;
  title: string;
  questionIds: string[];
  questions?: Question[];
  sectionDurationMins?: number;
  instructions?: string;
}

export interface Exam {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  isPublished: boolean;
  totalDurationMins?: number;
  sections?: ExamSection[];
  questions?: Question[];
  classLevel?: string;
  batch?: string;
  subject?: string;
  totalMarks?: number;
  passingMarks?: number;
  negativeMarking?: boolean;
  negativeMarkValue?: number;
  shuffleQuestions?: boolean;
  showResultImmediately?: boolean;
  allowReview?: boolean;
  maxAttempts?: number;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  // Dynamic/Populated fields
  schedule?: {
    startAt?: string;
    endAt?: string;
  };
  startAt?: string;
  endAt?: string;
}

export interface ProgressDataPoint {
  id: string;
  label: string;
  value: number;
  percent: number;
  date: string;
}

export interface ExamFilters {
  status?: "all" | "published" | "draft";
  classLevel?: string;
  batch?: string;
  subject?: string;
  search?: string;
}

export interface CreateExamData {
  title: string;
  description?: string;
  totalDurationMins?: number;
  sections?: ExamSection[];
  isPublished?: boolean;
  classLevel?: string;
  batch?: string;
}

// =============================================================================
// ATTEMPT TYPES
// =============================================================================

export interface Answer {
  questionId: string;
  chosenOptionId?: string;
  textAnswer?: string;
  scoreAwarded?: number;
  isCorrect?: boolean;
  timeTaken?: number;
  selectedOptionIds?: string[];
  markedForReview?: boolean;
}

export type AttemptStatus =
  | "in-progress"
  | "submitted"
  | "reviewed"
  | "published"
  | "auto-submitted";

export interface Attempt {
  _id: string;
  examId: string | Exam;
  userId: string | User;
  answers: Answer[];
  status: AttemptStatus;
  startedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  resultPublished?: boolean;
  reviewerNotes?: string;
  createdAt?: string;
}

export interface PendingReview extends Attempt {
  examId: Exam;
  userId: User;
}

export interface ReviewData {
  attempt: Attempt;
  exam: Exam;
  sections: ExamSection[];
  questions: Record<string, Question>;
}

export interface AttemptDetailResponse {
  attempt: Attempt;
  exam: Exam;
  sections: ExamSection[];
  questions: Record<string, Question>;
}

// =============================================================================
// STUDENT TYPES
// =============================================================================

export interface Student extends User {
  role: "student";
  classLevel: string;
  batch: string;
  performance?: StudentPerformance;
}

export interface StudentPerformance {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  highestScore: number;
  recentAttempts?: Attempt[];
}

export interface StudentFilters {
  classLevel?: string;
  batch?: string;
  search?: string;
}

// =============================================================================
// BATCH TYPES
// =============================================================================

export interface Batch {
  _id: string;
  name: string;
  description?: string;
  classLevel?: string;
  studentCount?: number;
  teacherId?: string;
  createdAt?: string;
}

// =============================================================================
// ANNOUNCEMENT TYPES
// =============================================================================

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "info" | "important" | "urgent";
  targetGroups?: string[];
  targetClasses?: string[];
  targetBatches?: string[];
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
  expiresAt?: string;
}

// =============================================================================
// DOUBT TYPES
// =============================================================================

export type DoubtStatus = "pending" | "in-progress" | "resolved";

export interface Attachment {
  _id?: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  storagePath: string;
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  senderRole: "student" | "teacher" | "admin";
  message: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface Doubt {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    batch?: string;
  };
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
  subject: string;
  topic?: string;
  chapter?: string;
  question: string;
  images?: string[];
  status: DoubtStatus;
  reply?: string;
  replyImages?: string[];
  repliedAt?: string;
  batch?: string;
  classLevel?: string;
  priority: "low" | "normal" | "high";
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface DashboardStats {
  totalQuestions: number;
  totalExams: number;
  pendingReviews: number;
  totalPapers: number;
  totalStudents?: number;
  publishedExams?: number;
  draftExams?: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "exam_created"
    | "exam_published"
    | "review_completed"
    | "student_added"
    | "announcement_sent";
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// =============================================================================
// UI TYPES
// =============================================================================

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched?: Date;
}

export interface ToastConfig {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface ModalConfig {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "alert" | "confirm" | "custom";
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface TabBarItem {
  name: string;
  title: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
}

export interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  color?: string;
  badge?: number;
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  fontSize: "small" | "medium" | "large";
}

export interface AppConfig {
  apiBaseUrl: string;
  version: string;
  buildNumber: string;
  environment: "development" | "staging" | "production";
}
