import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { NotificationPayload, DEFAULT_ICONS } from './dto/Notification.dto';
import { randomUUID as uuidv4 } from 'crypto';

@Injectable()
export class NotificationsService {
  constructor(private readonly redisService: RedisService) {}

  async sendNotification(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): Promise<void> {
    const notification: NotificationPayload = {
      ...payload,
      id: uuidv4(),
      timestamp: new Date(),
      icon: payload.icon || DEFAULT_ICONS[payload.type || 'info'],
      type: payload.type || 'info',
    };

    await this.redisService.storeNotification(payload.userId, notification);

    await this.redisService.publish(`notifications:${payload.userId}`, notification);
  }

  async getUserNotifications(userId: string, limit = 50): Promise<NotificationPayload[]> {
    const notifications = await this.redisService.getUserNotifications(userId, limit);
    
    // Adiciona status de leitura
    const notificationsWithReadStatus = await Promise.all(
      notifications.map(async (notification) => ({
        ...notification,
        read: await this.redisService.isRead(userId, notification.id),
      }))
    );

    return notificationsWithReadStatus;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.redisService.markAsRead(userId, notificationId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !(n as any).read).length;
  }

  // Métodos de conveniência para diferentes tipos de notificação
  async sendSuccessNotification(userId: string, message: string, url: string): Promise<void> {
    await this.sendNotification({
      userId,
      message,
      url,
      type: 'success',
    });
  }

  async sendErrorNotification(userId: string, message: string, url: string): Promise<void> {
    await this.sendNotification({
      userId,
      message,
      url,
      type: 'error',
    });
  }

  async sendInfoNotification(userId: string, message: string, url: string): Promise<void> {
    await this.sendNotification({
      userId,
      message,
      url,
      type: 'info',
    });
  }

  async sendWarningNotification(userId: string, message: string, url: string): Promise<void> {
    await this.sendNotification({
      userId,
      message,
      url,
      type: 'warning',
    });
  }
}