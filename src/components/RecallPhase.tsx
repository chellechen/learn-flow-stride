
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Brain } from 'lucide-react';

interface RecallPhaseProps {
  onComplete: () => void;
}

const RecallPhase = ({ onComplete }: RecallPhaseProps) => {
  const [currentChunk, setCurrentChunk] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const recallChunks = [
    {
      text: "Machine learning is a subset of _______ _______ that enables computers to learn and make decisions from data without being explicitly programmed for every task.",
      blanks: [{ index: 0, answer: "artificial intelligence", position: 30 }],
      original: "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task."
    },
    {
      text: "The fundamental concept behind machine learning involves _______ algorithms on large datasets to identify _______ and relationships within the data.",
      blanks: [
        { index: 0, answer: "training", position: 60 },
        { index: 1, answer: "patterns", position: 110 }
      ],
      original: "The fundamental concept behind machine learning involves training algorithms on large datasets to identify patterns and relationships within the data."
    },
    {
      text: "There are _______ main types of machine learning: supervised learning, _______ learning, and reinforcement learning.",
      blanks: [
        { index: 0, answer: "three", position: 10 },
        { index: 1, answer: "unsupervised", position: 75 }
      ],
      original: "There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning."
    }
  ];

  const currentRecall = recallChunks[currentChunk];

  const handleAnswerChange = (blankIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    currentRecall.blanks.forEach(blank => {
      const userAnswer = answers[blank.index]?.toLowerCase().trim();
      const correctAnswer = blank.answer.toLowerCase();
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(prev => prev + correctCount);
    setShowResults(true);
  };

  const nextChunk = () => {
    if (currentChunk < recallChunks.length - 1) {
      setCurrentChunk(prev => prev + 1);
      setAnswers({});
      setShowResults(false);
    } else {
      onComplete();
    }
  };

  const renderTextWithBlanks = () => {
    const parts = currentRecall.text.split('_______');
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
    const blank = currentRecall.blanks[blankIndex];
    const userAnswer = answers[blankIndex]?.toLowerCase().trim();
    const correctAnswer = blank.answer.toLowerCase();
    return userAnswer === correctAnswer;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <CardTitle>Recall Phase</CardTitle>
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
              {currentRecall.blanks.map((blank, index) => (
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
              <p className="text-gray-700">{currentRecall.original}</p>
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
            Score: {score} / {recallChunks.reduce((total, chunk) => total + chunk.blanks.length, 0)} correct
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecallPhase;
