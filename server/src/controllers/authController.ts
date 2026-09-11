import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
      },
      include: { addresses: true },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: { ...userWithoutPassword, _id: user.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { addresses: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;

    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        ...userWithoutPassword,
        _id: user.id,
        isAdmin: adminEmails.includes(user.email.toLowerCase()),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { password: _, ...userWithoutPassword } = user;
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    return res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        _id: user.id,
        isAdmin: adminEmails.includes(user.email.toLowerCase()),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, phone, avatar } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      include: { addresses: true },
    });

    const { password: _, ...userWithoutPassword } = updated;
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { ...userWithoutPassword, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
