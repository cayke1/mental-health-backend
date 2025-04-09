import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientDto, CreateUserDto } from './dtos/CreateUserDto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) throw new UnprocessableEntityException('User already exists');

    return this.prisma.user.create({
      data,
    });
  }

  async createPatient(data: CreatePatientDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) throw new UnprocessableEntityException('User already exists');

    const professionalExists = await this.prisma.user.findUnique({
      where: { id: data.professional_id },
    });

    if (!professionalExists) {
      throw new UnprocessableEntityException('Professional not found');
    }

    const patient = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: 'PATIENT',
      },
    });

    const patient_professional = await this.prisma.professionalPatient.create({
      data: {
        professionalId: data.professional_id,
        patientId: patient.id,
      },
    });

    return {
      ...patient,
      patient_professional,
    };
  }

  async updateStripeCustomerId(stripeCustomerId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
