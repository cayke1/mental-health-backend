import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from = process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  async sendInvitationMail(recipientEmail: string, html: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: recipientEmail,
      subject: 'Convite recebido',
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }

    return data;
  }

  async sendFeelingReminder(recipientEmail: string, html: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: recipientEmail,
      subject: 'Lembrete de registro de sentimento diário',
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }

    return data;
  }
}
