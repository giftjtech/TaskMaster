import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private usersService: UsersService,
    private tagsService: TagsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const { tags, ...taskData } = createTaskDto;
    const task = this.tasksRepository.create({
      ...taskData,
      createdById: userId,
    });
    
    // Handle tags
    if (tags && tags.length > 0) {
      const tagEntities = await this.tagsService.findOrCreate(tags);
      task.tags = tagEntities;
    }
    
    const savedTask = await this.tasksRepository.save(task);
    
    // Send notification to assignee if task is assigned (including self-assignment)
    if (savedTask.assigneeId) {
      const notification = await this.notificationsService.create(
        savedTask.assigneeId,
        NotificationType.TASK_ASSIGNED,
        savedTask.assigneeId === userId ? 'Task Created and Assigned to You' : 'New Task Assigned',
        `You have been assigned to task: ${savedTask.title}`,
        { taskId: savedTask.id },
      );
      
      // Send real-time notification via WebSocket
      await this.notificationsGateway.sendNotification(savedTask.assigneeId, notification);
      
      // Send email notification (non-blocking)
      this.sendTaskAssignmentEmail(savedTask, userId).catch((error) => {
        console.error('Failed to send task assignment email:', error);
      });
    }
    
    return savedTask;
  }

  async findAll(
    filterDto: FilterTaskDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<Task>> {
    const { page = 1, limit = 10, tags, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Task> = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    let queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('task.tags', 'tags');

    // Apply filters
    if (where.status) queryBuilder = queryBuilder.andWhere('task.status = :status', { status: where.status });
    if (where.priority) queryBuilder = queryBuilder.andWhere('task.priority = :priority', { priority: where.priority });
    if (where.projectId) queryBuilder = queryBuilder.andWhere('task.projectId = :projectId', { projectId: where.projectId });
    if (where.assigneeId) queryBuilder = queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId: where.assigneeId });

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      const tagEntities = await this.tagsService.findOrCreate(tags);
      const tagIds = tagEntities.map(t => t.id);
      queryBuilder = queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    queryBuilder = queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(tasks, total, page, limit);
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee', 'createdBy', 'project', 'comments', 'tags'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    if (task.createdById !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }
    
    const previousAssigneeId = task.assigneeId;
    const previousStatus = task.status;
    const { tags, ...taskData } = updateTaskDto;
    
    Object.assign(task, taskData);
    
    // Handle tags update
    if (tags !== undefined) {
      if (tags && tags.length > 0) {
        const tagEntities = await this.tagsService.findOrCreate(tags);
        task.tags = tagEntities;
      } else {
        task.tags = [];
      }
    }
    
    const updatedTask = await this.tasksRepository.save(task);
    
    // Send notification if task was assigned to a new user (including self-assignment)
    if (updateTaskDto.assigneeId && updateTaskDto.assigneeId !== previousAssigneeId) {
      const isSelfAssignment = updateTaskDto.assigneeId === userId;
      const notification = await this.notificationsService.create(
        updateTaskDto.assigneeId,
        NotificationType.TASK_ASSIGNED,
        isSelfAssignment ? 'Task Assigned to You' : 'Task Assigned to You',
        `You have been assigned to task: ${updatedTask.title}`,
        { taskId: updatedTask.id },
      );
      
      await this.notificationsGateway.sendNotification(updateTaskDto.assigneeId, notification);
      
      // Send email notification (non-blocking)
      this.sendTaskAssignmentEmail(updatedTask, userId).catch((error) => {
        console.error('Failed to send task assignment email:', error);
      });
    }
    
    // Send notification if status changed and task has an assignee (including self)
    if (updateTaskDto.status && updateTaskDto.status !== previousStatus && updatedTask.assigneeId) {
      const notification = await this.notificationsService.create(
        updatedTask.assigneeId,
        NotificationType.TASK_UPDATED,
        'Task Status Updated',
        `Task "${updatedTask.title}" status changed to ${updateTaskDto.status}`,
        { taskId: updatedTask.id, status: updateTaskDto.status },
      );
      
      await this.notificationsGateway.sendNotification(updatedTask.assigneeId, notification);
    }
    
    // Send task update broadcast
    await this.notificationsGateway.sendTaskUpdate(updatedTask.id, {
      task: updatedTask,
      updatedBy: userId,
    });
    
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);
    if (task.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }
    await this.tasksRepository.remove(task);
  }

  private async sendTaskAssignmentEmail(task: Task, assignerId: string): Promise<void> {
    if (!task.assigneeId) return;

    try {
      // Get assignee and assigner details
      const [assignee, assigner] = await Promise.all([
        this.usersService.findOne(task.assigneeId),
        this.usersService.findOne(assignerId),
      ]);

      if (!assignee || !assigner) return;

      const assignerName = `${assigner.firstName} ${assigner.lastName}`;
      
      await this.emailService.sendTaskAssignmentEmail(
        assignee.email,
        task.title,
        task.description || '',
        assignerName,
        task.id,
      );
    } catch (error) {
      // Log error but don't throw - email failures shouldn't break task assignment
      console.error('Error sending task assignment email:', error);
    }
  }
}

