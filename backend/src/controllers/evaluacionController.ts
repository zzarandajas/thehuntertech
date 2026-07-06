import { Router, Request, Response, NextFunction } from 'express';
import {
  obtenerEvaluacion,
  reemplazarMetricas,
  reemplazarScores,
  reemplazarObservaciones,
} from '../services/evaluacionService';

// Evaluación de una participación (métricas / scores / observaciones).
const router = Router();

// GET /api/proceso-candidatos/:id  (detalle de evaluación con las dimensiones del mandato)
router.get('/proceso-candidatos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerEvaluacion(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// PUT /api/proceso-candidatos/:id/metricas  { items: [{ valor, descripcion }] }
router.put(
  '/proceso-candidatos/:id/metricas',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await reemplazarMetricas(Number(req.params.id), req.body?.items ?? []));
    } catch (err) {
      return next(err);
    }
  },
);

// PUT /api/proceso-candidatos/:id/scores  { items: [{ dimensionId, score, comentario }] }
router.put(
  '/proceso-candidatos/:id/scores',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await reemplazarScores(Number(req.params.id), req.body?.items ?? []));
    } catch (err) {
      return next(err);
    }
  },
);

// PUT /api/proceso-candidatos/:id/observaciones  { items: [{ tipo, texto }] }
router.put(
  '/proceso-candidatos/:id/observaciones',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await reemplazarObservaciones(Number(req.params.id), req.body?.items ?? []));
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
