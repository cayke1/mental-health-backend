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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

interface RequestUser {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

class LoginDto {
  email: string;
  password: string;
}

class PatientRegisterDto {
  email: string;
  password: string;
  name: string;
  professional_id: string;
}

class RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'PROFESSIONAL';
}

class ProfileResponseDto {
  sub: string;
  email: string;
  name: string;
  role: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate a user and return tokens',
  })
  @ApiBody({ type: LoginDto, description: 'User credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  signIn(@Body() data: { email: string; password: string }) {
    return this.authService.signIn(data);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register/patient')
  @ApiOperation({
    summary: 'Register patient',
    description: 'Register a new patient user with professional association',
  })
  @ApiBody({
    type: PatientRegisterDto,
    description: 'Patient registration data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
  })
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
  @ApiOperation({
    summary: 'Register user',
    description: 'Register a new user with optional role',
  })
  @ApiBody({ type: RegisterDto, description: 'User registration data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
  })
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
  @ApiOperation({
    summary: 'Get user profile',
    description: "Retrieve the authenticated user's profile",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  getProfile(@Request() req: AuthenticatedRequest): RequestUser {
    if (!req.user) {
      throw new Error('User not found');
    }
    return req.user;
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(
    @Body() { token, password }: { token: string; password: string },
  ) {
    return this.authService.resetPassword(token, password);
  }
}
