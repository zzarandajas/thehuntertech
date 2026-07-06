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
  // Errores de validación / unicidad de Sequelize → 400 / 409.
  let status = err.status || 500;
  let mensaje = err.message || 'Error interno del servidor';
  if (err.name === 'SequelizeValidationError') {
    status = 400;
    mensaje = 'Datos no válidos (revisa los rangos y campos obligatorios)';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    mensaje = 'Ya existe un registro con esos datos';
  }
  const cuerpo: Record<string, unknown> = { mensaje };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    cuerpo.stack = err.stack;
  }

  res.status(status).json(cuerpo);
}
