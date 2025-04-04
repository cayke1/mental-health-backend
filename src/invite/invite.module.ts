import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
