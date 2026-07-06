import { PayloadToken } from '../middlewares/auth';

// Extiende Express.Request para exponer el usuario autenticado (payload del JWT).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

export {};
