
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Target, Trophy, Play, Trash2, Calendar } from 'lucide-react';
import { LessonData } from '@/types/lesson';

interface LessonManagerProps {
  lessons: LessonData[];
  onLessonSelect: (lesson: LessonData) => void;
  onLessonDelete: (lessonId: string) => void;
}

const LessonManager = ({ lessons, onLessonSelect, onLessonDelete }: LessonManagerProps) => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const getProgressPercentage = (lesson: LessonData) => {
    const totalChunks = lesson.pages.reduce((total, page) => total + page.chunks.length, 0);
    const completedChunks = lesson.progress.currentChunk + (lesson.progress.currentPage * lesson.pages[0]?.chunks.length || 0);
    return Math.round((completedChunks / totalChunks) * 100);
  };

  const getCompletionStatus = (lesson: LessonData) => {
    if (lesson.progress.quizCompleted) return 'Completed';
    if (lesson.progress.recallCompleted) return 'Quiz Pending';
    if (lesson.progress.typingCompleted) return 'Recall Pending';
    return 'In Progress';
  };

  const getStatusColor = (lesson: LessonData) => {
    const status = getCompletionStatus(lesson);
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'Quiz Pending': return 'bg-blue-500';
      case 'Recall Pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (lessons.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <CardTitle>No Lessons Yet</CardTitle>
          <CardDescription>
            Upload your first lesson to get started with your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button>Upload Your First Lesson</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Lessons</h2>
        <Badge variant="secondary">{lessons.length} lessons</Badge>
      </div>

      <div className="grid gap-4">
        {lessons.map((lesson) => {
          const progress = getProgressPercentage(lesson);
          const status = getCompletionStatus(lesson);
          
          return (
            <Card 
              key={lesson.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedLesson === lesson.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedLesson(lesson.id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {lesson.totalPages} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(lesson.progress.lastStudyDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {lesson.progress.totalPoints} pts
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(lesson)}>
                      {status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                        lesson.progress.typingCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Typing</span>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                        lesson.progress.recallCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Recall</span>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                        lesson.progress.quizCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Quiz</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonSelect(lesson);
                      }}
                      className="flex-1"
                      variant={status === 'Completed' ? 'outline' : 'default'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {status === 'Completed' ? 'Review' : 'Continue'}
                    </Button>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonDelete(lesson.id);
                      }}
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LessonManager;
