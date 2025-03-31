import { Module } from '@nestjs/common';
import { PatientProfessionalService } from './patient-professional.service';
import { PatientProfessionalController } from './patient-professional.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
   imports: [PrismaModule],
  providers: [PatientProfessionalService],
  controllers: [PatientProfessionalController]
})
export class PatientProfessionalModule {}
