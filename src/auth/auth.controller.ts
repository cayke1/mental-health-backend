import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() data: { email: string; password: string }) {
    return this.authService.signIn(data);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  signUp(@Body() data: { email: string; password: string; name: string }) {
    return this.authService.signUp(data);
  }
}
