
export interface LessonChunk {
  id: string;
  text: string;
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
  chunks: LessonChunk[];
  questions: QuizQuestion[];
  progress: {
    currentChunk: number;
    typingCompleted: boolean;
    recallCompleted: boolean;
    quizCompleted: boolean;
  };
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  timeSpent: number;
}

export interface RecallStats {
  score: number;
  totalBlanks: number;
}

export interface QuizStats {
  score: number;
  totalQuestions: number;
  percentage: number;
}
