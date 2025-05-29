
import { useState, useCallback } from 'react';
import { LessonData, LessonChunk, QuizQuestion, LessonPage } from '@/types/lesson';

// Smart chunking function that respects 16-20 word limit and sentence boundaries
const createSmartChunks = (text: string, targetWordCount: number = 18): LessonChunk[] => {
  // Split into sentences while preserving punctuation
  const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
  const chunks: LessonChunk[] = [];
  let currentChunk = '';
  let chunkId = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).length;
    const currentChunkWords = currentChunk ? currentChunk.trim().split(/\s+/).length : 0;
    
    // If adding this sentence would exceed our target, finalize current chunk
    if (currentChunk && (currentChunkWords + sentenceWords) > targetWordCount) {
      chunks.push({
        id: `chunk-${chunkId++}`,
        text: currentChunk.trim(),
        wordCount: currentChunkWords
      });
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add the final chunk if it exists
  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk-${chunkId}`,
      text: currentChunk.trim(),
      wordCount: currentChunk.trim().split(/\s+/).length
    });
  }

  return chunks;
};

// Create blanks for recall phase (3-6 key terms per chunk)
const createRecallBlanks = (chunk: LessonChunk): LessonChunk => {
  const words = chunk.text.split(' ');
  const chunkLength = words.length;
  
  // Determine number of blanks (3-6 based on chunk size)
  const numBlanks = Math.min(6, Math.max(3, Math.floor(chunkLength / 4)));
  
  // Select important words (avoid articles, prepositions, etc.)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
  
  const importantWords = words.map((word, index) => ({
    word: word.replace(/[^\w]/g, '').toLowerCase(),
    originalWord: word,
    index
  })).filter(item => 
    item.word.length > 3 && 
    !stopWords.has(item.word) &&
    /^[a-zA-Z]+$/.test(item.word)
  );

  // Select random important words for blanking
  const selectedIndices = new Set<number>();
  while (selectedIndices.size < Math.min(numBlanks, importantWords.length)) {
    const randomIndex = Math.floor(Math.random() * importantWords.length);
    selectedIndices.add(importantWords[randomIndex].index);
  }

  // Create blanked text
  const blankedWords = words.map((word, index) => 
    selectedIndices.has(index) ? '_______' : word
  );

  const blanks = Array.from(selectedIndices).map((index, blankIndex) => ({
    index: blankIndex,
    answer: words[index].replace(/[^\w]/g, ''),
    position: index
  }));

  return {
    ...chunk,
    blankedText: blankedWords.join(' '),
    blanks
  };
};

// Generate quiz questions (mock implementation - in real app would use Gemini API)
const generateQuizQuestions = (pageText: string, pageNumber: number): QuizQuestion[] => {
  // This is a simplified version - real implementation would use Gemini API
  const questions: QuizQuestion[] = [];
  
  // Extract key concepts for questions
  const sentences = pageText.match(/[^\.!?]+[\.!?]+/g) || [];
  const questionCount = Math.min(5, Math.max(3, Math.floor(sentences.length / 2)));

  for (let i = 0; i < questionCount; i++) {
    const sentence = sentences[i % sentences.length];
    if (sentence) {
      questions.push({
        id: `q${pageNumber}-${i}`,
        question: `According to the text, what does the following relate to: "${sentence.trim().substring(0, 50)}..."?`,
        options: [
          'Key concept from the text',
          'Supporting detail',
          'Example or illustration',
          'Background information'
        ],
        correct: 0,
        explanation: 'This question tests your understanding of the main concepts presented in this section.'
      });
    }
  }

  return questions;
};

export const useLessonProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const processFileToLesson = useCallback(async (file: File, chunkSize: number = 18): Promise<LessonData> => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate file reading
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress(20);

      // Mock content extraction (in real app would parse PDF/DOCX)
      const mockContent = `Artificial intelligence represents one of the most significant technological advances of our time. Machine learning algorithms enable computers to learn from data without explicit programming. Deep learning networks can process complex patterns in large datasets. Natural language processing allows computers to understand human language. Computer vision systems can interpret and analyze visual information. These technologies are transforming industries across the globe.

The human brain processes information through interconnected neural networks. Memory formation involves strengthening synaptic connections between neurons. Active recall is a powerful learning technique that enhances retention. Spaced repetition helps move information from short-term to long-term memory. Sleep plays a crucial role in memory consolidation processes. Regular practice and review are essential for skill development.

Effective study strategies include breaking content into manageable chunks. The Pomodoro technique uses focused work sessions with regular breaks. Visual aids and diagrams can enhance understanding of complex concepts. Teaching others is an excellent way to reinforce your own learning. Self-testing reveals gaps in knowledge and strengthens memory. Consistent daily practice yields better results than cramming.`;

      // Split content into pages (simulate PDF pages)
      const pages = mockContent.split('\n\n');
      setProcessingProgress(40);

      // Process each page
      const processedPages: LessonPage[] = [];
      
      for (let i = 0; i < pages.length; i++) {
        const pageText = pages[i].trim();
        if (!pageText) continue;

        // Create chunks for this page
        const chunks = createSmartChunks(pageText, chunkSize);
        setProcessingProgress(40 + (i / pages.length) * 40);

        // Add recall blanks to chunks
        const chunksWithBlanks = chunks.map(createRecallBlanks);

        // Generate quiz questions for this page
        const questions = generateQuizQuestions(pageText, i + 1);

        processedPages.push({
          id: `page-${i}`,
          pageNumber: i + 1,
          chunks: chunksWithBlanks,
          questions,
          completed: false
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setProcessingProgress(90);

      const lessonData: LessonData = {
        id: `lesson-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        totalPages: processedPages.length,
        currentPage: 0,
        pages: processedPages,
        progress: {
          currentChunk: 0,
          currentPage: 0,
          typingCompleted: false,
          recallCompleted: false,
          quizCompleted: false,
          totalPoints: 0,
          streakDays: 0,
          lastStudyDate: new Date().toISOString()
        }
      };

      setProcessingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      return lessonData;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processFileToLesson,
    isProcessing,
    processingProgress
  };
};
