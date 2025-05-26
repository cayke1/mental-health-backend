import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { getEmailTemplate } from 'src/custom/emailtemplates/base';
import { InviteService } from 'src/invite/invite.service';
import { MailService } from 'src/mail/mail.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { CreatePatientDto, CreateUserDto } from 'src/users/dtos/CreateUserDto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private subscription: SubscriptionService,
    private mail: MailService,
    private inviteService: InviteService,
  ) {}

  async signIn(data: { email: string; password: string }): Promise<any> {
    const user = await this.usersService.findOneByEmail(data.email);
    const passwordMatch = await compare(data.password, user.password);
    if (!user || !passwordMatch) {
      return new UnauthorizedException('Invalid credentials');
    }

    if (!user.stripeCustomerId) {
      const customer = await this.subscription.createStripeCustomer(
        user.email,
        user.name,
      );
      await this.usersService.updateStripeCustomerId(customer.id, user.email);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
      plan: user.Subscription?.plan,
    };
  }

  async signUp(data: CreateUserDto): Promise<any> {
    const passwordHashed = await hash(data.password, 8);
    const user = await this.usersService.create({
      ...data,
      password: passwordHashed,
    });
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const customer = await this.subscription.createStripeCustomer(
      user.email,
      user.name,
    );
    await this.usersService.updateStripeCustomerId(customer.id, user.email);
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async patientSignup(data: CreatePatientDto): Promise<any> {
    const passwordHashed = await hash(data.password, 8);
    const user = await this.usersService.createPatient({
      ...data,
      password: passwordHashed,
      role: 'PATIENT',
    });

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const customer = await this.subscription.createStripeCustomer(
      user.email,
      user.name,
    );
    await this.inviteService.accept_invite(data.professional_id, user.id);
    await this.usersService.updateStripeCustomerId(customer.id, user.email);
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };
      const token = this.jwtService.sign(payload);
      await this.usersService.updateResetToken(user.id, token);

      const html = getEmailTemplate({
        heading: 'Redefinição de senha',
        body: `Olá, ${user.name}. Você solicitou a redefinição de senha. Clique no link abaixo para redefinir sua senha.`,
        ctaText: 'Redefinir senha',
        ctaUrl: `${process.env.FRONTEND_URL}/reset-password/${token}`,
      });
      return await this.mail.sendMail(email, html, 'Redefinição de senha');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('User not found');
      }
      throw new BadRequestException('Error sending email');
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const id = await this.decodeConfirmationToken(token);
      const passwordHashed = await hash(password, 8);

      await this.usersService.updateUserPassword(id, passwordHashed);
      const user = await this.usersService.updateResetToken(id, null);

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('User not found');
      }
      throw new BadRequestException('Error resetting password');
    }
  }

  private decodeConfirmationToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (typeof decoded === 'object' && 'sub' in decoded) {
        return decoded.sub;
      }
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
