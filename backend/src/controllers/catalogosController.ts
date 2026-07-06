import { Router, Request, Response, NextFunction } from 'express';
import { requireRole } from '../middlewares/requireRole';
import { dimensiones, verticales, skills, origenes } from '../services/catalogosService';

// Catálogos: lectura para cualquier usuario autenticado, escritura solo admin.
const router = Router();

type CrudCatalogo = {
  listar: () => Promise<unknown>;
  crear: (datos: Record<string, unknown>) => Promise<unknown>;
  actualizar: (id: number, cambios: Record<string, unknown>) => Promise<unknown>;
};

// Registra GET (listar), POST (crear, admin) y PATCH (actualizar, admin) para un catálogo.
function registrarCatalogo(ruta: string, crud: CrudCatalogo, camposRequeridos: string[]) {
  router.get(`/${ruta}`, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await crud.listar());
    } catch (err) {
      return next(err);
    }
  });

  router.post(
    `/${ruta}`,
    requireRole(['admin']),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const cuerpo = req.body ?? {};
        const faltan = camposRequeridos.filter((c) => !cuerpo[c]);
        if (faltan.length) {
          return res.status(400).json({ mensaje: `Faltan campos: ${faltan.join(', ')}` });
        }
        return res.status(201).json(await crud.crear(cuerpo));
      } catch (err) {
        return next(err);
      }
    },
  );

  router.patch(
    `/${ruta}/:id`,
    requireRole(['admin']),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        return res.json(await crud.actualizar(Number(req.params.id), req.body ?? {}));
      } catch (err) {
        return next(err);
      }
    },
  );
}

registrarCatalogo('dimensiones', dimensiones, ['codigo', 'nombre']);
registrarCatalogo('verticales', verticales, ['codigo', 'nombre']);
registrarCatalogo('skills', skills, ['nombre']);
registrarCatalogo('origenes', origenes, ['nombre']);

export default router;
