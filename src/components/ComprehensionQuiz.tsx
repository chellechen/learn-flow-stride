
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Award, BookOpen } from 'lucide-react';
import { LessonData, QuizStats } from '@/types/lesson';

interface ComprehensionQuizProps {
  lessonData: LessonData;
  onComplete: (stats: QuizStats) => void;
}

const ComprehensionQuiz = ({ lessonData, onComplete }: ComprehensionQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = lessonData.questions;
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const submitAnswer = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
      setShowResults(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (parseInt(answer) === questions[index].correct ? 1 : 0);
    }, 0);
  };

  const getScorePercentage = () => {
    return Math.round((calculateScore() / questions.length) * 100);
  };

  const handleComplete = () => {
    const score = calculateScore();
    const percentage = getScorePercentage();
    const finalStats: QuizStats = {
      score,
      totalQuestions: questions.length,
      percentage
    };
    onComplete(finalStats);
  };

  if (quizCompleted) {
    const score = calculateScore();
    const percentage = getScorePercentage();
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Award className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          <CardDescription>Here are your results for "{lessonData.title}"</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
            <p className="text-lg text-gray-600">
              You scored {score} out of {questions.length} questions correctly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{score}</p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{questions.length - score}</p>
              <p className="text-sm text-gray-600">Incorrect</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">+{percentage}</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  {parseInt(answers[index]) === q.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your answer: {q.options[parseInt(answers[index])]}
                    </p>
                    {parseInt(answers[index]) !== q.correct && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct answer: {q.options[q.correct]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQ) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>No Quiz Questions Available</CardTitle>
          <CardDescription>
            This lesson doesn't have quiz questions. Let's return to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onComplete({ score: 0, totalQuestions: 0, percentage: 0 })}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Comprehension Quiz - {lessonData.title}</CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {questions.length}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
          
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 hover:bg-white rounded transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {showResults && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              {parseInt(selectedAnswer) === currentQ.correct ? (
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mt-1" />
              )}
              <div>
                <p className="font-semibold mb-2">
                  {parseInt(selectedAnswer) === currentQ.correct ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-gray-700">{currentQ.explanation}</p>
                {parseInt(selectedAnswer) !== currentQ.correct && (
                  <p className="text-green-600 mt-2">
                    The correct answer was: {currentQ.options[currentQ.correct]}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {!showResults ? (
            <Button 
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={nextQuestion}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          )}
          
          <div className="text-sm text-gray-600 flex items-center">
            Progress: {currentQuestion + 1} / {questions.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensionQuiz;
