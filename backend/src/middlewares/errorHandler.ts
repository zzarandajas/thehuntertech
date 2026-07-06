import { Request, Response, NextFunction } from 'express';

interface ErrorConEstado extends Error {
  status?: number;
}

// Manejo de errores centralizado. Nunca expone stack traces en producción.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: ErrorConEstado,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || 500;
  const mensaje = err.message || 'Error interno del servidor';
  const cuerpo: Record<string, unknown> = { mensaje };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    cuerpo.stack = err.stack;
  }

  res.status(status).json(cuerpo);
}
