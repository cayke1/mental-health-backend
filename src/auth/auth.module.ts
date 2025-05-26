import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { MailModule } from 'src/mail/mail.module';
import { InviteModule } from 'src/invite/invite.module';

@Module({
  imports: [
    UsersModule,
    SubscriptionModule,
    MailModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    InviteModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
