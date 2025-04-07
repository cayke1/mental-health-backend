import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { getEmailTemplate } from 'src/custom/emailtemplates/base';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async checkSubscription(professional_id: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        professionalId: professional_id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return false;
    }

    const linkedPatientsCount = await this.prisma.professionalPatient.count({
      where: {
        professionalId: professional_id,
      },
    });

    const invitesSentCount = await this.prisma.invite.count({
      where: {
        sent_by: professional_id,
        status: 'PENDING',
      },
    });

    const allPatientsCount = linkedPatientsCount + invitesSentCount;
    const basicPlanLimit = 5;

    if (subscription.plan === 'BASIC' && allPatientsCount >= basicPlanLimit) {
      return false;
    }

    return true;
  }
  async invite_registered_user(professional: User, patient: User) {
    const subscription = await this.checkSubscription(professional.id);
    if (!subscription) {
      throw new BadRequestException('Subscription limit reached');
    }

    const invite = await this.prisma.invite.create({
      data: {
        sent_by: professional.id,
        sent_to: patient.id,
        status: 'PENDING',
      },
    });

    // send email
    const html = getEmailTemplate({
      heading: 'Convite recebido',
      body: `Você foi convidado por ${professional.name} para liderar seu tratamento.`,
      ctaText: 'Aceitar convite',
      ctaUrl: `${process.env.FRONTEND_URL}/invite-link/link/${professional.id}`,
    });

    const mail = await this.mailService.sendInvitationMail(patient.email, html);

    return { invite, mail };
  }

  async invite_outside_user(professional: User, patient_email: string) {
    const subscription = await this.checkSubscription(professional.id);
    if (!subscription) {
      throw new BadRequestException('Subscription limit reached');
    }
    const invite = await this.prisma.invite.create({
      data: {
        sent_by: professional.id,
        sent_to: patient_email,
        status: 'PENDING',
      },
    });

    const html = getEmailTemplate({
      heading: 'Convite recebido',
      body: `Você foi convidado por ${professional.name} para liderar seu tratamento.`,
      ctaText: 'Aceitar convite',
      ctaUrl: `${process.env.FRONTEND_URL}/invite-link/register/${professional.id}`,
    });

    const mail = await this.mailService.sendInvitationMail(patient_email, html);

    return { invite, mail };
  }

  async accept_invite(invite_id: string, patient_id: string) {
    const invite = await this.prisma.invite.findUnique({
      where: {
        id: invite_id,
        sent_to: patient_id,
      },
    });

    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite already accepted or rejected');
    }

    const existing_relations = await this.prisma.professionalPatient.findMany({
      where: {
        patientId: patient_id,
      },
    });

    if (existing_relations.length > 0) {
      await this.prisma.professionalPatient.deleteMany({
        where: {
          patientId: patient_id,
        },
      });
    }

    const relation = await this.prisma.professionalPatient.create({
      data: {
        professionalId: invite.sent_by,
        patientId: patient_id,
      },
    });

    await this.prisma.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    return { message: 'Invite accepted successfully', relation };
  }

  async reject_invite(invite_id: string, patient_id: string) {
    const invite = await this.prisma.invite.findFirst({
      where: {
        id: invite_id,
        sent_to: patient_id,
      },
    });

    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite already accepted or rejected');
    }

    await this.prisma.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        status: 'REJECTED',
      },
    });

    return { message: 'Invite rejected successfully' };
  }
}
