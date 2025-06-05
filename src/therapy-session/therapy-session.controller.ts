import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';
import { TherapySessionService } from './therapy-session.service';
import { CreateTherapySessionDto } from './dtos/therapy-session.dto';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller('therapy-session')
@Roles([Role.PROFESSIONAL])
export class TherapySessionController {
  constructor(private therapySessionService: TherapySessionService) {}

  @Post()
  async create(@Body() data: CreateTherapySessionDto) {
    return this.therapySessionService.createSession(data);
  }

  @Get()
  async findSessions(@Req() request: AuthenticatedRequest) {
    return this.therapySessionService.getSessions(request.user.sub);
  }

  @Delete('/:id')
  async delete(
    @Req() request: AuthenticatedRequest,
    @Param('id') sessionId: number,
  ) {
    return this.therapySessionService.deleteSession(
      Number(sessionId),
      request.user.sub,
    );
  }
}
