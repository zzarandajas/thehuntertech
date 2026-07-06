import { Router, Request, Response, NextFunction } from 'express';
import {
  listarCandidatos,
  obtenerCandidato,
  crearCandidato,
  actualizarCandidato,
  reemplazarExperiencia,
  reemplazarSkills,
  crearInteraccion,
  crearDocumento,
  type FiltrosTalento,
} from '../services/talentoService';
import type { Disponibilidad } from '../models/Candidato';

// Base de talento (candidatos). Rutas en el propio controlador.
const router = Router();

// GET /api/candidatos?search=&skill_id=&disponibilidad=&origen_id=
router.get('/candidatos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros: FiltrosTalento = {
      search: (req.query.search as string) || undefined,
      skillId: req.query.skill_id ? Number(req.query.skill_id) : undefined,
      disponibilidad: (req.query.disponibilidad as Disponibilidad) || undefined,
      origenId: req.query.origen_id ? Number(req.query.origen_id) : undefined,
    };
    return res.json(await listarCandidatos(filtros));
  } catch (err) {
    return next(err);
  }
});

// POST /api/candidatos (con deduplicación)
router.post('/candidatos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body?.nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }
    return res.status(201).json(await crearCandidato(req.body));
  } catch (err) {
    // Deduplicación: devolver también el id existente.
    const e = err as { status?: number; message?: string; candidatoId?: number };
    if (e.status === 409) {
      return res.status(409).json({ mensaje: e.message, candidatoId: e.candidatoId });
    }
    return next(err);
  }
});

// GET /api/candidatos/:id
router.get('/candidatos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerCandidato(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/candidatos/:id
router.patch('/candidatos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await actualizarCandidato(Number(req.params.id), req.body ?? {}));
  } catch (err) {
    return next(err);
  }
});

// PUT /api/candidatos/:id/experiencia  { items: [...] }
router.put('/candidatos/:id/experiencia', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = req.body?.items ?? [];
    return res.json(await reemplazarExperiencia(Number(req.params.id), items));
  } catch (err) {
    return next(err);
  }
});

// PUT /api/candidatos/:id/skills  { items: [{ skillId, nivel }] }
router.put('/candidatos/:id/skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = req.body?.items ?? [];
    return res.json(await reemplazarSkills(Number(req.params.id), items));
  } catch (err) {
    return next(err);
  }
});

// POST /api/candidatos/:id/interacciones
router.post(
  '/candidatos/:id/interacciones',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body?.tipo) {
        return res.status(400).json({ mensaje: 'El tipo de interacción es obligatorio' });
      }
      return res
        .status(201)
        .json(await crearInteraccion(Number(req.params.id), req.body, req.usuario!.sub));
    } catch (err) {
      return next(err);
    }
  },
);

// POST /api/candidatos/:id/documentos  { tipo, nombreArchivo, path }
router.post(
  '/candidatos/:id/documentos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombreArchivo, path } = req.body ?? {};
      if (!nombreArchivo || !path) {
        return res.status(400).json({ mensaje: 'nombreArchivo y path son obligatorios' });
      }
      return res
        .status(201)
        .json(await crearDocumento(Number(req.params.id), req.body, req.usuario!.sub));
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
