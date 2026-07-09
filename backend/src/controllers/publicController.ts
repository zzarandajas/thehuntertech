import { Router, Request, Response, NextFunction } from 'express';
import { obtenerInformePorToken } from '../services/informesService';
import { generarPdfInforme } from '../services/pdfService';

// Rutas públicas (sin autenticación) para compartir informes con el Board del cliente.
// Van bajo /api/public/* para que el proxy del frontend (Vite en dev, nginx en prod)
// las enrute al backend sin colisionar con la ruta SPA /public/informes/:token.
const router = Router();

// GET /api/public/informes/:token
router.get('/api/public/informes/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const informe = await obtenerInformePorToken(req.params.token);
    return res.json({
      version: informe.version,
      fechaGeneracion: informe.fechaGeneracion,
      snapshot: informe.snapshotJson,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/public/informes/:token/pdf
router.get('/api/public/informes/:token/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const informe = await obtenerInformePorToken(req.params.token);
    const buffer = await generarPdfInforme(informe.snapshotJson);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="informe-v${informe.version}.pdf"`);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
});

export default router;
