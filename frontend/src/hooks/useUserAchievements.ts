import { useMemo } from 'react';
import { Task } from '../services/task.service';
import { Trophy, Zap, Star, Activity } from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  bgColor: string;
  unlocked: boolean;
}

export const useUserAchievements = (
  assignedTasks: Task[],
  completedTasks: Task[],
  completionRate: number
): Achievement[] => {
  return useMemo(() => {
    const achievements: Achievement[] = [
      {
        id: 1,
        title: 'Task Master',
        description: `Completed ${completedTasks.length} tasks`,
        icon: Trophy,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        unlocked: completedTasks.length >= 10,
      },
      {
        id: 2,
        title: 'Speed Demon',
        description: 'Completed 5 tasks in a week',
        icon: Zap,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        unlocked: completedTasks.length >= 5,
      },
      {
        id: 3,
        title: 'Consistency King',
        description: 'Maintained 80%+ completion rate',
        icon: Star,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        unlocked: completionRate >= 80,
      },
      {
        id: 4,
        title: 'Team Player',
        description: 'Active on multiple projects',
        icon: Activity,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        unlocked: assignedTasks.length >= 20,
      },
    ];

    return achievements;
  }, [assignedTasks.length, completedTasks.length, completionRate]);
};

