// Types and constants for Create Paper flow
import { getColors } from "@/constants/colors";

export interface Question {
  _id: string;
  text: string;
  type: string;
  options?: { text: string; isCorrect?: boolean }[];
  chapter?: string;
  topic?: string;
  difficulty?: string;
}

export interface Section {
  title: string;
  marksPerQuestion: number;
  instructions?: string;
  questionTypeKey?: string;
  selectedQuestions: Question[];
}

export interface PaperFormData {
  className: string;
  subject: string;
  examTitle: string;
  totalMarks: number;
  duration: string;
  date: string;
  instituteName: string;
  board: string;
  selectedChapters: string[];
  sections: Section[];
}

export const initialFormData: PaperFormData = {
  className: "",
  subject: "",
  examTitle: "",
  totalMarks: 0,
  duration: "",
  date: "",
  instituteName: "",
  board: "",
  selectedChapters: [],
  sections: [],
};

// Configuration
export const CLASSES = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "Computer Science",
  "Accountancy",
  "Business Studies",
  "Economics",
];

export const BOARDS = [
  { id: "CBSE", name: "CBSE", desc: "Central Board", icon: "school" },
  { id: "GSEB", name: "GSEB", desc: "Gujarat Board", icon: "business" },
  { id: "JEE", name: "JEE", desc: "Engineering", icon: "rocket" },
  { id: "NEET", name: "NEET", desc: "Medical", icon: "medkit" },
  { id: "Olympiad", name: "Olympiad", desc: "Competitive", icon: "trophy" },
  { id: "Custom", name: "Custom", desc: "Your Format", icon: "create" },
];

// Blueprint sections matching cbt-exam
export const BLUEPRINT_SECTIONS: Omit<Section, "selectedQuestions">[] = [
  {
    title: "Section A: Objective Type",
    marksPerQuestion: 1,
    questionTypeKey: "objective",
    instructions: "MCQ, Fill in blanks, True/False",
  },
  {
    title: "Section B: Very Short Answer",
    marksPerQuestion: 2,
    questionTypeKey: "very_short",
    instructions: "Answer in 1-2 sentences",
  },
  {
    title: "Section C: Short Answer",
    marksPerQuestion: 3,
    questionTypeKey: "short",
    instructions: "Answer in 50-70 words",
  },
  {
    title: "Section D: Long Answer",
    marksPerQuestion: 5,
    questionTypeKey: "long",
    instructions: "Answer in 100-120 words",
  },
  {
    title: "Section E: Case Study/HOTS",
    marksPerQuestion: 6,
    questionTypeKey: "case_study",
    instructions: "Application based questions",
  },
];

export const STEPS = [
  { id: 1, title: "Basic Info", icon: "document-text" },
  { id: 2, title: "Board", icon: "school" },
  { id: 3, title: "Chapters", icon: "book" },
  { id: 4, title: "Questions", icon: "list" },
  { id: 5, title: "Preview", icon: "eye" },
];

export const STORAGE_KEY = "createPaperFlow_mobile";

// Helper function for question type mapping
export const computeQuestionTypeKey = (q: Question): string => {
  const t = (q.type || "").toLowerCase();
  if (["mcq", "truefalse", "fill", "integer", "assertionreason"].includes(t))
    return "objective";
  if (t === "long") return "long";
  if (["case_study", "case", "case-study"].includes(t)) return "case_study";
  return "short";
};

export type Colors = ReturnType<typeof getColors>;
