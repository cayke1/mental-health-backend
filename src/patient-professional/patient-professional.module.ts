import { Module } from '@nestjs/common';
import { PatientProfessionalService } from './patient-professional.service';
import { PatientProfessionalController } from './patient-professional.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [PatientProfessionalService],
  controllers: [PatientProfessionalController],
})
export class PatientProfessionalModule {}
