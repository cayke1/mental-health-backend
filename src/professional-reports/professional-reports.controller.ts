import { Controller, Get, Param, Request } from '@nestjs/common';
import { ProfessionalReportsService } from './professional-reports.service';
import { Role } from 'src/custom/enum/roles.enum';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Professional Reports')
@Roles([Role.PROFESSIONAL])
@Controller('professional-reports')
@ApiBearerAuth()
export class ProfessionalReportsController {
  constructor(private reportService: ProfessionalReportsService) {}

  @Get('patients')
  @ApiOperation({
    summary: "Get professional's patients",
    description:
      'Retrieves all patients associated with the authenticated professional',
  })
  @ApiResponse({
    status: 200,
    description: "List of professional's patients retrieved successfully",
  })
  async getProfessionalPatients(@Request() req: AuthenticatedRequest) {
    return await this.reportService.getProfessionalPatients(req.user.sub);
  }

  @Get('signature-status')
  @ApiOperation({
    summary: 'Get signature status',
    description:
      'Retrieves the signature status for the authenticated professional',
  })
  @ApiResponse({
    status: 200,
    description: 'Signature status retrieved successfully',
  })
  async getProfessionalSignatureStatus(@Request() req: AuthenticatedRequest) {
    return await this.reportService.getProfessionalSignatureStatus(
      req.user.sub,
    );
  }

  @Get('/patient/:patient_id')
  async getProfessionalPatient(
    @Request() req: AuthenticatedRequest,
    @Param('patient_id') patient_id: string,
  ) {
    return await this.reportService.getProfessionalPatient(
      patient_id,
      req.user.sub,
    );
  }

  @Get('patients/weekly-report/:patient_id')
  @ApiOperation({
    summary: 'Get patient weekly feeling records',
    description: 'Retrieves the weekly feeling records for a specific patient',
  })
  @ApiParam({
    name: 'patient_id',
    description:
      'The ID of the patient whose weekly reports are being retrieved',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Patient weekly feeling records retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - The professional does not have access to this patient's records",
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found or no records available',
  })
  async getPatientWeeklyFeelingsRecord(
    @Request() req: AuthenticatedRequest,
    @Param('patient_id') patient_id: string,
  ) {
    return await this.reportService.getPatientWeeklyFeelingsRecord(
      req.user.sub,
      patient_id,
    );
  }
}
