import 'dotenv/config'; // Debe ser lo primero para que process.env esté disponible en todos los módulos.
import app from './app';
import sequelize from './config/database';

const PORT = Number(process.env.PORT || 4000);
const MAX_REINTENTOS = 10;
const ESPERA_MS = 3000;

// La BD puede tardar en estar lista (sobre todo en el stack Docker): reintentamos.
async function conectarConReintentos(reintentos = MAX_REINTENTOS): Promise<void> {
  for (let intento = 1; intento <= reintentos; intento++) {
    try {
      await sequelize.authenticate();
      console.log('[db] Conexión Sequelize ↔ MySQL establecida correctamente.');
      return;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      console.warn(`[db] Intento ${intento}/${reintentos} de conexión falló: ${mensaje}`);
      if (intento < reintentos) {
        await new Promise((resolve) => setTimeout(resolve, ESPERA_MS));
      }
    }
  }
  console.error(
    '[db] No se pudo conectar a MySQL tras varios intentos. El servidor HTTP arranca igualmente; revisa la configuración de la BD (backend/.env).',
  );
}

async function iniciar(): Promise<void> {
  await conectarConReintentos();
  app.listen(PORT, () => {
    console.log(`[api] Backend escuchando en http://localhost:${PORT}`);
  });
}

iniciar();
