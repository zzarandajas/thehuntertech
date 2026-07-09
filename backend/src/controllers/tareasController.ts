import { Router, Request, Response, NextFunction } from 'express';
import {
  listarTareas,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
} from '../services/taskService';

// Tareas / recordatorios del consultor (rutas privadas /api).
const router = Router();

// GET /api/tareas?asignadoA=&pendientes=&overdue=&candidatoId=&procesoId=&clienteId=
router.get('/tareas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query;
    return res.json(
      await listarTareas({
        asignadoA: q.asignadoA ? Number(q.asignadoA) : undefined,
        pendientes: q.pendientes === 'true',
        overdue: q.overdue === 'true',
        candidatoId: q.candidatoId ? Number(q.candidatoId) : undefined,
        procesoId: q.procesoId ? Number(q.procesoId) : undefined,
        clienteId: q.clienteId ? Number(q.clienteId) : undefined,
      }),
    );
  } catch (err) {
    return next(err);
  }
});

// POST /api/tareas
router.post('/tareas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(201).json(await crearTarea(req.body ?? {}, req.usuario!.sub));
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/tareas/:id  (editar / completar)
router.patch('/tareas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await actualizarTarea(Number(req.params.id), req.body ?? {}));
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/tareas/:id
router.delete('/tareas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await eliminarTarea(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

export default router;
