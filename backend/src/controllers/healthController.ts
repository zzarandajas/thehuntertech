import { Router, Request, Response } from 'express';
import { obtenerEstadoSalud } from '../services/healthService';

// Cada controlador define sus propias rutas y delega la lógica en su servicio.
const router = Router();

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json(obtenerEstadoSalud());
});

export default router;
