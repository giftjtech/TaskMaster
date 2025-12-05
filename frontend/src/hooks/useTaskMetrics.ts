import { useMemo } from 'react';
import { Task } from '../services/task.service';

interface TaskMetrics {
  completedTasks: Task[];
  inProgressTasks: Task[];
  overdueTasks: Task[];
  recentCompleted: Task[];
  timeline: { date: string; count: number }[];
}

export const useTaskMetrics = (assignedTasks: Task[]): TaskMetrics => {
  return useMemo(() => {
    const completedTasks = assignedTasks.filter((t) => t.status === 'done');
    const inProgressTasks = assignedTasks.filter((t) => t.status === 'in_progress');
    const overdueTasks = assignedTasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    });

    // Get recent completed tasks (last 10)
    const recentCompleted = completedTasks
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    // Get task completion timeline (last 30 days)
    const timeline: { date: string; count: number }[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = completedTasks.filter((task) => {
        const taskDate = new Date(task.updatedAt || task.createdAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;
      
      timeline.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    return {
      completedTasks,
      inProgressTasks,
      overdueTasks,
      recentCompleted,
      timeline,
    };
  }, [assignedTasks]);
};

