import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationPayload } from './dto/Notification.dto';
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getUserNotifications(userId, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@Query('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') notificationId: string,
    @Query('userId') userId: string,
  ) {
    await this.notificationService.markAsRead(userId, notificationId);
    return { success: true };
  }

  @Post('send')
  async sendNotification(
    @Body() payload: Omit<NotificationPayload, 'id' | 'timestamp'>,
  ) {
    await this.notificationService.sendNotification(payload);
    return { success: true };
  }
}
