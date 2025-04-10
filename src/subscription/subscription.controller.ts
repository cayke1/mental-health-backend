import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

class CheckoutDto {
  plan: 'basic' | 'unlimited';
}

@ApiTags('Subscriptions')
@Controller('subscription')
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Roles([Role.PROFESSIONAL])
  @Post('checkout')
  @ApiOperation({
    summary: 'Create checkout session',
    description:
      'Creates a Stripe checkout session for professional subscription',
  })
  @ApiBody({
    type: CheckoutDto,
    description: 'Subscription plan selection',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Redirect URL to Stripe checkout',
          example: 'https://checkout.stripe.com/...',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a professional',
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription plan' })
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
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels an active subscription for a professional',
  })
  @ApiParam({
    name: 'professional_id',
    description:
      'ID of the professional whose subscription should be cancelled',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription or professional not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to cancel this subscription',
  })
  async cancelSubscription(@Param('professional_id') professional_id: string) {
    return this.subscriptionService.cancelSubscription(professional_id);
  }
}
