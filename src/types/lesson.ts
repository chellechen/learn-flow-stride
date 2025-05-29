
export interface LessonChunk {
  id: string;
  text: string;
  wordCount: number;
  blankedText?: string;
  blanks?: Array<{
    index: number;
    answer: string;
    position: number;
  }>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LessonData {
  id: string;
  title: string;
  totalPages: number;
  currentPage: number;
  pages: LessonPage[];
  progress: LessonProgress;
}

export interface LessonPage {
  id: string;
  pageNumber: number;
  chunks: LessonChunk[];
  questions: QuizQuestion[];
  completed: boolean;
}

export interface LessonProgress {
  currentChunk: number;
  currentPage: number;
  typingCompleted: boolean;
  recallCompleted: boolean;
  quizCompleted: boolean;
  totalPoints: number;
  streakDays: number;
  lastStudyDate: string;
}

export interface UserStats {
  points: number;
  streak: number;
  longestStreak: number;
  wpm: number;
  accuracy: number;
  lessonsCompleted: number;
  totalStudyTime: number;
  recallAccuracy: number;
  quizSuccessRate: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconType: 'trophy' | 'star' | 'target' | 'flame' | 'crown';
  earned: boolean;
  earnedAt?: string;
  criteria: string;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  timeSpent: number;
  correctChars: number;
  totalChars: number;
}

export interface RecallStats {
  score: number;
  totalBlanks: number;
  accuracy: number;
  timeSpent: number;
}

export interface QuizStats {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  chunkSize: number; // 10-30 words
  fontSize: number; // 16-24px
  autoAdvance: boolean;
}
