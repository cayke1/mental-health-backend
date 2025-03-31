import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { CreateUserDto } from 'src/users/dtos/CreateUserDto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(data: { email: string; password: string }): Promise<any> {
    const user = await this.usersService.findOneByEmail(data.email);
    const passwordMatch = await compare(data.password, user.password);
    if (!user || !passwordMatch) {
      return new UnauthorizedException('Invalid credentials');
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
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
