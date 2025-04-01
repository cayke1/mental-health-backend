import {
  Controller,
  Headers,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { Public } from 'src/custom/decorators/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
@Public()
@Controller('stripe-webhook')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  constructor(private prisma: PrismaService) {}

  @Post()
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
        console.log('Subscription deleted:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return { received: true };
  }

  private async handleSubscriptionCreated(event: Stripe.Event) {
    console.log(event);
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
        },
      });
    } catch (error) {
      console.log('Error creating subscription:', error);
      throw error;
    }
  }

  private async handleChargeRefunded(event: Stripe.Event) {
    console.log(event);
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
}
