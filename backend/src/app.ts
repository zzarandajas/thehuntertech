import 'dotenv/config'; // Carga backend/.env ANTES de que cualquier módulo lea process.env.
import express, { Application } from 'express';
import cors from 'cors';
import './models'; // Registra modelos y asociaciones al arrancar.
import { auth } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import healthController from './controllers/healthController';
import authController from './controllers/authController';
import usuariosController from './controllers/usuariosController';
import clientesController from './controllers/clientesController';
import catalogosController from './controllers/catalogosController';
import mandatosController from './controllers/mandatosController';
import talentoController from './controllers/talentoController';
import pipelineController from './controllers/pipelineController';
import evaluacionController from './controllers/evaluacionController';
import informesController from './controllers/informesController';
import dashboardController from './controllers/dashboardController';
import tareasController from './controllers/tareasController';
import plantillasController from './controllers/plantillasController';
import aiController from './controllers/aiController';
import publicController from './controllers/publicController';

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
app.use('/api', clientesController);
app.use('/api', catalogosController);
app.use('/api', mandatosController);
app.use('/api', talentoController);
app.use('/api', pipelineController);
app.use('/api', evaluacionController);
app.use('/api', informesController);
app.use('/api', dashboardController);
app.use('/api', tareasController);
app.use('/api', plantillasController);
app.use('/api', aiController);

// Rutas públicas (sin /api, sin autenticación).
app.use(publicController);

app.use(errorHandler);

export default app;
