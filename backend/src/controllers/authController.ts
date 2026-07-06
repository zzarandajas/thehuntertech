import { Router, Request, Response, NextFunction } from 'express';
import { login, obtenerUsuarioAutenticado } from '../services/authService';

// El controlador define sus rutas y delega la lógica en authService.
const router = Router();

// POST /api/auth/login
router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }
    const resultado = await login({ email, password });
    return res.json(resultado);
  } catch (err) {
    return next(err);
  }
});

// GET /api/auth/me
router.get('/auth/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await obtenerUsuarioAutenticado(req.usuario!.sub);
    return res.json(usuario);
  } catch (err) {
    return next(err);
  }
});

export default router;
