import { useState, useEffect } from 'react';
import { taskService, Task } from '../services/task.service';
import { analyticsService } from '../services/analytics.service';

interface ProfileData {
  assignedTasks: Task[];
  stats: any;
  completionRate: number;
  loading: boolean;
  error: string | null;
}

export const useProfileData = (userId?: string) => {
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [completionRate, setCompletionRate] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tasks assigned to the user
        const tasksResponse = await taskService.getAll({ assigneeId: userId, limit: 100 });
        const tasks = Array.isArray(tasksResponse?.data) 
          ? tasksResponse.data 
          : Array.isArray(tasksResponse) 
          ? tasksResponse 
          : [];

        setAssignedTasks(tasks);

        // Fetch user stats
        const statsData = await analyticsService.getTaskStats().catch(() => ({
          total: 0,
          done: 0,
          inProgress: 0,
          todo: 0,
          overdue: 0,
        }));

        setStats(statsData);

        // Calculate completion rate for assigned tasks
        const completedTasks = tasks.filter((t) => t.status === 'done').length;
        const totalAssigned = tasks.length;
        const rate = totalAssigned > 0 ? Math.round((completedTasks / totalAssigned) * 100) : 0;
        setCompletionRate(rate);
      } catch (err: any) {
        console.error('Failed to load profile data:', err);
        setError(err?.message || 'Failed to load profile data');
        setAssignedTasks([]);
        setStats({ total: 0, done: 0, inProgress: 0, todo: 0, overdue: 0 });
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadProfileData();
    }, 100);

    return () => clearTimeout(timer);
  }, [userId]);

  return {
    assignedTasks,
    stats,
    completionRate,
    loading,
    error,
  };
};

