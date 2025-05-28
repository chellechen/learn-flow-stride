
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { LessonData, TypingStats } from '@/types/lesson';

interface TypingExerciseProps {
  lessonData: LessonData;
  onComplete: (stats: TypingStats) => void;
}

const TypingExercise = ({ lessonData, onComplete }: TypingExerciseProps) => {
  const [currentChunk, setCurrentChunk] = useState(lessonData.progress.currentChunk);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chunks = lessonData.chunks;
  const currentText = chunks[currentChunk]?.text || '';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentChunk]);

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
      let correctChars = 0;
      for (let i = 0; i < Math.min(typedText.length, currentText.length); i++) {
        if (typedText[i] === currentText[i]) {
          correctChars++;
        }
      }
      const calculatedAccuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
      setAccuracy(calculatedAccuracy);
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
        if (currentChunk < chunks.length - 1) {
          setCurrentChunk(prev => prev + 1);
          setTypedText('');
          setStartTime(null);
        } else {
          setIsCompleted(true);
        }
      }, 500);
    }
  };

  const getCharacterStatus = (index: number) => {
    if (index >= typedText.length) return 'pending';
    return typedText[index] === currentText[index] ? 'correct' : 'incorrect';
  };

  const progress = ((currentChunk + (typedText.length / currentText.length)) / chunks.length) * 100;

  const handleComplete = () => {
    const finalStats: TypingStats = {
      wpm,
      accuracy,
      timeSpent: totalTimeSpent
    };
    onComplete(finalStats);
  };

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">Typing Exercise Completed!</CardTitle>
          <CardDescription>Great job! Let's move on to the recall phase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{wpm}</p>
              <p className="text-sm text-gray-600">WPM</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{Math.round(totalTimeSpent)}s</p>
              <p className="text-sm text-gray-600">Time</p>
            </div>
          </div>
          
          <Button 
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Continue to Recall Phase
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Typing Exercise - {lessonData.title}</CardTitle>
            <CardDescription>
              Chunk {currentChunk + 1} of {chunks.length} - Type the text below
            </CardDescription>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <p className="font-semibold text-blue-600">{wpm}</p>
              <p className="text-gray-600">WPM</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-green-600">{accuracy}%</p>
              <p className="text-gray-600">Accuracy</p>
            </div>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Reference Text */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Reference Text:</h3>
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
          <h3 className="font-semibold mb-2">Type here:</h3>
          <textarea
            ref={textareaRef}
            value={typedText}
            onChange={handleTextChange}
            className="w-full h-32 p-4 border rounded-lg text-lg font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Start typing the text above..."
          />
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>{typedText.length} / {currentText.length} characters</span>
          <span>{Math.round((typedText.length / currentText.length) * 100)}% complete</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TypingExercise;
