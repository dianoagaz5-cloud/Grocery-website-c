import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
const IS_PROD = process.env.NODE_ENV === 'production';

const ADMIN_EMAILS = () =>
  (process.env.ADMIN_EMAILS || 'admin@example.com')
    .split(',')
    .map((e) => e.trim().toLowerCase());

function deriveRole(email: string): 'ADMIN' | 'CLIENT' {
  return ADMIN_EMAILS().includes(email.toLowerCase()) ? 'ADMIN' : 'CLIENT';
}

const cookieBase = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

async function issueTokens(res: Response, userId: string, email: string, role: string) {
  const accessToken = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '15m' });
  const rawRefresh = crypto.randomBytes(64).toString('hex');
  const hashedRefresh = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await prisma.refreshToken.create({ data: { token: hashedRefresh, userId, expiresAt } });
  } catch { /* DB not available */ }

  res.cookie('access_token', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', rawRefresh, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
  return accessToken;
}

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
      data: { name, email, password: hashedPassword, phone: phone || '' },
      include: { addresses: true },
    });
    const role = deriveRole(user.email);
    await issueTokens(res, user.id, user.email, role);
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: { ...userWithoutPassword, _id: user.id, isAdmin: role === 'ADMIN' },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: IS_PROD ? 'Server error during registration' : error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email }, include: { addresses: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const role = deriveRole(user.email);
    await issueTokens(res, user.id, user.email, role);
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: { ...userWithoutPassword, _id: user.id, isAdmin: role === 'ADMIN' },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: IS_PROD ? 'Server error during login' : error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const rawRefresh: string | undefined = req.cookies?.refresh_token;
    if (!rawRefresh) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }
    const hashedRefresh = crypto.createHash('sha256').update(rawRefresh).digest('hex');
    let stored;
    try {
      stored = await prisma.refreshToken.findUnique({ where: { token: hashedRefresh } });
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
    }
    if (!stored || stored.expiresAt < new Date()) {
      res.clearCookie('refresh_token', cookieBase);
      return res.status(401).json({ success: false, message: 'Refresh token expired or revoked' });
    }
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const role = deriveRole(user.email);
    await issueTokens(res, user.id, user.email, role);
    return res.json({ success: true, message: 'Token refreshed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: IS_PROD ? 'Token refresh failed' : error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const rawRefresh: string | undefined = req.cookies?.refresh_token;
  if (rawRefresh) {
    const hashedRefresh = crypto.createHash('sha256').update(rawRefresh).digest('hex');
    try { await prisma.refreshToken.delete({ where: { token: hashedRefresh } }); } catch { /* ignore */ }
  }
  res.clearCookie('access_token', cookieBase);
  res.clearCookie('refresh_token', cookieBase);
  return res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { addresses: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    const role = deriveRole(user.email);
    return res.json({ success: true, user: { ...userWithoutPassword, _id: user.id, isAdmin: role === 'ADMIN' } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: IS_PROD ? 'Internal server error' : error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { name, phone, avatar } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(phone !== undefined && { phone }), ...(avatar !== undefined && { avatar }) },
      include: { addresses: true },
    });
    const { password: _, ...userWithoutPassword } = updated;
    return res.json({ success: true, message: 'Profile updated successfully', user: { ...userWithoutPassword, _id: updated.id } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: IS_PROD ? 'Internal server error' : error.message });
  }
};
