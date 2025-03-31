import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PatientProfessionalService {
  constructor(private prismaService: PrismaService) {}

  async linkPatient(professional_id: string, patientEmail: string) {
    const patient = await this.prismaService.user.findUnique({
      where: {
        email: patientEmail,
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    return this.prismaService.professionalPatient.create({
      data: {
        professionalId: professional_id,
        patientId: patient.id,
      },
    });
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
