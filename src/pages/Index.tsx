
import { useState } from 'react';
import { Upload, BookOpen, Target, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import TypingExercise from '@/components/TypingExercise';
import RecallPhase from '@/components/RecallPhase';
import ComprehensionQuiz from '@/components/ComprehensionQuiz';
import FileUpload from '@/components/FileUpload';
import { useLessonData } from '@/hooks/useLessonData';
import { TypingStats, RecallStats, QuizStats } from '@/types/lesson';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { lessonData, isProcessing, processFile, updateProgress, resetLesson } = useLessonData();
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [userStats, setUserStats] = useState({
    points: 1247,
    streak: 7,
    wpm: 45,
    accuracy: 92,
    lessonsCompleted: 12
  });

  const badges = [
    { name: "Speed Demon", description: "Type 50+ WPM", earned: true },
    { name: "Accuracy Master", description: "95%+ accuracy", earned: false },
    { name: "Streak Champion", description: "7 day streak", earned: true },
    { name: "Quiz Expert", description: "100% quiz score", earned: false }
  ];

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file.name);
    
    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    await processFile(file);
    
    setTimeout(() => {
      setCurrentView('typing');
    }, 1000);
  };

  const handleTypingComplete = (stats: TypingStats) => {
    console.log('Typing completed with stats:', stats);
    updateProgress({ typingCompleted: true });
    setUserStats(prev => ({
      ...prev,
      wpm: Math.max(prev.wpm, stats.wpm),
      accuracy: Math.round((prev.accuracy + stats.accuracy) / 2)
    }));
    setCurrentView('recall');
  };

  const handleRecallComplete = (stats: RecallStats) => {
    console.log('Recall completed with stats:', stats);
    updateProgress({ recallCompleted: true });
    setCurrentView('quiz');
  };

  const handleQuizComplete = (stats: QuizStats) => {
    console.log('Quiz completed with stats:', stats);
    updateProgress({ quizCompleted: true });
    setUserStats(prev => ({
      ...prev,
      points: prev.points + stats.percentage,
      lessonsCompleted: prev.lessonsCompleted + 1
    }));
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <FileUpload 
            onUploadComplete={handleFileUpload}
            isProcessing={isProcessing}
            uploadProgress={uploadProgress}
          />
        );
      case 'typing':
        if (!lessonData) {
          return <div className="text-center">No lesson data available. Please upload a file first.</div>;
        }
        return (
          <TypingExercise 
            lessonData={lessonData}
            onComplete={handleTypingComplete}
          />
        );
      case 'recall':
        if (!lessonData) {
          return <div className="text-center">No lesson data available. Please upload a file first.</div>;
        }
        return (
          <RecallPhase 
            lessonData={lessonData}
            onComplete={handleRecallComplete}
          />
        );
      case 'quiz':
        if (!lessonData) {
          return <div className="text-center">No lesson data available. Please upload a file first.</div>;
        }
        return (
          <ComprehensionQuiz 
            lessonData={lessonData}
            onComplete={handleQuizComplete}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Points</p>
                      <p className="text-2xl font-bold">{userStats.points}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-300" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Current Streak</p>
                      <p className="text-2xl font-bold">{userStats.streak} days</p>
                    </div>
                    <Target className="h-8 w-8 text-yellow-300" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Average WPM</p>
                      <p className="text-2xl font-bold">{userStats.wpm}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold">{userStats.accuracy}%</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Lesson Progress */}
            {lessonData && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Lesson</CardTitle>
                  <CardDescription>{lessonData.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Chunks: {lessonData.chunks.length}</span>
                      <span>Questions: {lessonData.questions.length}</span>
                    </div>
                    <Button 
                      onClick={() => setCurrentView('typing')} 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Continue Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your earned badges and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 text-center ${
                      badge.earned 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        badge.earned ? 'bg-yellow-400' : 'bg-gray-300'
                      }`}>
                        <Trophy className={`h-6 w-6 ${badge.earned ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <h3 className="font-semibold text-sm">{badge.name}</h3>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                      {badge.earned && (
                        <Badge className="mt-2 bg-green-500">Earned</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('upload')}>
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Upload New Lesson</h3>
                  <p className="text-gray-600">Upload PDF, DOCX, or TXT files to create new typing exercises</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${!lessonData ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => lessonData && setCurrentView('typing')}
              >
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Practice Typing</h3>
                  <p className="text-gray-600">
                    {lessonData ? 'Continue with your current lesson' : 'Upload a file to start practicing'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Memty
              </h1>
            </div>
            
            <nav className="flex space-x-4">
              <Button 
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant={currentView === 'upload' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('upload')}
              >
                Upload
              </Button>
              {lessonData && (
                <Button 
                  variant="ghost"
                  onClick={() => {
                    resetLesson();
                    setCurrentView('dashboard');
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Reset Lesson
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Index;
