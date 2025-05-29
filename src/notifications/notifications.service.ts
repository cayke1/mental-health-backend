import { Injectable } from '@nestjs/common';
import { Client } from '@upstash/qstash';
import { env } from 'src/env';
import { NotificationPayload } from './dto/Notification.dto';



@Injectable()
export class NotificationsService {
  private qstash = new Client({
    token: env.QSTASH_TOKEN,
  });

  async notify(payload: NotificationPayload) {
    return await this.qstash.publishJSON({
      url: `${env.FRONTEND_URL}/api/notifications`, // Endpoint Next.js
      body: payload,
    });
  }
}
