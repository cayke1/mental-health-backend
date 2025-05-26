import { Controller, Param, Post, Request } from '@nestjs/common';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';
import { InviteService } from './invite.service';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Invites')
@Controller('invite')
@Roles([Role.PATIENT])
@ApiBearerAuth()
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post('reject/:id')
  @ApiOperation({
    summary: 'Reject invite',
    description: 'Allows a patient to reject an invitation',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the invitation to reject',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation successfully rejected',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - user does not have permission to reject this invitation',
  })
  async rejectInvite(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.inviteService.reject_invite(id, req.user.sub);
  }
}
