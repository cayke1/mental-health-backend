import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalReportsService {
  constructor(private prisma: PrismaService) {}

  async getProfessionalPatients(professional_id: string) {
    const patients = await this.prisma.professionalPatient.findMany({
      where: { professionalId: professional_id },
      select: {
        patient: {
          select: {
            id: true,
            name: true,
            feelings: {
              select: {
                emotion: true,
                createdAt: true,
              },
            },
          },
        },
        TherapySession: {
          select: {
            startDate: true,
            endDate: true,
            done: true,
            confirmed: true,
          },
          orderBy: {
            startDate: 'asc',
          },
        },
      },
    });

    const response = patients.map((patientRelation) => {
      const { patient, TherapySession } = patientRelation;
      const pastSessions = TherapySession.filter((session) => session.done);
      const lastSession =
        pastSessions.length > 0
          ? pastSessions[pastSessions.length - 1].startDate.toISOString()
          : '';
      const futureSessions = TherapySession.filter(
        (session) => !session.done && session.confirmed,
      );
      const nextSession =
        futureSessions.length > 0
          ? futureSessions[0].startDate.toISOString()
          : '';
      let status = 'active' as const;

      const emotionScore = patient.feelings.length; // this isn't ready

      const trends = patient.feelings
        .slice(-5)
        .map((feeling) => feeling.emotion);

      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`; // this isn't ready

      return {
        id: patient.id,
        name: patient.name,
        lastSession,
        nextSession,
        emotionScore,
        status,
        trends,
        avatar,
      };
    });

    return response;
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
