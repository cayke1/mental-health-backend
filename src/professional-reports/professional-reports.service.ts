import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalReportsService {
  constructor(private prisma: PrismaService) {}

  async getProfessionalPatients(professional_id: string) {
    const ppt = await this.prisma.professionalPatient.findMany({
      where: { professionalId: professional_id },
      include: {
        patient: true,
      },
    });
    if (!ppt)
      throw new NotFoundException('No patients found for this professional.');
    return ppt;
  }

  async getProfessionalSignatureStatus(professional_id: string) {
    const signatureStatus = await this.prisma.subscription.findUnique({
      where: { professionalId: professional_id },
      select: {
        plan: true,
        updatedAt: true,
        status: true,
      },
    });
    return signatureStatus;
  }

  async getPatientWeeklyFeelingsRecord(
    professional_id: string,
    patient_id: string,
  ) {
    try {
      const ppt = await this.prisma.professionalPatient.findFirst({
        where: {
          professionalId: professional_id,
          patientId: patient_id,
        },

        include: {
          patient: {
            include: {
              feelings: {
                where: {
                  createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    lte: new Date(),
                  },
                },
              },
            },
          },
        },
      });

      const feelings = ppt?.patient?.feelings.map((feeling) => {
        return {
          feeling,
        };
      });

      return feelings;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(
        'No feelings found for this professional and patient.',
      );
    }
  }
}
