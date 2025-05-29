import { Module } from '@nestjs/common';
import { NotificationsSseController } from './notifications-sse.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [NotificationsSseController],
  imports: [RedisModule],
})
export class SseModule {}
