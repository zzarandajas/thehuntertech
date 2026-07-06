import { Router, Request, Response, NextFunction } from 'express';
import { requireRole } from '../middlewares/requireRole';
import {
  listarUsuarios,
  listarUsuariosSeleccionables,
  crearUsuario,
  actualizarUsuario,
} from '../services/usuariosService';

// Gestión de usuarios — solo rol admin (excepto el selector). Rutas en el controlador.
const router = Router();

// GET /api/usuarios/seleccionables — cualquier usuario autenticado (para selectores).
router.get(
  '/usuarios/seleccionables',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await listarUsuariosSeleccionables());
    } catch (err) {
      return next(err);
    }
  },
);

// GET /api/usuarios
router.get(
  '/usuarios',
  requireRole(['admin']),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await listarUsuarios());
    } catch (err) {
      return next(err);
    }
  },
);

// POST /api/usuarios
router.post(
  '/usuarios',
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, email, password, rol } = req.body ?? {};
      if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
      }
      return res.status(201).json(await crearUsuario({ nombre, email, password, rol }));
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/usuarios/:id
router.patch(
  '/usuarios/:id',
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await actualizarUsuario(Number(req.params.id), req.body ?? {}));
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
