import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { env } from 'src/env';

@Injectable()
export class MailService {
  private resend: Resend;
  private from = env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  async sendMail(recipientEmail: string, html: string, subject: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: recipientEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }

    return data;
  }
}
