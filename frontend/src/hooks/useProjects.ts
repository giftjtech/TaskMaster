import { useState, useEffect } from 'react';
import { projectService, Project } from '../services/project.service';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAll();
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: any) => {
    try {
      const newProject = await projectService.create(data);
      setProjects((prev) => [newProject, ...prev]);
      toast.success('Project created successfully');
      return newProject;
    } catch (err: any) {
      toast.error('Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: string, data: any) => {
    try {
      const updatedProject = await projectService.update(id, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
      toast.success('Project updated successfully');
      return updatedProject;
    } catch (err: any) {
      toast.error('Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete project');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

