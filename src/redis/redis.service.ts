import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { env } from 'src/env';
import { NotificationPayload } from 'src/notifications/dto/Notification.dto';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private subscriber: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    this.subscriber = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async onModuleDestroy() {}

  getRedis(): Redis {
    return this.redis;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async publish(channel: string, message: any): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(message));
  }

  async storeNotification(
    userId: string,
    notification: NotificationPayload,
  ): Promise<void> {
    const key = `notifications:${userId}`;
    await this.redis.lpush(key, JSON.stringify(notification));
    await this.redis.expire(key, 7 * 24 * 60 * 60);
    await this.redis.ltrim(key, 0, 99);
  }

  async getUserNotifications(
    userId: string,
    limit = 50,
  ): Promise<NotificationPayload[]> {
    const key = `notifications:${userId}`;
    const notifications = await this.redis.lrange(key, 0, limit - 1);
    return notifications
      .map((notification) => {
        if (typeof notification === 'string') {
          try {
            return JSON.parse(notification) as NotificationPayload;
          } catch (error) {
            console.error('Erro ao parsear notificação:', error, notification);
            return null;
          }
        }
        return notification;
      })
      .filter((n) => n !== null) as NotificationPayload[];
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const key = `read:${userId}`;
    await this.redis.sadd(key, notificationId);
    await this.redis.expire(key, 30 * 24 * 60 * 60);
  }

  async isRead(userId: string, notificationId: string): Promise<boolean> {
    const key = `read:${userId}`;
    return (await this.redis.sismember(key, notificationId)) === 1;
  }
}
