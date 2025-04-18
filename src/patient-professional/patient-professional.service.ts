import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getEmailTemplate } from 'src/custom/emailtemplates/base';
import { InviteService } from 'src/invite/invite.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PatientProfessionalService {
  constructor(
    private prismaService: PrismaService,
    private inviteService: InviteService,
  ) {}

  async linkPatient(professional_id: string, patientEmail: string) {
    const professional = await this.prismaService.user.findUnique({
      where: { id: professional_id },
    });
    if (!professional) throw new NotFoundException('Professional not found');
    if (professional.role !== 'PROFESSIONAL')
      throw new UnauthorizedException('User is not a professional');
    const patient = await this.prismaService.user.findUnique({
      where: {
        email: patientEmail,
      },
    });

    if (patient) {
      return this.inviteService.invite_registered_user(professional, patient);
    }

    // send invite mail to patient
    return this.inviteService.invite_outside_user(professional, patientEmail);
  }

  async unlinkPatient(professional_id: string, patientEmail: string) {
    const patient = await this.prismaService.user.findUnique({
      where: {
        email: patientEmail,
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    try {
      await this.prismaService.professionalPatient.deleteMany({
        where: {
          professionalId: professional_id,
          patientId: patient.id,
        },
      });

      return {
        message: 'Patient unlinked successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Patient not linked to this professional');
      } else {
        throw error;
      }
    }
  }

  async getPatients(professional_id: string) {
    return this.prismaService.professionalPatient.findMany({
      where: {
        professionalId: professional_id,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
