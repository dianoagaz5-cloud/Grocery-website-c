import { Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })
  : null;

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Order items and shipping address are required' });
    }

    const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 20 ? 0 : 2.99;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + deliveryFee + tax).toFixed(2));

    const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Pick active partner if available
    const activePartner = await prisma.deliveryPartner.findFirst({
      where: { isActive: true },
    });

    const statusHistory = [
      { status: 'Placed', timestamp: new Date().toISOString(), note: 'Order placed successfully' },
      ...(activePartner
        ? [{ status: 'Assigned', timestamp: new Date().toISOString(), note: `Assigned to ${activePartner.name}` }]
        : []),
    ];

    const order = await prisma.order.create({
      data: {
        userId,
        items,
        shippingAddress,
        paymentMethod: paymentMethod || 'cash',
        subtotal,
        deliveryFee,
        tax,
        total,
        status: activePartner ? 'Assigned' : 'Placed',
        statusHistory,
        deliveryOtp,
        deliveryPartnerId: activePartner ? activePartner.id : null,
        isPaid: false,
      },
      include: {
        deliveryPartner: true,
      },
    });

    // If card payment and Stripe is configured, create checkout session
    if (paymentMethod === 'card' && stripe && process.env.FRONTEND_URL) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/orders/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout`,
        metadata: {
          orderId: order.id,
        },
      });

      return res.status(201).json({
        success: true,
        order: { ...order, _id: order.id },
        stripeUrl: session.url,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: { ...order, _id: order.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { deliveryPartner: true },
    });

    return res.json({
      success: true,
      orders: orders.map((o) => ({ ...o, _id: o.id })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        deliveryPartner: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      order: { ...order, _id: order.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLiveLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        liveLocation: {
          lat,
          lng,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return res.json({ success: true, liveLocation: updated.liveLocation });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
