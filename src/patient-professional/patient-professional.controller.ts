import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { PatientProfessionalService } from './patient-professional.service';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

class LinkPatientDto {
  patientEmail: string;
}

@ApiTags('Patient-Professional Relationships')
@Controller('patient-professional')
@Roles([Role.PROFESSIONAL])
@ApiBearerAuth()
export class PatientProfessionalController {
  constructor(private service: PatientProfessionalService) {}

  @Post('link')
  @ApiOperation({
    summary: 'Link patient to professional',
    description:
      'Creates an association between a professional and a patient via email',
  })
  @ApiBody({
    type: LinkPatientDto,
    description: 'Patient email to link with the professional',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient successfully linked to professional',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({
    status: 409,
    description: 'Patient already linked to this professional',
  })
  async linkPatient(
    @Request() req: AuthenticatedRequest,
    @Body() data: { patientEmail: string },
  ) {
    return this.service.linkPatient(req.user.sub, data.patientEmail);
  }

  @Get('patients')
  @ApiOperation({
    summary: "Get professional's patients",
    description:
      'Retrieves all patients linked to the authenticated professional',
  })
  @ApiResponse({
    status: 200,
    description: 'List of patients retrieved successfully',
  })
  async getPatients(@Request() req: AuthenticatedRequest) {
    return this.service.getPatients(req.user.sub);
  }

  @Patch('unlink')
  @ApiOperation({
    summary: 'Unlink patient from professional',
    description: 'Removes the association between a professional and a patient',
  })
  @ApiBody({
    type: LinkPatientDto,
    description: 'Patient email to unlink from the professional',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient successfully unlinked from professional',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found or not linked to this professional',
  })
  async unlinkPatient(
    @Request() req: AuthenticatedRequest,
    @Body() data: { patientEmail: string },
  ) {
    return this.service.unlinkPatient(req.user.sub, data.patientEmail);
  }
}
