
import { useState } from 'react';
import { Upload, BookOpen, Target, Trophy, TrendingUp, Settings as SettingsIcon, User, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TypingExercise from '@/components/TypingExercise';
import RecallPhase from '@/components/RecallPhase';
import ComprehensionQuiz from '@/components/ComprehensionQuiz';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';
import LessonManager from '@/components/LessonManager';
import { AchievementNotification } from '@/components/ui/achievement-notification';
import { useLessonData } from '@/hooks/useLessonData';
import { useGameification } from '@/hooks/useGameification';
import { useAuth } from '@/hooks/useAuth';
import { TypingStats, RecallStats, QuizStats, LessonData } from '@/types/lesson';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { lessonData, isProcessing, processFile, updateProgress, resetLesson } = useLessonData();
  const { user, userStats, userPreferences, isLoading, signOut, updateStats, updatePreferences } = useAuth();
  const { userStats: gamificationStats, badges, recentAchievements, updateTypingStats, updateRecallStats, updateQuizStats, completeLession, awardPoints } = useGameification();
  
  const [lessons, setLessons] = useState<LessonData[]>([]);

  const handleFileUpload = async (uploadedLessonData: LessonData) => {
    console.log('Lesson data received:', uploadedLessonData.title);
    setLessons(prev => [...prev, uploadedLessonData]);
    setCurrentView('typing');
  };

  const handleLessonSelect = (lesson: LessonData) => {
    // Set the selected lesson and navigate to appropriate view
    const status = getCompletionStatus(lesson);
    if (status === 'Completed') {
      setCurrentView('dashboard');
    } else if (lesson.progress.typingCompleted && !lesson.progress.recallCompleted) {
      setCurrentView('recall');
    } else if (lesson.progress.recallCompleted && !lesson.progress.quizCompleted) {
      setCurrentView('quiz');
    } else {
      setCurrentView('typing');
    }
  };

  const handleLessonDelete = (lessonId: string) => {
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
    if (lessonData?.id === lessonId) {
      resetLesson();
      setCurrentView('dashboard');
    }
  };

  const getCompletionStatus = (lesson: LessonData) => {
    if (lesson.progress.quizCompleted) return 'Completed';
    if (lesson.progress.recallCompleted) return 'Quiz Pending';
    if (lesson.progress.typingCompleted) return 'Recall Pending';
    return 'In Progress';
  };

  const handleTypingComplete = (stats: TypingStats) => {
    console.log('Typing completed with stats:', stats);
    updateProgress({ typingCompleted: true });
    
    // Update user stats
    updateStats({
      wpm: Math.max(userStats.wpm, stats.wpm),
      accuracy: Math.round((userStats.accuracy + stats.accuracy) / 2),
      totalStudyTime: userStats.totalStudyTime + stats.timeSpent
    });

    // Update gamification stats
    updateTypingStats(stats);
    
    setCurrentView('recall');
  };

  const handleRecallComplete = (stats: RecallStats) => {
    console.log('Recall completed with stats:', stats);
    updateProgress({ recallCompleted: true });
    
    // Update user stats
    updateStats({
      recallAccuracy: Math.round((userStats.recallAccuracy + stats.accuracy) / 2)
    });
    
    // Update gamification stats
    updateRecallStats(stats);
    
    setCurrentView('quiz');
  };

  const handleQuizComplete = (stats: QuizStats) => {
    console.log('Quiz completed with stats:', stats);
    updateProgress({ quizCompleted: true });
    
    // Update user stats
    updateStats({
      points: userStats.points + stats.percentage,
      lessonsCompleted: userStats.lessonsCompleted + 1,
      quizSuccessRate: Math.round((userStats.quizSuccessRate + stats.percentage) / 2)
    });

    // Update gamification stats
    updateQuizStats(stats);
    
    // Complete lesson
    completeLession(userStats.recallAccuracy, stats.percentage);
    
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold">Loading Memty...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Memty</CardTitle>
            <CardDescription>
              Type to learn, master your lessons with gamified studying
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              Continue as Demo User
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <FileUpload 
            onUploadComplete={handleFileUpload}
            chunkSize={userPreferences.chunkSize}
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
      case 'lessons':
        return (
          <LessonManager 
            lessons={lessons}
            onLessonSelect={handleLessonSelect}
            onLessonDelete={handleLessonDelete}
          />
        );
      case 'settings':
        return (
          <Settings 
            preferences={userPreferences}
            onPreferencesChange={updatePreferences}
          />
        );
      default:
        return (
          <Dashboard 
            userStats={userStats}
            badges={badges}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${userPreferences.theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
              
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-2">
                  <Button 
                    variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant={currentView === 'lessons' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('lessons')}
                  >
                    Lessons
                  </Button>
                  <Button 
                    variant={currentView === 'upload' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('upload')}
                  >
                    Upload
                  </Button>
                </nav>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentView()}
        </div>

        {/* Achievement Notifications */}
        {recentAchievements.map((badge) => (
          <AchievementNotification
            key={badge.id}
            badge={badge}
            onDismiss={() => {
              // The badge will be automatically removed from recentAchievements after 5 seconds
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
