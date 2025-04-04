import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';
import { InviteService } from './invite.service';

@Controller('invite')
@Roles([Role.PATIENT])
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post('accept/:id')
  async acceptInvite(@Request() req, @Param('id') id: string) {
    return this.inviteService.accept_invite(id, req.user.sub);
  }

  @Post('reject/:id')
  async rejectInvite(@Request() req, @Param('id') id: string) {
    return this.inviteService.reject_invite(id, req.user.sub);
  }
}
