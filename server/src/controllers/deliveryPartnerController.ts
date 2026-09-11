import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { DeliveryAuthRequest } from '../middleware/deliveryAuth';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export const partnerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const partner = await prisma.deliveryPartner.findUnique({ where: { email } });
    if (!partner) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!partner.isActive) {
      return res.status(403).json({ success: false, message: 'Your partner account is inactive. Contact admin.' });
    }

    const token = jwt.sign({ id: partner.id, email: partner.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...partnerData } = partner;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      partner: { ...partnerData, _id: partner.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyDeliveries = async (req: DeliveryAuthRequest, res: Response) => {
  try {
    const partnerId = req.partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const orders = await prisma.order.findMany({
      where: { deliveryPartnerId: partnerId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    return res.json({
      success: true,
      orders: orders.map((o) => ({ ...o, _id: o.id })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryStatus = async (req: DeliveryAuthRequest, res: Response) => {
  try {
    const partnerId = req.partner?.id;
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, deliveryPartnerId: partnerId },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found for this partner' });

    const history = (order.statusHistory as any[]) || [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: history,
      },
      include: { user: true },
    });

    return res.json({
      success: true,
      message: `Order marked as ${status}`,
      order: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeDeliveryWithOtp = async (req: DeliveryAuthRequest, res: Response) => {
  try {
    const partnerId = req.partner?.id;
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ success: false, message: 'Delivery OTP is required' });

    const order = await prisma.order.findFirst({
      where: { id, deliveryPartnerId: partnerId },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please check with customer.' });
    }

    const history = (order.statusHistory as any[]) || [];
    history.push({
      status: 'Delivered',
      timestamp: new Date().toISOString(),
      note: 'Delivered and verified with OTP',
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'Delivered',
        statusHistory: history,
        isPaid: true,
      },
      include: { user: true },
    });

    return res.json({
      success: true,
      message: 'Order completed and delivered successfully',
      order: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartnerLocation = async (req: DeliveryAuthRequest, res: Response) => {
  try {
    const partnerId = req.partner?.id;
    const { orderId, lat, lng } = req.body;

    if (!orderId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'orderId, lat, and lng are required' });
    }

    const updated = await prisma.order.updateMany({
      where: { id: orderId, deliveryPartnerId: partnerId },
      data: {
        liveLocation: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return res.json({ success: true, message: 'Location pushed', count: updated.count });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
