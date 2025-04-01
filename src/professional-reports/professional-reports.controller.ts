import { Controller, Get, Param, Request } from '@nestjs/common';
import { ProfessionalReportsService } from './professional-reports.service';
import { Role } from 'src/custom/enum/roles.enum';
import { Roles } from 'src/custom/decorators/roles.decorator';
@Roles([Role.PROFESSIONAL])
@Controller('professional-reports')
export class ProfessionalReportsController {
  constructor(private reportService: ProfessionalReportsService) {}

  @Get('patients')
  async getProfessionalPatients(@Request() req) {
    return await this.reportService.getProfessionalPatients(req.user.sub);
  }

  @Get('signature-status')
  async getProfessionalSignatureStatus(@Request() req) {
    return await this.reportService.getProfessionalSignatureStatus(
      req.user.sub,
    );
  }

  @Get('patients/weekly-report/:patient_id')
  async getPatientWeeklyFeelingsRecord(
    @Request() req,
    @Param('patient_id') patient_id: string,
  ) {
    return await this.reportService.getPatientWeeklyFeelingsRecord(
      req.user.sub,
      req.params.patient_id,
    );
  }
}
