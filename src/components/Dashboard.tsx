
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Calendar, Award, Flame, Crown, Star } from 'lucide-react';
import { UserStats, Badge as UserBadge } from '@/types/lesson';

interface DashboardProps {
  userStats: UserStats;
  badges: UserBadge[];
}

const Dashboard = ({ userStats, badges }: DashboardProps) => {
  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  const getIconForBadge = (iconType: UserBadge['iconType']) => {
    switch (iconType) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'target': return Target;
      case 'flame': return Flame;
      case 'crown': return Crown;
      default: return Award;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Points</p>
                <p className="text-3xl font-bold">{userStats.points.toLocaleString()}</p>
              </div>
              <Trophy className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Current Streak</p>
                <p className="text-3xl font-bold">{userStats.streak} days</p>
              </div>
              <Flame className="h-10 w-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average WPM</p>
                <p className="text-3xl font-bold text-gray-800">{userStats.wpm}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Lessons Completed</p>
                <p className="text-3xl font-bold text-gray-800">{userStats.lessonsCompleted}</p>
              </div>
              <Target className="h-10 w-10 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Typing Accuracy</span>
                <span>{userStats.accuracy}%</span>
              </div>
              <Progress value={userStats.accuracy} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Recall Accuracy</span>
                <span>{userStats.recallAccuracy}%</span>
              </div>
              <Progress value={userStats.recallAccuracy} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quiz Success Rate</span>
                <span>{userStats.quizSuccessRate}%</span>
              </div>
              <Progress value={userStats.quizSuccessRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Study Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-semibold">{userStats.longestStreak} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Study Time</span>
              <span className="font-semibold">{Math.round(userStats.totalStudyTime / 60)} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lessons Completed</span>
              <span className="font-semibold">{userStats.lessonsCompleted}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            {earnedBadges.length} of {badges.length} badges earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => {
              const IconComponent = getIconForBadge(badge.iconType);
              return (
                <div key={badge.id} className="p-4 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-400 flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <Badge className="bg-green-500">Earned</Badge>
                </div>
              );
            })}
            
            {availableBadges.map((badge) => {
              const IconComponent = getIconForBadge(badge.iconType);
              return (
                <div key={badge.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-center opacity-60">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-sm">{badge.name}</h3>
                  <p className="text-xs text-gray-600">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
