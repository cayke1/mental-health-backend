import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { InviteController } from './invite.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, MailModule, NotificationsModule],
  providers: [InviteService],
  exports: [InviteService],
  controllers: [InviteController],
})
export class InviteModule {}
