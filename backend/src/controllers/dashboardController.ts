import { Router, Request, Response, NextFunction } from 'express';
import { obtenerStats } from '../services/dashboardService';

const router = Router();

// GET /api/dashboard/stats
router.get('/dashboard/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerStats());
  } catch (err) {
    return next(err);
  }
});

export default router;
