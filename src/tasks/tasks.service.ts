import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getEmailTemplate } from 'src/custom/emailtemplates/base';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron('0 19 * * *')
  async handleCheckDailyFeeling() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const patients = await this.prisma.user.findMany({
      where: {
        role: 'PATIENT',
      },
      include: {
        feelings: {
          where: {
            createdAt: {
              gte: today,
            },
          },
        },
      },
    });

    if (!patients || patients.length === 0) {
      this.logger.warn('No patients found');
      return;
    }

    for (const patient of patients) {
      if (patient.feelings.length === 0) {
        const html = getEmailTemplate({
          heading: 'Olá, ' + patient.name,
          body: 'Você ainda não registrou seu sentimento hoje. Clique no botão abaixo para registrar.',
          ctaText: 'Registrar sentimento',
          ctaUrl: `${process.env.FRONTEND_URL}/patient/portal`,
          footerText: 'Se você não deseja receber mais lembretes, clique aqui.',
        });

        try {
          const data = await this.mail.sendFeelingReminder(patient.email, html);
          this.logger.log(
            `Email sent to ${patient.email} with status: ${JSON.stringify(data)}`,
          );
        } catch (error) {
          this.logger.error('Error sending email to ' + patient.email, error);
        }
      }
    }
  }
}
