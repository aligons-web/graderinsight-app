import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from './supabase';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

// Generate JWT token
export function generateToken(userId: string, email: string, role: string = 'user'): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role?: string };
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Auth middleware
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Fetch fresh user data including role
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('id', decoded.userId)
    .single();

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
  };

  next();
}

// Check subscription status
export async function checkSubscription(userId: string) {
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return subscription;
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return user?.role === 'admin';
}