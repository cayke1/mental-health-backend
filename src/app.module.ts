import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './roles/roles.guard';
import { AuthGuard } from './auth/auth.guard';
import { PatientProfessionalModule } from './patient-professional/patient-professional.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { StripeWebhookController } from './stripe-webhook/stripe-webhook.controller';
import { StripeWebhookModule } from './stripe-webhook/stripe-webhook.module';
import { ProfessionalReportsModule } from './professional-reports/professional-reports.module';
import { MailModule } from './mail/mail.module';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PatientProfessionalModule,
    SubscriptionModule,
    StripeWebhookModule,
    ProfessionalReportsModule,
    MailModule,
    InviteModule,
  ],
  controllers: [AppController, StripeWebhookController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
