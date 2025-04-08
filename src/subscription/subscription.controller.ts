import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Roles([Role.PROFESSIONAL])
  @Post('checkout')
  async checkout(
    @Request() req: AuthenticatedRequest,
    @Body() data: { plan: 'basic' | 'unlimited' },
  ) {
    return this.subscriptionService.createCheckoutSession(
      req.user.sub,
      data.plan,
    );
  }

  @Roles([Role.PROFESSIONAL])
  @Post('cancel/:professional_id')
  async cancelSubscription(@Param('professional_id') professional_id: string) {
    return this.subscriptionService.cancelSubscription(professional_id);
  }
}
