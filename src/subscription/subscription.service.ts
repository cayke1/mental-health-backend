import { Injectable } from '@nestjs/common';
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
    const price_id = plan ? plan === "basic" ? process.env.STRIPE_BASIC_PRICE_ID : process.env.STRIPE_UNLIMITED_PRICE_ID : null;
    console.log(price_id);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
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

    return {checkout_url: session.url};
  }
}
