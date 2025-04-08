import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/custom/decorators/public.decorator';

interface RequestUser {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() data: { email: string; password: string }) {
    return this.authService.signIn(data);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register/patient')
  signUpPatient(
    @Body()
    data: {
      email: string;
      password: string;
      name: string;
      professional_id: string;
    },
  ) {
    return this.authService.patientSignup(data);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  signUp(
    @Body()
    data: {
      email: string;
      password: string;
      name: string;
      role?: 'PATIENT' | 'PROFESSIONAL';
    },
  ) {
    return this.authService.signUp(data);
  }
  //@Roles([Role.PROFESSIONAL, Role.PATIENT])
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest): RequestUser {
    if (!req.user) {
      throw new Error('User not found');
    }
    return req.user;
  }
}
