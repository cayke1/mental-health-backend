import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { PatientProfessionalService } from './patient-professional.service';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';

@Controller('patient-professional')
@Roles([Role.PROFESSIONAL])
export class PatientProfessionalController {
  constructor(private service: PatientProfessionalService) {}

  @Post('link')
  async linkPatient(@Request() req, @Body() data: { patientEmail: string }) {
    return this.service.linkPatient(req.user.sub, data.patientEmail);
  }

  @Get('patients')
  async getPatients(@Request() req) {
    return this.service.getPatients(req.user.sub);
  }

  @Patch('unlink')
  async unlinkPatient(@Request() req, @Body() data: { patientEmail: string }) {
    return this.service.unlinkPatient(req.user.sub, data.patientEmail);
  }
}
