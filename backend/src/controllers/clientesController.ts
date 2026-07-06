import { Router, Request, Response, NextFunction } from 'express';
import {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  listarContactos,
  crearContacto,
} from '../services/clientesService';

// Gestión de clientes y sus contactos. Rutas definidas en el propio controlador.
const router = Router();

// GET /api/clientes
router.get('/clientes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await listarClientes());
  } catch (err) {
    return next(err);
  }
});

// POST /api/clientes
router.post('/clientes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre } = req.body ?? {};
    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre del cliente es obligatorio' });
    }
    return res.status(201).json(await crearCliente(req.body));
  } catch (err) {
    return next(err);
  }
});

// GET /api/clientes/:id
router.get('/clientes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerCliente(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/clientes/:id
router.patch('/clientes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await actualizarCliente(Number(req.params.id), req.body ?? {}));
  } catch (err) {
    return next(err);
  }
});

// GET /api/clientes/:id/contactos
router.get(
  '/clientes/:id/contactos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await listarContactos(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  },
);

// POST /api/clientes/:id/contactos
router.post(
  '/clientes/:id/contactos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, email } = req.body ?? {};
      if (!nombre || !email) {
        return res.status(400).json({ mensaje: 'Nombre y email del contacto son obligatorios' });
      }
      return res.status(201).json(await crearContacto(Number(req.params.id), req.body));
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
