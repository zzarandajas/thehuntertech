import 'dotenv/config';
import sequelize from '../config/database';
import DimensionCatalogo from '../models/DimensionCatalogo';
import Vertical from '../models/Vertical';
import OrigenCandidato from '../models/OrigenCandidato';
import PipelinePlantilla from '../models/PipelinePlantilla';
import PipelinePlantillaEtapa from '../models/PipelinePlantillaEtapa';
import { ETAPAS_PIPELINE_DEFAULT } from '../constants/etapasPipeline';

// Nota: la lógica vive en `seedCatalogos()` para poder reutilizarla desde el
// arranque del servidor (config/initDb.ts) sin abrir/cerrar la conexión aquí.

// Seed idempotente de catálogos (findOrCreate por clave única). Se puede re-ejecutar.
const DIMENSIONES = [
  { codigo: 'perf_marketing', nombre: 'Performance Marketing (paid, SEM, affiliate)', orden: 1 },
  { codigo: 'gestion_pl', nombre: 'Gestión P&L / Presupuesto de medios a escala', orden: 2 },
  { codigo: 'travel_tech', nombre: 'Travel Tech & conocimiento del sector', orden: 3 },
  { codigo: 'ai_marketing', nombre: 'AI en marketing (integración real)', orden: 4 },
  { codigo: 'liderazgo_global', nombre: 'Liderazgo de equipos globales (30+ personas)', orden: 5 },
  { codigo: 'presencia_ejecutiva', nombre: 'Presencia ejecutiva / Board & inversores', orden: 6 },
];

const VERTICALES = [
  { codigo: 'consejos', nombre: 'Consejos y Consejos Asesores' },
  { codigo: 'cio_cto_ciso', nombre: 'CIO/CTO/CISO' },
  { codigo: 'director_digital', nombre: 'Director Digital' },
  { codigo: 'director_datos', nombre: 'Director de Datos' },
  { codigo: 'ceo_dg', nombre: 'CEO/Director General' },
  { codigo: 'cmo_cro', nombre: 'CMO/CRO' },
  { codigo: 'cfo', nombre: 'CFO' },
  { codigo: 'heads_eng_sales_data', nombre: 'Heads of Engineering/Sales/Data' },
];

const ORIGENES = ['CIONET', 'Red de socios', 'Sourcing directo', 'Comunidad THT', 'Referido'];

// Siembra idempotente de catálogos. No abre ni cierra la conexión: asume que la
// instancia de Sequelize ya está autenticada (la app en runtime o el script main).
export async function seedCatalogos(): Promise<void> {
  for (const d of DIMENSIONES) {
    await DimensionCatalogo.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
  }
  for (const v of VERTICALES) {
    await Vertical.findOrCreate({ where: { codigo: v.codigo }, defaults: v });
  }
  for (const nombre of ORIGENES) {
    await OrigenCandidato.findOrCreate({ where: { nombre }, defaults: { nombre } });
  }

  // Plantilla de pipeline por defecto (idempotente). La migración también la
  // crea; esto cubre entornos que solo ejecutan los seeds.
  const [plantilla, creada] = await PipelinePlantilla.findOrCreate({
    where: { esDefault: true },
    defaults: {
      nombre: 'Por defecto',
      descripcion: 'Pipeline estándar de executive search.',
      esDefault: true,
    },
  });
  if (creada) {
    await PipelinePlantillaEtapa.bulkCreate(
      ETAPAS_PIPELINE_DEFAULT.map((e, i) => ({
        plantillaId: plantilla.id,
        nombre: e.nombre,
        orden: i,
        color: e.color,
        esFinal: e.esFinal,
      })),
    );
  }

  console.log(
    `[seed:catalogos] Dimensiones=${DIMENSIONES.length} Verticales=${VERTICALES.length} ` +
      `Origenes=${ORIGENES.length} Plantilla="${plantilla.nombre}"`,
  );
}

// Punto de entrada como script (npm run seed:catalogos): gestiona la conexión.
async function main() {
  await sequelize.authenticate();
  await seedCatalogos();
  await sequelize.close();
}

// Solo ejecuta main() si se invoca directamente como script, no al importarlo.
if (require.main === module) {
  main().catch((err) => {
    console.error('[seed:catalogos] Error:', err);
    process.exit(1);
  });
}
