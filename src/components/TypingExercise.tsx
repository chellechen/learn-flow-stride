
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, ChevronRight } from 'lucide-react';
import { LessonData, TypingStats } from '@/types/lesson';

interface TypingExerciseProps {
  lessonData: LessonData;
  onComplete: (stats: TypingStats) => void;
}

const TypingExercise = ({ lessonData, onComplete }: TypingExerciseProps) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentPage = lessonData.pages[lessonData.currentPage];
  const currentChunk = currentPage?.chunks[currentChunkIndex];
  const currentText = currentChunk?.text || '';
  const totalChunks = currentPage?.chunks.length || 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentChunkIndex]);

  useEffect(() => {
    if (typedText.length > 0 && !startTime) {
      setStartTime(Date.now());
    }

    if (typedText.length > 0 && startTime) {
      const timeElapsed = (Date.now() - startTime) / 60000; // minutes
      const wordsTyped = typedText.trim().split(' ').length;
      const calculatedWpm = Math.round(wordsTyped / timeElapsed) || 0;
      setWpm(calculatedWpm);

      // Calculate accuracy
      let correct = 0;
      for (let i = 0; i < Math.min(typedText.length, currentText.length); i++) {
        if (typedText[i] === currentText[i]) {
          correct++;
        }
      }
      const calculatedAccuracy = typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 100;
      setAccuracy(calculatedAccuracy);
      setCorrectChars(correct);
      setTotalChars(typedText.length);
    }
  }, [typedText, startTime, currentText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Prevent typing beyond the target text
    if (value.length <= currentText.length) {
      setTypedText(value);
    }

    // Check if chunk is completed
    if (value === currentText) {
      const chunkEndTime = Date.now();
      const chunkTimeSpent = startTime ? (chunkEndTime - startTime) / 1000 : 0;
      setTotalTimeSpent(prev => prev + chunkTimeSpent);
      
      setTimeout(() => {
        if (currentChunkIndex < totalChunks - 1) {
          setCurrentChunkIndex(prev => prev + 1);
          setTypedText('');
          setStartTime(null);
        } else {
          setIsCompleted(true);
        }
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Auto-advance on Enter when chunk is complete
    if (e.key === 'Enter' && typedText === currentText) {
      e.preventDefault();
      if (currentChunkIndex < totalChunks - 1) {
        setCurrentChunkIndex(prev => prev + 1);
        setTypedText('');
        setStartTime(null);
      } else {
        setIsCompleted(true);
      }
    }
  };

  const getCharacterStatus = (index: number) => {
    if (index >= typedText.length) return 'pending';
    return typedText[index] === currentText[index] ? 'correct' : 'incorrect';
  };

  const progress = ((currentChunkIndex + (typedText.length / currentText.length)) / totalChunks) * 100;

  const handleComplete = () => {
    const finalStats: TypingStats = {
      wpm,
      accuracy,
      timeSpent: totalTimeSpent,
      correctChars,
      totalChars
    };
    onComplete(finalStats);
  };

  if (isCompleted) {
    return (
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Typing Phase Complete! 🎉</CardTitle>
          <CardDescription className="text-green-100">
            Excellent work! Let's move on to test your recall.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">{wpm}</p>
              <p className="text-gray-600 font-medium">Words per minute</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <Target className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-gray-600 font-medium">Accuracy</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Clock className="h-12 w-12 mx-auto mb-3 text-purple-600" />
              <p className="text-3xl font-bold text-purple-600">{Math.round(totalTimeSpent)}s</p>
              <p className="text-gray-600 font-medium">Time spent</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              You typed {totalChars} characters with {correctChars} correct
            </p>
            <Button 
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Continue to Recall Phase
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-gray-800">{lessonData.title}</CardTitle>
            <CardDescription className="text-gray-600">
              Page {currentPage?.pageNumber} • Chunk {currentChunkIndex + 1} of {totalChunks} • {currentChunk?.wordCount} words
            </CardDescription>
          </div>
          <div className="flex space-x-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{wpm}</p>
              <p className="text-gray-600">WPM</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-gray-600">Accuracy</p>
            </div>
          </div>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Reference Text */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="font-semibold mb-4 text-gray-700">Type this text:</h3>
          <div className="text-lg leading-relaxed font-mono">
            {currentText.split('').map((char, index) => (
              <span
                key={index}
                className={`${
                  getCharacterStatus(index) === 'correct'
                    ? 'bg-green-200 text-green-800'
                    : getCharacterStatus(index) === 'incorrect'
                    ? 'bg-red-200 text-red-800'
                    : 'text-gray-600'
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Typing Area */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Your typing:</h3>
          <textarea
            ref={textareaRef}
            value={typedText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl text-lg font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Start typing the text above..."
          />
          <p className="text-sm text-gray-500 mt-2">
            Press Enter to advance when you complete a chunk
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-4 rounded-lg border">
          <span>{typedText.length} / {currentText.length} characters</span>
          <span>{Math.round((typedText.length / currentText.length) * 100)}% complete</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TypingExercise;
