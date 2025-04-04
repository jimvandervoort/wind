import express from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from './middleware/auth';

export const makeApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
    res.json({ message: 'Protected route accessed successfully', user: req.user });
  });

  return app;
};
