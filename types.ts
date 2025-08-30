
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface StudyAids {
  summary: string;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface QuizResult {
  score: number;
  total: number;
  date: string;
}

export interface FilePart {
  mimeType: string;
  data: string;
}

export interface StudyMaterialInput {
  text: string;
  files?: FilePart[];
}

// Updated types for Supabase
export interface User {
  id: string; // Supabase auth user ID (UUID)
  name: string;
  email: string;
}

export interface StudySession {
  id: string; // Postgres ID, converted to string
  title: string;
  date: string; // ISO string from created_at
  studyMaterial: StudyMaterialInput; // For AI tutor context
  studyAids: StudyAids; // The generated summary, quiz, flashcards
  quizResults: QuizResult[]; // All quiz attempts for this session
}