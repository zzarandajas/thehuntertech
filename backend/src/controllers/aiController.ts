import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { parsearCv, candidatosSugeridos } from '../services/aiService';

// Funciones de IA: parsing de CV y matching mandato ↔ pool (rutas privadas /api).
const router = Router();

// CV en memoria, límite 10 MB (Claude admite el PDF directamente en base64).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/talento/parse-cv  (multipart/form-data, campo `cv`)
router.post(
  '/talento/parse-cv',
  upload.single('cv'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ mensaje: 'Falta el archivo del CV (campo `cv`)' });
      }
      return res.json(await parsearCv(req.file.buffer, req.file.mimetype));
    } catch (err) {
      return next(err);
    }
  },
);

// GET /api/procesos/:id/matches  → candidatos del pool ordenados por idoneidad (IA)
router.get('/procesos/:id/matches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await candidatosSugeridos(Number(req.params.id)));
  } catch (err) {
    return next(err);
  }
});

export default router;
