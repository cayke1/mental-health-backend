import { Module } from '@nestjs/common';
import { TherapySessionService } from './therapy-session.service';
import { TherapySessionController } from './therapy-session.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TherapySessionService],
  controllers: [TherapySessionController],
})
export class TherapySessionModule {}
