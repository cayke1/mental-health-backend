import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationPayload } from './dto/Notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  async send(@Body() body: NotificationPayload) {
    return this.service.notify(body);
  }
}
