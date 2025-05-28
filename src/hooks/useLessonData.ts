
import { useState, useCallback } from 'react';
import { LessonData, LessonChunk, QuizQuestion } from '@/types/lesson';

// Simulate content processing - in real app this would call AI APIs
const processFileContent = async (file: File): Promise<{ chunks: LessonChunk[], questions: QuizQuestion[] }> => {
  // Simulate file reading and processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock content based on file name or use default content
  const mockContent = `Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task. The fundamental concept behind machine learning involves training algorithms on large datasets to identify patterns and relationships within the data. There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning, each serving different purposes and applications in various industries and research fields.`;
  
  // Split into chunks (simulate AI chunking)
  const sentences = mockContent.split(/(?<=[.!?])\s+/);
  const chunks: LessonChunk[] = [];
  
  for (let i = 0; i < sentences.length; i++) {
    const chunk: LessonChunk = {
      id: `chunk-${i}`,
      text: sentences[i].trim(),
    };
    
    // Create blanked version for recall (simulate AI blanking)
    if (sentences[i].includes('machine learning')) {
      chunk.blankedText = sentences[i].replace(/machine learning/gi, '_______');
      chunk.blanks = [{ index: 0, answer: 'machine learning', position: sentences[i].toLowerCase().indexOf('machine learning') }];
    } else if (sentences[i].includes('artificial intelligence')) {
      chunk.blankedText = sentences[i].replace(/artificial intelligence/gi, '_______');
      chunk.blanks = [{ index: 0, answer: 'artificial intelligence', position: sentences[i].toLowerCase().indexOf('artificial intelligence') }];
    } else if (sentences[i].includes('algorithms')) {
      chunk.blankedText = sentences[i].replace(/algorithms/gi, '_______');
      chunk.blanks = [{ index: 0, answer: 'algorithms', position: sentences[i].toLowerCase().indexOf('algorithms') }];
    } else {
      // Create simple blanks for other sentences
      const words = sentences[i].split(' ');
      const importantWordIndex = Math.floor(words.length / 2);
      const importantWord = words[importantWordIndex];
      words[importantWordIndex] = '_______';
      chunk.blankedText = words.join(' ');
      chunk.blanks = [{ index: 0, answer: importantWord, position: importantWordIndex }];
    }
    
    chunks.push(chunk);
  }
  
  // Generate quiz questions (simulate AI question generation)
  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What is machine learning according to the text?',
      options: [
        'A type of computer programming language',
        'A subset of artificial intelligence that enables computers to learn from data',
        'A method for building physical robots',
        'A way to store large amounts of data'
      ],
      correct: 1,
      explanation: 'Machine learning is defined as a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.'
    },
    {
      id: 'q2',
      question: 'What does machine learning involve fundamentally?',
      options: [
        'Writing code for every possible scenario',
        'Training algorithms on large datasets to identify patterns',
        'Manually inputting all possible answers',
        'Creating physical machines'
      ],
      correct: 1,
      explanation: 'The fundamental concept behind machine learning involves training algorithms on large datasets to identify patterns and relationships within the data.'
    },
    {
      id: 'q3',
      question: 'How many main types of machine learning are mentioned?',
      options: [
        'Two',
        'Three',
        'Four',
        'Five'
      ],
      correct: 1,
      explanation: 'The text mentions three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.'
    }
  ];
  
  return { chunks, questions };
};

export const useLessonData = () => {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const { chunks, questions } = await processFileContent(file);
      
      const newLesson: LessonData = {
        id: `lesson-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        chunks,
        questions,
        progress: {
          currentChunk: 0,
          typingCompleted: false,
          recallCompleted: false,
          quizCompleted: false,
        }
      };
      
      setLessonData(newLesson);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const updateProgress = useCallback((updates: Partial<LessonData['progress']>) => {
    setLessonData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          ...updates
        }
      };
    });
  }, []);

  const resetLesson = useCallback(() => {
    setLessonData(null);
  }, []);

  return {
    lessonData,
    isProcessing,
    processFile,
    updateProgress,
    resetLesson
  };
};
