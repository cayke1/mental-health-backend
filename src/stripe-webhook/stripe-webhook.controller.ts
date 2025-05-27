/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Headers,
  NotFoundException,
  Post,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { Public } from 'src/custom/decorators/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';

@Public()
@ApiTags('Stripe Webhooks')
@Controller('stripe-webhook')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({
    summary: 'Handle Stripe webhooks',
    description: 'Processes webhooks sent from Stripe for subscription events',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Signature header from Stripe to verify webhook authenticity',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        received: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid signature or webhook payload',
    schema: {
      type: 'object',
      properties: {
        received: {
          type: 'boolean',
          example: false,
        },
      },
    },
  })
  async handleWebhook(
    @Req() req,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.log(err);
      return { received: false };
    }
    console.log(event.type);
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }
    return { received: true };
  }

  @ApiExcludeEndpoint()
  private async handleSubscriptionCreated(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const { professional_id, plan } = session.metadata!;
    const professional = await this.prisma.user.findUnique({
      where: { id: professional_id, role: 'PROFESSIONAL' },
    });
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }
    try {
      await this.prisma.subscription.create({
        data: {
          professionalId: professional.id,
          stripeSubId: session.subscription as string,
          plan: plan.toUpperCase() as 'BASIC' | 'UNLIMITED',
          status: 'ACTIVE',
          expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });
    } catch (error) {
      console.log('Error creating subscription:', error);
      throw error;
    }
  }

  @ApiExcludeEndpoint()
  private async handleChargeRefunded(event: Stripe.Event) {
    const billing_details = event.object;
    const email = billing_details;
    const professional = await this.prisma.user.findUnique({
      where: { email, role: 'PROFESSIONAL' },
    });
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }
    try {
      const sub = await this.prisma.subscription.deleteMany({
        where: { professionalId: professional.id },
      });
      if (!sub) {
        throw new NotFoundException('Subscription not found');
      }
      return { message: 'Subscription deleted successfully' };
    } catch (error) {
      console.log('Error deleting subscription:', error);
      throw error;
    }
  }

  private async handleSubscriptionDeleted(event: Stripe.Event) {
    try {
      const customerId = event.data.object['customer'];
      console.log(customerId)
      const user = await this.prisma.user.findUnique({
        where: {
          stripeCustomerId: customerId,
          role: 'PROFESSIONAL',
        },
      });

      if (!user) throw new NotFoundException('User not found');

      await this.prisma.subscription.deleteMany({
        where: {
          professionalId: user.id,
        },
      });

      return {
        message: 'OK',
      };
    } catch (error) {
      console.log(error);
    }
  }
}
