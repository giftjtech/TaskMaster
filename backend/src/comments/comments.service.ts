import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService,
    private usersService: UsersService,
  ) {}

  /**
   * Extract mentioned user IDs from comment content
   * Format: @firstName lastName or @firstName
   */
  private extractMentions(content: string, allUsers: any[]): string[] {
    // Match @ followed by one or more words (for full names like "@Gift Banda")
    const mentionRegex = /@([\w\s]+?)(?=\s|$|@|,|\.|!|\?)/g;
    const mentions: string[] = [];
    const matches = content.matchAll(mentionRegex);
    
    for (const match of matches) {
      const mentionText = match[1].trim().toLowerCase();
      if (!mentionText) continue;
      
      // Try to find user by full name first (e.g., "@Gift Banda")
      const fullNameMatch = allUsers.find(u => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        return fullName === mentionText;
      });
      
      if (fullNameMatch && !mentions.includes(fullNameMatch.id)) {
        mentions.push(fullNameMatch.id);
        continue;
      }
      
      // Try to find user by first name only (e.g., "@Gift")
      const firstNameMatch = allUsers.find(u => 
        u.firstName.toLowerCase() === mentionText
      );
      
      if (firstNameMatch && !mentions.includes(firstNameMatch.id)) {
        mentions.push(firstNameMatch.id);
        continue;
      }
      
      // Try to find user by last name only
      const lastNameMatch = allUsers.find(u => 
        u.lastName.toLowerCase() === mentionText
      );
      
      if (lastNameMatch && !mentions.includes(lastNameMatch.id)) {
        mentions.push(lastNameMatch.id);
      }
    }
    
    return [...new Set(mentions)]; // Remove duplicates
  }

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    // Get all users to parse mentions
    const allUsers = await this.usersService.findAll();
    
    // Extract mentions from content
    const mentionedUserIds = this.extractMentions(createCommentDto.content, allUsers);
    
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId,
      mentions: mentionedUserIds.length > 0 ? mentionedUserIds : null,
    });
    const savedComment = await this.commentsRepository.save(comment);
    
    // Get task to find assignee and creator
    try {
      const task = await this.tasksService.findOne(createCommentDto.taskId);
      
      // Notify mentioned users
      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== userId) {
          const mentionedUser = allUsers.find(u => u.id === mentionedUserId);
          if (mentionedUser) {
            const notification = await this.notificationsService.create(
              mentionedUserId,
              NotificationType.TASK_COMMENTED,
              'You were mentioned in a comment',
              `You were mentioned in a comment on task: ${task.title}`,
              { taskId: task.id, commentId: savedComment.id },
            );
            
            await this.notificationsGateway.sendNotification(mentionedUserId, notification);
          }
        }
      }
      
      // Notify task assignee (if different from comment author and not already mentioned)
      if (task.assigneeId && task.assigneeId !== userId && !mentionedUserIds.includes(task.assigneeId)) {
        const notification = await this.notificationsService.create(
          task.assigneeId,
          NotificationType.TASK_COMMENTED,
          'New Comment on Task',
          `A new comment was added to task: ${task.title}`,
          { taskId: task.id, commentId: savedComment.id },
        );
        
        await this.notificationsGateway.sendNotification(task.assigneeId, notification);
      }
      
      // Notify task creator (if different from comment author, assignee, and not already mentioned)
      if (task.createdById && task.createdById !== userId && task.createdById !== task.assigneeId && !mentionedUserIds.includes(task.createdById)) {
        const notification = await this.notificationsService.create(
          task.createdById,
          NotificationType.TASK_COMMENTED,
          'New Comment on Task',
          `A new comment was added to task: ${task.title}`,
          { taskId: task.id, commentId: savedComment.id },
        );
        
        await this.notificationsGateway.sendNotification(task.createdById, notification);
      }
    } catch (error) {
      // If task not found, just log and continue
      console.error('Error sending comment notification:', error.message);
    }
    
    return savedComment;
  }

  async findAll(taskId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'task'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.findOne(id);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }
    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.commentsRepository.remove(comment);
  }
}

