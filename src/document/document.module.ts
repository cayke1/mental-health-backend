import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DocumentService } from './document.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
  imports: [PrismaModule],
})
export class DocumentModule {}
