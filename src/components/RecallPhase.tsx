
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Brain } from 'lucide-react';
import { LessonData, RecallStats } from '@/types/lesson';

interface RecallPhaseProps {
  lessonData: LessonData;
  onComplete: (stats: RecallStats) => void;
}

const RecallPhase = ({ lessonData, onComplete }: RecallPhaseProps) => {
  const [currentChunk, setCurrentChunk] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // Filter chunks that have blanks
  const recallChunks = lessonData.chunks.filter(chunk => chunk.blanks && chunk.blanks.length > 0);
  const currentRecall = recallChunks[currentChunk];

  const handleAnswerChange = (blankIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    if (currentRecall?.blanks) {
      currentRecall.blanks.forEach(blank => {
        const userAnswer = answers[blank.index]?.toLowerCase().trim();
        const correctAnswer = blank.answer.toLowerCase();
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      });
    }
    
    setTotalScore(prev => prev + correctCount);
    setShowResults(true);
  };

  const nextChunk = () => {
    if (currentChunk < recallChunks.length - 1) {
      setCurrentChunk(prev => prev + 1);
      setAnswers({});
      setShowResults(false);
    } else {
      const totalBlanks = recallChunks.reduce((total, chunk) => 
        total + (chunk.blanks?.length || 0), 0
      );
      const finalStats: RecallStats = {
        score: totalScore,
        totalBlanks
      };
      onComplete(finalStats);
    }
  };

  const renderTextWithBlanks = () => {
    if (!currentRecall?.blankedText) return null;
    
    const parts = currentRecall.blankedText.split('_______');
    return (
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <Input
                className="inline-block w-32 mx-1 text-center"
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                disabled={showResults}
                placeholder="?"
              />
            )}
          </span>
        ))}
      </div>
    );
  };

  const getBlankResult = (blankIndex: number) => {
    const blank = currentRecall?.blanks?.[blankIndex];
    if (!blank) return false;
    
    const userAnswer = answers[blankIndex]?.toLowerCase().trim();
    const correctAnswer = blank.answer.toLowerCase();
    return userAnswer === correctAnswer;
  };

  if (!currentRecall) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>No Recall Content Available</CardTitle>
          <CardDescription>
            This lesson doesn't have recall exercises. Let's continue to the quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onComplete({ score: 0, totalBlanks: 0 })}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Continue to Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <CardTitle>Recall Phase - {lessonData.title}</CardTitle>
            <CardDescription>
              Fill in the blanks - Chunk {currentChunk + 1} of {recallChunks.length}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-4">Fill in the missing words:</h3>
          {renderTextWithBlanks()}
        </div>

        {showResults && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Results:</h3>
            <div className="space-y-3">
              {currentRecall.blanks?.map((blank, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {getBlankResult(index) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    Your answer: "{answers[index] || 'No answer'}"
                  </span>
                  {!getBlankResult(index) && (
                    <span className="text-gray-600">
                      (Correct: "{blank.answer}")
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-white rounded border">
              <h4 className="font-semibold mb-2">Complete Text:</h4>
              <p className="text-gray-700">{currentRecall.text}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {!showResults ? (
            <Button 
              onClick={checkAnswers}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              disabled={Object.keys(answers).length === 0}
            >
              Check Answers
            </Button>
          ) : (
            <Button 
              onClick={nextChunk}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {currentChunk < recallChunks.length - 1 ? 'Next Chunk' : 'Continue to Quiz'}
            </Button>
          )}
          
          <div className="text-sm text-gray-600 flex items-center">
            Score: {totalScore} / {recallChunks.reduce((total, chunk) => total + (chunk.blanks?.length || 0), 0)} correct
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecallPhase;
