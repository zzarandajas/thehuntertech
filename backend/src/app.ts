import 'dotenv/config'; // Carga backend/.env ANTES de que cualquier módulo lea process.env.
import express, { Application } from 'express';
import cors from 'cors';
import { auth } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import healthController from './controllers/healthController';
import authController from './controllers/authController';
import usuariosController from './controllers/usuariosController';

// Capa de aplicación: autenticación global + UNIÓN de los endpoints de todos los
// controladores bajo /api, y manejo de errores centralizado al final.
const app: Application = express();

app.use(cors());
app.use(express.json());

// Verifica JWT en todo excepto /api/auth/login, /api/health y /public/*.
app.use(auth);

app.use('/api', healthController);
app.use('/api', authController);
app.use('/api', usuariosController);
// Próximos sprints: app.use('/api', clientesController); ...

app.use(errorHandler);

export default app;
