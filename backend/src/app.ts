import express from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from './middleware/auth';
import type { AuthenticatedRequest } from './types/authenticatedRequest';
import type { User } from './types/user';
import type { Db } from './db';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const makeApp = (db: Db) => {
  const app = express();
  app.use(express.json());

  app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
    res.json({ message: 'Protected route accessed successfully', user: req.user });
  });

  app.get('/api/spotlists', authMiddleware, async (_req: Request, res: Response) => {
    const req = _req as AuthenticatedRequest;
    const spotlist = await db.spotlistRepository.findByUserId(req.user.id);
    res.json({ spotlist });
  });

  app.post('/api/spotlists', authMiddleware, async (_req: Request, res: Response) => {
    const req = _req as AuthenticatedRequest;
    const { spots, name } = req.body;
    const spotlist = await db.spotlistRepository.create(req.user.id, spots, name);
    res.json({ message: 'Spotlist created successfully', spotlist });
  });

  app.put('/api/spotlists/:id', authMiddleware, async (_req: Request, res: Response) => {
    const req = _req as AuthenticatedRequest;
    if (!req.params.id) {
      return res.status(400).json({ message: 'Spotlist ID is required' });
    }
    const { spots } = req.body;
    const spotlist = await db.spotlistRepository.update(req.user.id, req.params.id, spots);
    res.json({ message: 'Spotlist updated successfully', spotlist });
  });


  return app;
};
