import { useState, useEffect } from 'react';
import { taskService, Task, FilterTaskDto } from '../services/task.service';
import toast from 'react-hot-toast';

export const useTasks = (filters?: FilterTaskDto) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAll(filters);
      setTasks(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data: any) => {
    try {
      const newTask = await taskService.create(data);
      setTasks((prev) => [newTask, ...prev]);
      toast.success('Task created successfully');
      return newTask;
    } catch (err: any) {
      toast.error('Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, data: any) => {
    try {
      const updatedTask = await taskService.update(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (err: any) {
      toast.error('Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};

