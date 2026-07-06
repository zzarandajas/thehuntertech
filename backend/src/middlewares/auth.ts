import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-inseguro';

export interface PayloadToken {
  sub: number;
  rol: string;
}

// Rutas que NO requieren token (además de todo lo que empiece por /public/).
const RUTAS_PUBLICAS = ['/api/auth/login', '/api/health'];

export function auth(req: Request, res: Response, next: NextFunction) {
  if (RUTAS_PUBLICAS.includes(req.path) || req.path.startsWith('/public/')) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as PayloadToken;
    req.usuario = { sub: Number(payload.sub), rol: payload.rol };
    return next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}
