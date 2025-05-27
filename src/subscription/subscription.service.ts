import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OneMonthAheadUnix } from 'src/utils';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  constructor(private prisma: PrismaService) {}
  async createStripeCustomer(
    email: string,
    name: string,
  ): Promise<Stripe.Customer> {
    const exists = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });
    if (exists.data.length > 0) {
      return exists.data[0];
    }
    const customer = await this.stripe.customers.create({
      email: email,
      name: name,
    });
    return customer;
  }

  async createCheckoutSession(
    professional_id: string,
    plan: 'basic' | 'unlimited',
  ) {
    const price_id = plan
      ? plan === 'basic'
        ? process.env.STRIPE_BASIC_PRICE_ID
        : process.env.STRIPE_UNLIMITED_PRICE_ID
      : null;

    const professional = await this.prisma.user.findUnique({
      where: {
        id: professional_id,
      },
    });

    if (!professional) throw new NotFoundException('User doesnt exists');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      tax_id_collection: {
        enabled: true,
      },
      line_items: [
        {
          price: price_id || '',
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer: professional.stripeCustomerId!,
      customer_update: {
        name: 'auto',
        address: 'auto',
        shipping: 'auto'
      },
      metadata: {
        professional_id: professional_id,
        plan: plan,
      },
      subscription_data: {
        billing_cycle_anchor: OneMonthAheadUnix(),
      },
    });

    return { checkout_url: session.url };
  }

  async cancelSubscription(professional_id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { professionalId: professional_id },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    const stripeSub = await this.stripe.subscriptions.retrieve(
      subscription.stripeSubId,
    );
    if (!stripeSub || stripeSub.status === 'incomplete') {
      throw new NotFoundException('Invalid or incomplete Stripe subscription');
    }

    const invoices = await this.stripe.invoices.list({
      subscription: subscription.stripeSubId,
      limit: 1,
    });

    if (!invoices.data.length || !invoices.data[0].charge) {
      throw new NotFoundException('No charge found for this subscription');
    }

    const chargeRaw = invoices.data[0].charge;
    const chargeId = typeof chargeRaw === 'string' ? chargeRaw : chargeRaw?.id;
    if (!chargeId) throw new NotFoundException('Invalid charge');

    const chargeDetails = await this.stripe.charges.retrieve(chargeId);
    if (chargeDetails.refunded) {
      throw new Error('Charge already refunded');
    }

    const createdAt = new Date(invoices.data[0].created * 1000);
    const diffInDays = (Date.now() - createdAt.getTime()) / (1000 * 3600 * 24);

    if (diffInDays <= 7) {
      return this.refund(chargeId, subscription.stripeSubId);
    }
    return this.cancelAtEnd(subscription.stripeSubId);
  }

  private async refund(chargeId: string, stripeSubId: string) {
    try {
      await this.stripe.refunds.create({ charge: chargeId });
      await this.stripe.subscriptions.cancel(stripeSubId);
      return {
        message: 'Subscription canceled and refunded successfully',
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  private async cancelAtEnd(subscriptionId: string) {
    try {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        message: 'Subscription will be canceled at the end of the period',
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}
