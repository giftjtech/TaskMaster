export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
  assigneeId?: string;
  assignee?: User;
  createdBy?: User;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  color?: string;
}

