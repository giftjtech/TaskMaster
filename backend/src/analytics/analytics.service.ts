import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getTaskStats(userId?: string) {
    const where = userId ? { createdById: userId } : {};
    const tasks = await this.tasksRepository.find({ where });

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      inReview: tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatus.DONE,
      ).length,
    };

    return stats;
  }

  async getTaskCompletionRate(userId?: string, days: number = 30) {
    const where = userId ? { createdById: userId } : {};
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const tasks = await this.tasksRepository.find({
      where,
      select: ['status', 'createdAt', 'updatedAt'],
    });

    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.DONE && new Date(t.updatedAt) >= startDate,
    );

    return {
      completed: completedTasks.length,
      total: tasks.length,
      rate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
    };
  }

  async getTasksByPriority(userId?: string) {
    const where = userId ? { createdById: userId } : {};
    const tasks = await this.tasksRepository.find({ where });

    return {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
    };
  }

  async getProjectStats(userId?: string) {
    const where = userId ? { ownerId: userId } : {};
    const projects = await this.projectsRepository.find({
      where,
      relations: ['tasks'],
    });

    return {
      total: projects.length,
      withTasks: projects.filter((p) => p.tasks.length > 0).length,
      averageTasksPerProject:
        projects.length > 0
          ? projects.reduce((sum, p) => sum + p.tasks.length, 0) / projects.length
          : 0,
    };
  }

  async getRecentActivity(userId?: string, limit: number = 10) {
    const where = userId ? { createdById: userId } : {};
    const tasks = await this.tasksRepository.find({
      where,
      relations: ['assignee', 'project'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      updatedAt: task.updatedAt,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            firstName: task.assignee.firstName,
            lastName: task.assignee.lastName,
          }
        : null,
      project: task.project
        ? {
            id: task.project.id,
            name: task.project.name,
          }
        : null,
    }));
  }
}

