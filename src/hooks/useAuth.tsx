
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserStats, UserPreferences } from '@/types/lesson';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userStats: UserStats;
  userPreferences: UserPreferences;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateStats: (stats: Partial<UserStats>) => void;
  updatePreferences: (preferences: UserPreferences) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication for now - in real implementation would use Google OAuth
const mockUser: User = {
  id: 'user-1',
  email: 'demo@memty.com',
  name: 'Demo User',
  picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  createdAt: new Date().toISOString()
};

const defaultStats: UserStats = {
  points: 1247,
  streak: 7,
  longestStreak: 14,
  wpm: 45,
  accuracy: 92,
  lessonsCompleted: 12,
  totalStudyTime: 3600, // in seconds
  recallAccuracy: 87,
  quizSuccessRate: 84
};

const defaultPreferences: UserPreferences = {
  theme: 'light',
  chunkSize: 18,
  fontSize: 16,
  autoAdvance: true
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    const initAuth = async () => {
      try {
        // In real implementation, check for existing session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load user data from localStorage for demo
        const savedUser = localStorage.getItem('memty-user');
        const savedStats = localStorage.getItem('memty-stats');
        const savedPreferences = localStorage.getItem('memty-preferences');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Auto-sign in demo user
          setUser(mockUser);
          localStorage.setItem('memty-user', JSON.stringify(mockUser));
        }
        
        if (savedStats) {
          setUserStats(JSON.parse(savedStats));
        } else {
          localStorage.setItem('memty-stats', JSON.stringify(defaultStats));
        }
        
        if (savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
        } else {
          localStorage.setItem('memty-preferences', JSON.stringify(defaultPreferences));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      // In real implementation, initiate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUser);
      localStorage.setItem('memty-user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      localStorage.removeItem('memty-user');
      localStorage.removeItem('memty-stats');
      localStorage.removeItem('memty-preferences');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (stats: Partial<UserStats>) => {
    const newStats = { ...userStats, ...stats };
    setUserStats(newStats);
    localStorage.setItem('memty-stats', JSON.stringify(newStats));
  };

  const updatePreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    localStorage.setItem('memty-preferences', JSON.stringify(preferences));
  };

  const value: AuthContextType = {
    user,
    userStats,
    userPreferences,
    isLoading,
    signIn,
    signOut,
    updateStats,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
