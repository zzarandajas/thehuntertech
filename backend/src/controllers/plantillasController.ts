import { Router, Request, Response, NextFunction } from 'express';
import { requireRole } from '../middlewares/requireRole';
import {
  listarPlantillas,
  obtenerPlantilla,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
  reemplazarEtapasPlantilla,
} from '../services/plantillasService';

// Plantillas de pipeline. Lectura para cualquier usuario autenticado (se usan
// al crear un mandato); escritura solo admin.
const router = Router();

// GET /api/pipeline-plantillas
router.get('/pipeline-plantillas', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await listarPlantillas());
  } catch (err) {
    return next(err);
  }
});

// GET /api/pipeline-plantillas/:id
router.get('/pipeline-plantillas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerPlantilla(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// POST /api/pipeline-plantillas  { nombre, descripcion?, etapas? }
router.post(
  '/pipeline-plantillas',
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(await crearPlantilla(req.body ?? {}));
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/pipeline-plantillas/:id  { nombre?, descripcion? }
router.patch(
  '/pipeline-plantillas/:id',
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await actualizarPlantilla(Number(req.params.id), req.body ?? {}));
    } catch (err) {
      return next(err);
    }
  },
);

// DELETE /api/pipeline-plantillas/:id
router.delete(
  '/pipeline-plantillas/:id',
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await eliminarPlantilla(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  },
);

// PUT /api/pipeline-plantillas/:id/etapas  { etapas: [{ nombre, color?, esFinal? }] }
router.put(
  '/pipeline-plantillas/:id/etapas',
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { etapas } = req.body ?? {};
      if (!Array.isArray(etapas)) {
        return res.status(400).json({ mensaje: 'etapas debe ser un array' });
      }
      return res.json(await reemplazarEtapasPlantilla(Number(req.params.id), etapas));
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
