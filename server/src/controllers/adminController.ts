import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.findMany({ select: { total: true } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        deliveryPartner: true,
      },
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 20 } },
      take: 5,
    });

    return res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalUsers,
        totalProducts,
      },
      recentOrders: recentOrders.map((o) => ({ ...o, _id: o.id })),
      lowStockProducts: lowStockProducts.map((p) => ({ ...p, _id: p.id })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'all') {
      where.status = String(status);
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        deliveryPartner: true,
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

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ success: false, message: 'Order not found' });

    const currentHistory = (current.statusHistory as any[]) || [];
    const newHistory = [
      ...currentHistory,
      {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      },
    ];

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: newHistory,
      },
      include: { deliveryPartner: true, user: true },
    });

    return res.json({
      success: true,
      message: 'Order status updated',
      order: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryPartnerId } = req.body;

    const partner = await prisma.deliveryPartner.findUnique({ where: { id: deliveryPartnerId } });
    if (!partner) return res.status(404).json({ success: false, message: 'Delivery partner not found' });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const history = (order.statusHistory as any[]) || [];
    history.push({
      status: 'Assigned',
      timestamp: new Date().toISOString(),
      note: `Assigned to ${partner.name}`,
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        deliveryPartnerId,
        deliveryOtp: otp,
        status: 'Assigned',
        statusHistory: history,
      },
      include: { deliveryPartner: true, user: true },
    });

    return res.json({
      success: true,
      message: `Order assigned to ${partner.name}`,
      order: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDeliveryPartners = async (req: Request, res: Response) => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        vehicleType: true,
        isActive: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      partners: partners.map((p) => ({ ...p, _id: p.id })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, vehicleType } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required' });
    }

    const existing = await prisma.deliveryPartner.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Partner with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = await prisma.deliveryPartner.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        vehicleType: vehicleType || 'bike',
        isActive: false,
        status: 'PENDING',
      },
    });

    const { password: _, ...partnerWithoutPassword } = partner;
    return res.status(201).json({
      success: true,
      message: 'Delivery partner registered with PENDING status',
      partner: { ...partnerWithoutPassword, _id: partner.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    const isApproved = status === 'APPROVED';
    const partner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        status: isApproved ? 'APPROVED' : 'REJECTED',
        isActive: isApproved,
      },
    });

    return res.json({
      success: true,
      message: `Partner status updated to ${partner.status}`,
      partner: { ...partner, _id: partner.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleDeliveryPartnerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const partner = await prisma.deliveryPartner.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return res.json({
      success: true,
      message: `Partner status set to ${partner.isActive ? 'Active' : 'Inactive'}`,
      partner: { ...partner, _id: partner.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
