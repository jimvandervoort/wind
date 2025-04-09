import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/jwt';
const JWT_SECRET = process.env.JWT_SECRET || 'not-so-secret-dev-secret';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      full_name: decoded.user_metadata.full_name,
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
