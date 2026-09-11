import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      addresses: addresses.map((a) => ({ ...a, _id: a.id })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { label, address, city, state, zip, lat, lng, isDefault } = req.body;

    if (!label || !address || !city || !state || !zip) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const count = await prisma.address.count({ where: { userId } });

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        address,
        city,
        state,
        zip,
        lat: lat ? parseFloat(lat) : 40.7128,
        lng: lng ? parseFloat(lng) : -74.006,
        isDefault: isDefault ?? count === 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      address: { ...newAddress, _id: newAddress.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { label, address, city, state, zip, lat, lng, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zip && { zip }),
        ...(lat !== undefined && { lat: parseFloat(lat) }),
        ...(lng !== undefined && { lng: parseFloat(lng) }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return res.json({
      success: true,
      message: 'Address updated successfully',
      address: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.address.delete({ where: { id } });
    return res.json({ success: true, message: 'Address removed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return res.json({
      success: true,
      message: 'Default address updated',
      address: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
