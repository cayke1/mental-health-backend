import { Module } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsSseController } from 'src/sse/notifications-sse.controller';

@Module({
  providers: [RedisService, NotificationsService],
  controllers: [NotificationsController, NotificationsSseController],
  exports: [NotificationsService, RedisService],
})
export class NotificationsModule {}