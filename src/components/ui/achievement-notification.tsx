
import { useEffect, useState } from 'react';
import { Badge } from '@/types/lesson';
import { Trophy, Star, Target, Flame, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AchievementNotificationProps {
  badge: Badge;
  onDismiss: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  flame: Flame,
  crown: Crown
};

export const AchievementNotification = ({ badge, onDismiss }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const IconComponent = iconMap[badge.iconType];

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold">{badge.name}</h3>
            <p className="text-sm opacity-90">{badge.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
