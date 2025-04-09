import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [PrismaModule, MailModule],
  providers: [TasksService],
})
export class TasksModule {}
