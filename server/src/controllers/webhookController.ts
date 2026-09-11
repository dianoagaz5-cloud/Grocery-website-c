import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })
  : null;

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!stripe || !endpointSecret || !sig) {
      return res.status(400).send('Webhook secret or signature missing');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        const history = (order.statusHistory as any[]) || [];
        history.push({
          status: 'Confirmed',
          timestamp: new Date().toISOString(),
          note: 'Payment received via Stripe',
        });

        await prisma.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            status: order.status === 'Placed' ? 'Confirmed' : order.status,
            statusHistory: history,
          },
        });
      }
    }
  }

  return res.json({ received: true });
};
