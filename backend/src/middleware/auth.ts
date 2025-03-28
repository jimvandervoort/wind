import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import type { JwtPayload } from '../types/jwt';
const JWT_SECRET = process.env.JWT_SECRET || 'not-so-secret-dev-secret';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        full_name: string;
      };
      is_authenticated: boolean;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  req.is_authenticated = false;

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

    req.is_authenticated = true;

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
