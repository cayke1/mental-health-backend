import { Module } from '@nestjs/common';
import { PatientProfessionalService } from './patient-professional.service';
import { PatientProfessionalController } from './patient-professional.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InviteModule } from 'src/invite/invite.module';

@Module({
  imports: [PrismaModule, InviteModule],
  providers: [PatientProfessionalService],
  controllers: [PatientProfessionalController],
})
export class PatientProfessionalModule {}
