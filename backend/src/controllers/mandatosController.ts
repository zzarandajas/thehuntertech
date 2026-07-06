import { Router, Request, Response, NextFunction } from 'express';
import {
  listarProcesos,
  obtenerProceso,
  crearProceso,
  actualizarProceso,
  asignarDimensiones,
  asignarConsultores,
} from '../services/mandatosService';

// Mandatos (ProcesoSeleccion). Rutas en el propio controlador.
const router = Router();

// GET /api/procesos
router.get('/procesos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await listarProcesos());
  } catch (err) {
    return next(err);
  }
});

// POST /api/procesos
router.post('/procesos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clienteId, verticalId, titulo } = req.body ?? {};
    if (!clienteId || !verticalId || !titulo) {
      return res
        .status(400)
        .json({ mensaje: 'Cliente, vertical y título son obligatorios' });
    }
    const proceso = await crearProceso(req.body, req.usuario!.sub);
    return res.status(201).json(proceso);
  } catch (err) {
    return next(err);
  }
});

// GET /api/procesos/:id
router.get('/procesos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerProceso(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/procesos/:id
router.patch('/procesos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await actualizarProceso(Number(req.params.id), req.body ?? {}));
  } catch (err) {
    return next(err);
  }
});

// POST /api/procesos/:id/dimensiones  { dimensionIds: number[] }
router.post(
  '/procesos/:id/dimensiones',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dimensionIds } = req.body ?? {};
      if (!Array.isArray(dimensionIds)) {
        return res.status(400).json({ mensaje: 'dimensionIds debe ser un array' });
      }
      return res.json(await asignarDimensiones(Number(req.params.id), dimensionIds));
    } catch (err) {
      return next(err);
    }
  },
);

// POST /api/procesos/:id/consultores  { consultores: [{ usuarioId, rolEnProceso }] }
router.post(
  '/procesos/:id/consultores',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consultores } = req.body ?? {};
      if (!Array.isArray(consultores)) {
        return res.status(400).json({ mensaje: 'consultores debe ser un array' });
      }
      return res.json(await asignarConsultores(Number(req.params.id), consultores));
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
