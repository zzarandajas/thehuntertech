import { Router, Request, Response, NextFunction } from 'express';
import {
  generarInforme,
  listarInformes,
  obtenerInforme,
  crearShareLink,
  revocarShareLink,
} from '../services/informesService';
import { generarPdfInforme } from '../services/pdfService';

// Informes y enlaces de compartición (rutas privadas /api).
const router = Router();

// POST /api/procesos/:id/informes/generar
router.post(
  '/procesos/:id/informes/generar',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const informe = await generarInforme(Number(req.params.id), req.usuario!.sub);
      return res.status(201).json(informe);
    } catch (err) {
      return next(err);
    }
  },
);

// GET /api/procesos/:id/informes
router.get('/procesos/:id/informes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await listarInformes(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// GET /api/informes/:id
router.get('/informes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await obtenerInforme(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

// GET /api/informes/:id/pdf
router.get('/informes/:id/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const informe = await obtenerInforme(Number(req.params.id));
    const buffer = await generarPdfInforme(informe.snapshotJson);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="informe-${informe.id}-v${informe.version}.pdf"`,
    );
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
});

// POST /api/informes/:id/share-links  { expiresInDays? }
router.post('/informes/:id/share-links', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link = await crearShareLink(
      Number(req.params.id),
      req.usuario!.sub,
      req.body?.expiresInDays ? Number(req.body.expiresInDays) : undefined,
    );
    return res.status(201).json(link);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/share-links/:id/revocar
router.patch('/share-links/:id/revocar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await revocarShareLink(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

export default router;
