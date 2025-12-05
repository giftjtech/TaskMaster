import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      title,
      message,
      metadata,
    });
    return this.notificationsRepository.save(notification);
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });
    if (notification) {
      notification.read = true;
      return this.notificationsRepository.save(notification);
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId, read: false }, { read: true });
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });
    if (notification) {
      await this.notificationsRepository.remove(notification);
    }
  }
}

