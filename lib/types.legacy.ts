// TypeScript types for student features

// ============ Exam Types ============

export interface ExamSchedule {
  startAt?: string;
  endAt?: string;
}

export interface Exam {
  _id: string;
  title: string;
  totalDurationMins?: number;
  schedule?: ExamSchedule;
  startAt?: string;
  endAt?: string;
  classLevel?: string;
  batch?: string;
  subject?: string;
  totalMarks?: number;
}

// ============ Attempt Types ============

export interface Attempt {
  _id: string;
  examId: string;
  userId?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'auto-submitted' | 'graded';
  startedAt?: string;
  submittedAt?: string;
  totalScore?: number;
  maxScore?: number;
  resultPublished?: boolean;
  examTitle?: string;
}

export interface ExamWithAttempt extends Exam {
  attempt?: Attempt;
}

// ============ Question Types ============

export interface QuestionOption {
  _id: string;
  text: string;
  label?: string;
  value?: string;
  isCorrect?: boolean;
}

export interface Question {
  _id: string;
  text: string;
  type: 'mcq' | 'multi_select' | 'true_false' | 'assertion_reason' | 'subjective' | 'integer' | 'fill_blank';
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  assertionText?: string;
  reasonText?: string;
  assertionIsTrue?: boolean;
  reasonIsTrue?: boolean;
  reasonExplainsAssertion?: boolean;
  diagramUrl?: string;
  marks?: number;
  negativeMarks?: number;
}

export interface ExamSection {
  _id: string;
  title: string;
  questionIds: string[];
}

// ============ Attempt Detail Types ============

export interface Answer {
  questionId: string;
  textAnswer?: string;
  chosenOptionId?: string;
  selectedOptionIds?: string[];
  markedForReview?: boolean;
  aiFeedback?: string;
  rubricScore?: number;
  scoreAwarded?: number;
  isCorrect?: boolean;
}

export interface AttemptOrder {
  sectionOrder: string[];
  questionOrderBySection: Record<string, string[]>;
  optionOrderByQuestion?: Record<string, string[]>;
}

export interface AttemptCore extends Attempt {
  answers: Answer[];
  order?: AttemptOrder;
  sectionOrder?: string[];
  questionOrderBySection?: Record<string, string[]>;
  optionOrderByQuestion?: Record<string, string[]>;
}

export interface AttemptDetailResponse {
  attempt: AttemptCore;
  exam: {
    _id: string;
    title: string;
    totalDurationMins?: number;
    schedule?: ExamSchedule;
  };
  sections: ExamSection[];
  questions: Record<string, Question>;
}

// ============ Analytics Types ============

export interface ProgressDataPoint {
  submittedAt?: string;
  totalScore?: number;
  maxScore?: number;
  percent?: number | null;
  examTitle?: string;
}

export interface ProgressData {
  attempts: ProgressDataPoint[];
  totalAttempts?: number;
  averageScore?: number;
  bestScore?: number;
}

// ============ Request/Response Types ============

export interface SaveAnswerRequest {
  questionId: string;
  response: string | number | string[];
}

export interface MarkForReviewRequest {
  questionId: string;
  marked: boolean;
}

export interface AssignedExamsResponse {
  exams: Exam[];
  attempts: Record<string, Attempt>;
}
