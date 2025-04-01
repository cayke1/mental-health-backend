import { Module } from '@nestjs/common';
import { ProfessionalReportsController } from './professional-reports.controller';
import { ProfessionalReportsService } from './professional-reports.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessionalReportsController],
  providers: [ProfessionalReportsService]
})
export class ProfessionalReportsModule {}
