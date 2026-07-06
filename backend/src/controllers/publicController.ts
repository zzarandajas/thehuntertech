import { Router, Request, Response, NextFunction } from 'express';
import { obtenerInformePorToken } from '../services/informesService';
import { generarPdfInforme } from '../services/pdfService';

// Rutas públicas (sin autenticación) para compartir informes con el Board del cliente.
const router = Router();

// GET /public/informes/:token
router.get('/public/informes/:token', async (req: Request, res: Response, next: NextFunction) => {
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

// GET /public/informes/:token/pdf
router.get('/public/informes/:token/pdf', async (req: Request, res: Response, next: NextFunction) => {
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
