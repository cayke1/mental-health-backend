import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTherapySessionDto } from './dtos/therapy-session.dto';

@Injectable()
export class TherapySessionService {
  constructor(private prismaService: PrismaService) {}

  private async _checkOverlaps(
    startDate: Date,
    endDate: Date,
    professionalId: string,
  ): Promise<boolean> {
    const overlaps = await this.prismaService.therapySession.findMany({
      where: {
        professionalPatient: {
          professionalId,
        },
        AND: [
          {
            startDate: {
              lt: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
            },
          },
        ],
      },
    });

    return overlaps.length > 0;
  }

  private _isValidDate(startDate: Date, endDate: Date): boolean {
    if (
      !(startDate instanceof Date) ||
      isNaN(startDate.getTime()) ||
      !(endDate instanceof Date) ||
      isNaN(endDate.getTime())
    ) {
      return false;
    }

    if (startDate >= endDate) {
      return false;
    }

    const now = new Date();
    if (startDate < now) {
      return false;
    }

    // min 15 minutes
    const minimumSessionDuration = 15 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() < minimumSessionDuration) {
      return false;
    }

    return true;
  }

  async createSession(data: CreateTherapySessionDto) {
    const { professionalPatientId, startDate: start, endDate: end } = data;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const isValid = this._isValidDate(startDate, endDate);
    if (!isValid) throw new BadRequestException('Invalid date params');
    const exists = await this.prismaService.professionalPatient.findUnique({
      where: {
        id: professionalPatientId,
      },
    });

    if (!exists) throw new NotFoundException('ProfessionalPatient not found');

    const overlaps = await this._checkOverlaps(
      startDate,
      endDate,
      exists.professionalId,
    );

    if (overlaps)
      throw new ConflictException('There is another session in time selected');

    try {
      const newSession = await this.prismaService.therapySession.create({
        data: {
          professionalPatientId,
          startDate,
          endDate,
        },
      });

      return newSession;
    } catch (error) {
      return error;
    }
  }

  async deleteSession(id: number, professionalId: string) {
    const sessionExists = await this.prismaService.therapySession.findUnique({
      where: {
        id,
        AND: {
          professionalPatient: {
            professionalId,
          },
        },
      },
    });

    if (!sessionExists)
      throw new NotFoundException(
        "Session doesn't exists or doesn't has this professional as owner",
      );

    try {
      await this.prismaService.therapySession.delete({
        where: {
          id,
        },
      });

      return { OK: true };
    } catch (error) {
      return error;
    }
  }
}
