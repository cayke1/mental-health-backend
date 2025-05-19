import { Injectable } from '@nestjs/common';
import { Log } from './dto/Log.dto';
import { env } from 'src/env';

@Injectable()
export class LoggerService {
  async log(log: Log): Promise<void> {
    const newLog = { ...log, projectID: env.DISCORD_LOG_PROJECT_ID, projectName: 'MindSereno' };
    const request = await fetch(env.DISCORD_LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLog),
    });

    if (!request.ok) {
      console.error('Error sending log to Discord:', request);
      throw new Error('Error sending log to Discord');
    }
  }
}
