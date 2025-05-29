
import { useState, useCallback, useEffect } from 'react';
import { UserStats, Badge, TypingStats, RecallStats, QuizStats } from '@/types/lesson';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'lesson-master',
    name: 'Lesson Master',
    description: '90%+ recall and quiz score',
    iconType: 'trophy',
    earned: false,
    criteria: 'Achieve 90% or higher on both recall and quiz phases'
  },
  {
    id: 'seven-day-streak',
    name: '7-Day Streak',
    description: 'Study for 7 consecutive days',
    iconType: 'flame',
    earned: false,
    criteria: 'Maintain a 7-day study streak'
  },
  {
    id: 'perfect-recall',
    name: 'Perfect Recall',
    description: '100% recall accuracy',
    iconType: 'star',
    earned: false,
    criteria: 'Get 100% accuracy in a recall phase'
  },
  {
    id: 'weekly-completion',
    name: 'Weekly Warrior',
    description: '3+ lessons per week',
    iconType: 'target',
    earned: false,
    criteria: 'Complete 3 or more lessons in a week'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Type at 60+ WPM',
    iconType: 'crown',
    earned: false,
    criteria: 'Achieve 60+ words per minute typing speed'
  }
];

export const useGameification = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    points: 0,
    streak: 0,
    longestStreak: 0,
    wpm: 0,
    accuracy: 0,
    lessonsCompleted: 0,
    totalStudyTime: 0,
    recallAccuracy: 0,
    quizSuccessRate: 0
  });

  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [recentAchievements, setRecentAchievements] = useState<Badge[]>([]);

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('memty-user-stats');
    const savedBadges = localStorage.getItem('memty-badges');
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
    if (savedBadges) {
      setBadges(JSON.parse(savedBadges));
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('memty-user-stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('memty-badges', JSON.stringify(badges));
  }, [badges]);

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastStudyDate = localStorage.getItem('memty-last-study-date');
    
    if (lastStudyDate === today) {
      return; // Already studied today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStudyDate === yesterday.toDateString()) {
      // Continuing streak
      setUserStats(prev => ({
        ...prev,
        streak: prev.streak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.streak + 1)
      }));
    } else {
      // Breaking streak or starting new
      setUserStats(prev => ({
        ...prev,
        streak: 1,
        longestStreak: Math.max(prev.longestStreak, 1)
      }));
    }
    
    localStorage.setItem('memty-last-study-date', today);
  }, []);

  const awardPoints = useCallback((amount: number, source: string) => {
    setUserStats(prev => ({
      ...prev,
      points: prev.points + amount
    }));
    
    console.log(`Awarded ${amount} points for ${source}`);
  }, []);

  const updateTypingStats = useCallback((stats: TypingStats) => {
    setUserStats(prev => ({
      ...prev,
      wpm: Math.max(prev.wpm, stats.wpm),
      accuracy: Math.round((prev.accuracy + stats.accuracy) / 2),
      totalStudyTime: prev.totalStudyTime + stats.timeSpent
    }));

    // Award points based on completion (not speed, as per PRD)
    awardPoints(5, 'typing completion');
    updateStreak();
  }, [awardPoints, updateStreak]);

  const updateRecallStats = useCallback((stats: RecallStats) => {
    setUserStats(prev => ({
      ...prev,
      recallAccuracy: Math.round((prev.recallAccuracy + stats.accuracy) / 2),
      totalStudyTime: prev.totalStudyTime + stats.timeSpent
    }));

    // Award 1 point per correct recall term (as per PRD)
    awardPoints(stats.score, 'recall completion');
    
    // Check for perfect recall badge
    if (stats.accuracy === 100) {
      checkAndAwardBadge('perfect-recall');
    }
  }, [awardPoints]);

  const updateQuizStats = useCallback((stats: QuizStats) => {
    setUserStats(prev => ({
      ...prev,
      quizSuccessRate: Math.round((prev.quizSuccessRate + stats.percentage) / 2),
      totalStudyTime: prev.totalStudyTime + stats.timeSpent
    }));

    // Award 1 point per correct quiz answer (as per PRD)
    awardPoints(stats.score, 'quiz completion');
  }, [awardPoints]);

  const completeLession = useCallback((recallAccuracy: number, quizScore: number) => {
    setUserStats(prev => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1
    }));

    // Check for lesson master badge (90%+ on both recall and quiz)
    if (recallAccuracy >= 90 && quizScore >= 90) {
      checkAndAwardBadge('lesson-master');
    }

    // Award streak bonus points
    if (userStats.streak >= 3) {
      awardPoints(10, '3-day streak bonus');
    }
    if (userStats.streak >= 7) {
      awardPoints(25, '7-day streak bonus');
      checkAndAwardBadge('seven-day-streak');
    }

    // Check weekly completion badge
    const weeklyLessons = getWeeklyLessonCount();
    if (weeklyLessons >= 3) {
      checkAndAwardBadge('weekly-completion');
    }

    // Check speed demon badge
    if (userStats.wpm >= 60) {
      checkAndAwardBadge('speed-demon');
    }
  }, [userStats.streak, userStats.wpm, awardPoints]);

  const checkAndAwardBadge = useCallback((badgeId: string) => {
    setBadges(prev => {
      const badge = prev.find(b => b.id === badgeId);
      if (badge && !badge.earned) {
        const updatedBadge = {
          ...badge,
          earned: true,
          earnedAt: new Date().toISOString()
        };
        
        setRecentAchievements(recent => [...recent, updatedBadge]);
        
        // Remove from recent achievements after 5 seconds
        setTimeout(() => {
          setRecentAchievements(recent => recent.filter(b => b.id !== badgeId));
        }, 5000);

        return prev.map(b => b.id === badgeId ? updatedBadge : b);
      }
      return prev;
    });
  }, []);

  const getWeeklyLessonCount = useCallback(() => {
    // This would normally query a database
    // For now, return a mock value
    return userStats.lessonsCompleted % 7;
  }, [userStats.lessonsCompleted]);

  const resetStats = useCallback(() => {
    setUserStats({
      points: 0,
      streak: 0,
      longestStreak: 0,
      wpm: 0,
      accuracy: 0,
      lessonsCompleted: 0,
      totalStudyTime: 0,
      recallAccuracy: 0,
      quizSuccessRate: 0
    });
    setBadges(INITIAL_BADGES);
    localStorage.removeItem('memty-user-stats');
    localStorage.removeItem('memty-badges');
    localStorage.removeItem('memty-last-study-date');
  }, []);

  return {
    userStats,
    badges,
    recentAchievements,
    updateTypingStats,
    updateRecallStats,
    updateQuizStats,
    completeLession,
    awardPoints,
    resetStats
  };
};
