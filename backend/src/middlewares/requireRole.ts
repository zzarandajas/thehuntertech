import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '../models/Usuario';

// Restringe una ruta a los roles indicados. Debe ejecutarse después de `auth`.
export function requireRole(roles: RolUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol as RolUsuario)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción' });
    }
    return next();
  };
}
