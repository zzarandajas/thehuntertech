import { Router, Request, Response, NextFunction } from 'express';
import {
  obtenerPipeline,
  agregarCandidato,
  actualizarProcesoCandidato,
  eliminarProcesoCandidato,
} from '../services/pipelineService';

// Pipeline (ProcesoCandidato). Rutas en el propio controlador.
const router = Router();

// GET /api/procesos/:id/pipeline
router.get('/procesos/:id/pipeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerPipeline(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// POST /api/procesos/:id/candidatos  { candidatoId }
router.post('/procesos/:id/candidatos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidatoId } = req.body ?? {};
    if (!candidatoId) {
      return res.status(400).json({ mensaje: 'candidatoId es obligatorio' });
    }
    return res.status(201).json(await agregarCandidato(Number(req.params.id), Number(candidatoId)));
  } catch (err) {
    const e = err as { status?: number; message?: string; procesoCandidatoId?: number };
    if (e.status === 409) {
      return res
        .status(409)
        .json({ mensaje: e.message, procesoCandidatoId: e.procesoCandidatoId });
    }
    return next(err);
  }
});

// PATCH /api/proceso-candidatos/:id
router.patch('/proceso-candidatos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await actualizarProcesoCandidato(Number(req.params.id), req.body ?? {}));
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/proceso-candidatos/:id
router.delete('/proceso-candidatos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await eliminarProcesoCandidato(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

export default router;
