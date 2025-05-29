
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Brain, ChevronRight } from 'lucide-react';
import { LessonData, RecallStats } from '@/types/lesson';

interface RecallPhaseProps {
  lessonData: LessonData;
  onComplete: (stats: RecallStats) => void;
}

const RecallPhase = ({ lessonData, onComplete }: RecallPhaseProps) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const currentPage = lessonData.pages[lessonData.currentPage];
  const recallChunks = currentPage?.chunks.filter(chunk => chunk.blanks && chunk.blanks.length > 0) || [];
  const currentRecall = recallChunks[currentChunkIndex];
  const totalBlanks = recallChunks.reduce((total, chunk) => total + (chunk.blanks?.length || 0), 0);

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
    if (currentChunkIndex < recallChunks.length - 1) {
      setCurrentChunkIndex(prev => prev + 1);
      setAnswers({});
      setShowResults(false);
    } else {
      const timeSpent = (Date.now() - startTime) / 1000;
      setTotalTimeSpent(timeSpent);
      
      const accuracy = totalBlanks > 0 ? Math.round((totalScore / totalBlanks) * 100) : 0;
      const finalStats: RecallStats = {
        score: totalScore,
        totalBlanks,
        accuracy,
        timeSpent
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
                className="inline-block w-40 mx-2 text-center border-2 border-dashed border-blue-300 focus:border-blue-500"
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
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>No Recall Content Available</CardTitle>
          <CardDescription>
            This lesson doesn't have recall exercises. Let's continue to the quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onComplete({ score: 0, totalBlanks: 0, accuracy: 0, timeSpent: 0 })}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Continue to Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-800">Recall Phase - {lessonData.title}</CardTitle>
            <CardDescription className="text-gray-600">
              Page {currentPage?.pageNumber} • Chunk {currentChunkIndex + 1} of {recallChunks.length} • Test your memory
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
          <h3 className="font-semibold mb-6 text-gray-800 text-lg">Fill in the missing words:</h3>
          {renderTextWithBlanks()}
        </div>

        {showResults && (
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <h3 className="font-semibold mb-4 text-gray-800">Results for this chunk:</h3>
            <div className="space-y-4">
              {currentRecall.blanks?.map((blank, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                  {getBlankResult(index) ? (
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className="font-medium">
                      Your answer: "{answers[index] || 'No answer'}"
                    </span>
                    {!getBlankResult(index) && (
                      <span className="text-gray-600 ml-4">
                        (Correct: "{blank.answer}")
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-800">Complete Text:</h4>
              <p className="text-gray-700 leading-relaxed">{currentRecall.text}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {!showResults ? (
            <Button 
              onClick={checkAnswers}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              disabled={Object.keys(answers).length === 0}
            >
              Check Answers
            </Button>
          ) : (
            <Button 
              onClick={nextChunk}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {currentChunkIndex < recallChunks.length - 1 ? 'Next Chunk' : 'Continue to Quiz'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{totalScore}/{totalBlanks}</div>
            <div className="text-sm text-gray-600">Correct answers</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecallPhase;
