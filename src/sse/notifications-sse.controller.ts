import { Controller, Sse, Query, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';

@Controller('sse')
export class NotificationsSseController {
  constructor(private readonly redisService: RedisService) {}

  @Sse('notifications')
  notifications(@Query('userId') userId: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      let lastCheck = Date.now();
      
      const checkForNotifications = async () => {
        try {
          const notifications = await this.redisService.getUserNotifications(userId, 10);
          const newNotifications = notifications.filter(
            n => new Date(n.timestamp).getTime() > lastCheck
          );
          
          if (newNotifications.length > 0) {
            observer.next({
              data: JSON.stringify(newNotifications),
              type: 'notification',
            } as MessageEvent);
            lastCheck = Date.now();
          }
        } catch (error) {
          console.error('Erro ao verificar notificações:', error);
        }
      };

      // Verifica a cada 5 segundos
      const interval = setInterval(checkForNotifications, 5000);
      
      // Verifica imediatamente
      checkForNotifications();

      return () => {
        clearInterval(interval);
      };
    });
  }
}