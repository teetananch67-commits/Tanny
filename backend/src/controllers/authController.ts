import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = String(process.env.COOKIE_SECURE || 'false') === 'true';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phone } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'CUSTOMER',
      name,
      phone: phone || null
    }
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  return res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
