import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from './middleware/auth';
import type { AuthenticatedRequest } from './types/authenticatedRequest';
import type { User } from './types/user';
import type { Db } from './db';

const REPORT_DIR = process.env.WIND_REPORT_DIR ?? '../public';
const VERSION = process.env.VITE_WIND_VERSION ?? 'local';

const loadSpotsFromReport = (report: string) => {
  const reports = fs.readFileSync(path.join(REPORT_DIR, report), 'utf8');
  const reportData = JSON.parse(reports);
  return reportData.report;
}

const loadSpotsFromReports = async (slugs: string[]) => {
  const spots = [
    ...loadSpotsFromReport('report.capetown.json'),
    ...loadSpotsFromReport('report.holland.json'),
    ...loadSpotsFromReport('report.tarifa.json'),
    ...loadSpotsFromReport('report.sweden.json'),
    ...loadSpotsFromReport('report.restofworld.json'),
  ]
  return slugs.map(slug => spots.find(spot => spot.spot.slug === slug));
}

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

  app.get('/api/whoami', authMiddleware, (req: Request, res: Response) => {
    res.json({ message: 'Who am I?', user: req.user });
  });

  app.get('/api/myspots', authMiddleware, async (_req: Request, res: Response) => {
    const req = _req as AuthenticatedRequest;
    const myspots = await db.myspotsRepository.findByUserId(req.user.id);
    if (!myspots) {
      res.status(404).json({ error: 'This user does not have any spots' });
      return;
    }

    res.json({ ok:true, version: VERSION, report: await loadSpotsFromReports(myspots.slugs) });
  });

  app.put('/api/myspots', authMiddleware, async (_req: Request, res: Response) => {
    const req = _req as AuthenticatedRequest;
    const { slugs } = req.body;
    await db.myspotsRepository.updateOrCreate(req.user.id, slugs);
    res.json({ ok: true });
  });

  return app;
};
