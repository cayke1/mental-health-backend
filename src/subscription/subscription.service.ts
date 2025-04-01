import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
    console.log(price_id);

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
      metadata: {
        professional_id: professional_id,
        plan: plan,
      },
    });

    return { checkout_url: session.url };
  }

  async cancelSubscription(professional_id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        professionalId: professional_id,
      },
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const invoices = await this.stripe.invoices.list({
      subscription: subscription.stripeSubId,
      limit: 1,
    });

    if (!invoices.data.length || !invoices.data[0].charge) {
      throw new NotFoundException('No charge found for this subscription');
    }

    const chargeId = invoices.data[0].charge;
    const createdAt = new Date(invoices.data[0].created * 1000);
    const diffInDays =
      (new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24);

    if (diffInDays <= 7) {
      return this.refund(chargeId as string, subscription.stripeSubId);
    }
    return this.cancelAtEnd(subscription.stripeSubId);
  }

  private async refund(chargeId: string, stripeSubId: string) {
    try {
      await this.stripe.refunds.create({ charge: chargeId });
      await this.stripe.subscriptions.update(stripeSubId, {
        cancel_at: Date.now() / 1000,
        description: 'Subscription canceled and refunded',
      });

      return {
        message: 'Subscription canceled and refunded successfully',
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
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
      throw new Error(error);
    }
  }
}
