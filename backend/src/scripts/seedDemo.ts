import 'dotenv/config';
import {
  sequelize,
  Usuario,
  Cliente,
  Vertical,
  DimensionCatalogo,
  ProcesoSeleccion,
  ProcesoDimension,
  Candidato,
  CandidatoExperiencia,
  ProcesoCandidato,
  ProcesoEtapa,
  CandidatoMetrica,
  CandidatoDimensionScore,
  CandidatoObservacion,
} from '../models';
import { ETAPAS_PIPELINE_DEFAULT, ENUM_ETAPA_A_ORDEN } from '../constants/etapasPipeline';

// ---------------------------------------------------------------------------
// Seed de DEMO: crea un mandato CMO/CRO completo con 4 candidatos evaluados,
// suficiente para pulsar "Generar informe" y ver el PDF ejecutivo con datos
// realistas. Idempotente: reejecutar borra el mandato demo (cascada) y lo
// vuelve a crear. Requiere antes `seed:catalogos` y `seed:admin`.
// ---------------------------------------------------------------------------

const CLIENTE_DEMO = 'Nomad Travel Group (Demo)';
const TITULO_DEMO = 'Proceso de selección: Chief Marketing Officer / Chief Revenue Officer';

interface ScoreDef {
  codigo: string;
  score: number;
  comentario?: string;
}
interface CandidatoDef {
  email: string;
  nombre: string;
  ciudad: string;
  idiomas: string;
  formacion: string;
  posicion: string;
  expectativa: string;
  etapa: keyof typeof ENUM_ETAPA_A_ORDEN;
  experiencias: { empresa: string; cargo: string; periodo: string; descripcion: string }[];
  metricas: { valor: string; descripcion: string }[];
  scores: ScoreDef[];
  fortalezas: string[];
  puntos: string[];
}

const CANDIDATOS: CandidatoDef[] = [
  {
    email: 'demo.candidato1@thehunter.tech',
    nombre: 'Elena Marchetti',
    ciudad: 'Barcelona',
    idiomas: 'Italiano (nativo), inglés (nativo), español (fluido)',
    formacion: 'B.A. Politics with Economics — Goldsmiths, University of London',
    posicion: 'SVP Global Marketing & AI Enablement · Exoticca · Barcelona',
    expectativa: '175 K€ fijo + 30% variable + equity',
    etapa: 'shortlist',
    experiencias: [
      { empresa: 'Expedia Group', cargo: 'Senior Director Global Marketing', periodo: '2004–2014', descripcion: 'Equipos de 30 personas, campañas multi-mercado, +45% leads anuales.' },
      { empresa: 'ABA English', cargo: 'CMO', periodo: '2015–2016', descripcion: 'Superó objetivos de revenue en un 30% YoY.' },
      { empresa: 'eDreams Odigeo', cargo: 'Group Sr. Director Performance Marketing', periodo: '2016–2019', descripcion: 'Presupuesto: 120M€+, revenue: 800M€, equipo de 30 personas.' },
      { empresa: 'Mad Collective', cargo: 'CEO', periodo: '2019–2023', descripcion: '100M€ de revenue anual, 12M€ de beneficio operativo.' },
      { empresa: 'Exoticca', cargo: 'SVP Global Marketing & AI Enablement', periodo: 'ene 2025–actual', descripcion: 'Integración de IA en todos los canales de marketing.' },
    ],
    metricas: [
      { valor: '120M €+', descripcion: 'Presupuesto de medios gestionado en eDreams' },
      { valor: '800M €', descripcion: 'Revenue generado en eDreams Odigeo' },
      { valor: '10 años', descripcion: 'Liderando marketing global en Expedia Group' },
    ],
    scores: [
      { codigo: 'perf_marketing', score: 95 },
      { codigo: 'gestion_pl', score: 95 },
      { codigo: 'travel_tech', score: 90 },
      { codigo: 'ai_marketing', score: 90 },
      { codigo: 'liderazgo_global', score: 80 },
      { codigo: 'presencia_ejecutiva', score: 90 },
    ],
    fortalezas: [
      'Ha ejercido como CMO y CEO. Habla el idioma de revenue y márgenes.',
      'Experiencia directa en travel tech: Expedia (10 años), eDreams y Exoticca.',
      'Gestión de presupuesto de medios en escala muy similar a la del cliente (120M€+).',
      'Integración activa de IA en marketing (rol actual en Exoticca).',
    ],
    puntos: ['Profundizar su capacidad para alinear y movilizar múltiples stakeholders.'],
  },
  {
    email: 'demo.candidato2@thehunter.tech',
    nombre: 'Julien Moreau',
    ciudad: 'Londres',
    idiomas: 'Inglés (nativo), francés (nativo)',
    formacion: 'BBA Université de Sherbrooke + University of West Florida',
    posicion: 'Fractional CMO / Growth & Commercial Advisor · Synapto · Londres',
    expectativa: '180 K€ fijo + 40–50% variable + equity',
    etapa: 'presentado',
    experiencias: [
      { empresa: 'eBay Classifieds / Kijiji Canada', cargo: 'Head of Consumer Marketing', periodo: '2012–2018', descripcion: 'Budget C$25M. Usuarios: 7M → 18M.' },
      { empresa: 'StubHub', cargo: 'Head of Marketing UK/DACH/Nordics', periodo: '2018–2021', descripcion: 'Budget £4M. Compradores activos +65%, ROAS +35%.' },
      { empresa: 'TheFork / Tripadvisor', cargo: 'Director of Marketing UK, Suecia y Países Bajos', periodo: '2021–2024', descripcion: 'Budget €8M, equipo de 14. Revenue 2x, usuarios UK: miles → 250.000 en 2,5 años.' },
      { empresa: 'Spabreaks.com', cargo: 'Chief Commercial & Marketing Officer', periodo: '2024–2025', descripcion: 'P&L total online, equipo 20+. Revenue 15% → 40% YoY, EBITDA +15%. Posicionó la empresa para adquisición por PE en Q4 2025.' },
      { empresa: 'Synapto', cargo: 'Fractional CMO', periodo: 'feb 2026–actual', descripcion: 'Construcción de GTM desde cero para embedded payments.' },
    ],
    metricas: [
      { valor: '15% → 40%', descripcion: 'Crecimiento de revenue YoY en Spabreaks.com' },
      { valor: '+35%', descripcion: 'Mejora de conversión tras rediseño del funnel' },
      { valor: '7M → 18M', descripcion: 'Usuarios únicos mensuales escalados en Kijiji' },
    ],
    scores: [
      { codigo: 'perf_marketing', score: 92 },
      { codigo: 'gestion_pl', score: 90 },
      { codigo: 'travel_tech', score: 75 },
      { codigo: 'ai_marketing', score: 70 },
      { codigo: 'liderazgo_global', score: 80 },
      { codigo: 'presencia_ejecutiva', score: 78 },
    ],
    fortalezas: [
      'Track record consistente como CCO/CMO con accountability total sobre P&L online.',
      'Historial de crecimiento de revenue en cada empresa que ha gestionado.',
      'Full-funnel real: adquisición, conversión, retención y pricing como sistema único.',
      'Ha liderado auditoría y rediseño de martech stack con enfoque hacia IA.',
    ],
    puntos: [
      'El presupuesto de medios manejado es de un máximo de €8M en TheFork. Chequear el salto de escala respecto al cliente.',
    ],
  },
  {
    email: 'demo.candidato3@thehunter.tech',
    nombre: 'Katarzyna Nowak',
    ciudad: 'Ámsterdam',
    idiomas: 'Inglés (nativo), polaco (nativo), alemán (intermedio-alto)',
    formacion: 'MSc International Management — CEMS (Rotterdam School of Mgmt & Bocconi)',
    posicion: 'Growth Director (Product & Marketing) EU · Trip.com · Ámsterdam',
    expectativa: '185 K€ fijo + 1–3 meses bonus + stock options 20–40 K€',
    etapa: 'entrevista_cliente',
    experiencias: [
      { empresa: 'Uber Poland', cargo: 'Empleado n.º 6', periodo: '2015–2018', descripcion: 'Base de usuarios: 50K → 1,7M. Lanzó Uber en 4 ciudades.' },
      { empresa: 'Uber EMEA', cargo: 'Senior Performance Marketing Manager', periodo: '2018–2020', descripcion: 'Budget digital 10M+ USD. Full-funnel strategy: –15% CPA.' },
      { empresa: 'Uber Global', cargo: 'Senior Central Operations Manager', periodo: '2020–2021', descripcion: "Lideró 'Product Discoverability' como una de las 15 prioridades globales bajo el COO." },
      { empresa: 'Uber EMEA', cargo: 'User Growth Lead', periodo: '2021–2022', descripcion: 'ML algorithm para selección de producto in-app (100M+ USD impact). Go-to-market Uber One: 4x crecimiento.' },
      { empresa: 'Trip.com EU', cargo: 'Growth Director', periodo: 'ene 2024–actual', descripcion: 'Equipo de 35 FTE. P&L de usuario en 6 mercados europeos (GB, DE, FR, ES, IT, NL).' },
    ],
    metricas: [
      { valor: '35 FTE', descripcion: 'Equipo actual en Trip.com EU (6 mercados)' },
      { valor: '–15% CPA', descripcion: 'Reducción de coste por adquisición en Uber EMEA' },
      { valor: '4x', descripcion: 'Crecimiento de Uber One EMEA bajo su liderazgo' },
    ],
    scores: [
      { codigo: 'perf_marketing', score: 80 },
      { codigo: 'gestion_pl', score: 55, comentario: 'Presupuesto de medios máximo gestionado: 10M USD. Chequear el salto de escala respecto al cliente.' },
      { codigo: 'travel_tech', score: 85 },
      { codigo: 'ai_marketing', score: 75 },
      { codigo: 'liderazgo_global', score: 75 },
      { codigo: 'presencia_ejecutiva', score: 45 },
    ],
    fortalezas: [
      'Trayectoria sólida en Uber y Trip.com, dos empresas de referencia en tech/travel a escala global.',
      'Dominio real de growth, performance marketing y experimentación en entornos de hipercrecimiento.',
      'Perfil cuantitativo fuerte, formación en economía cuantitativa y dominio de SQL y analytics.',
      'Liderazgo de un equipo cross-funcional de 35 personas en 6 mercados europeos.',
    ],
    puntos: [
      'Presupuesto de medios máximo gestionado: 10M USD. Chequear el salto de escala respecto al cliente.',
    ],
  },
  {
    email: 'demo.candidato4@thehunter.tech',
    nombre: 'Marc Dubois',
    ciudad: 'Barcelona',
    idiomas: 'Francés (nativo), español, inglés y portugués (fluidos)',
    formacion: 'Master Management Science — KEDGE Business School + Licenciatura en Economía — Université Montpellier',
    posicion: 'Regional General Manager · Glovo · Barcelona',
    expectativa: '165 K€ fijo + 32 K€ variable + 70 K€ equity garantizado',
    etapa: 'presentado',
    experiencias: [
      { empresa: 'Glovo', cargo: 'RGM para Serbia, Croacia, Montenegro, Moldavia y Bosnia', periodo: 'sept 2024–actual', descripcion: '400 HC, 1,5B€ GMV. Previamente GM Romania (1B€ GMV, 30M€ EBITDA) y GM Ivory Coast/Ghana.' },
      { empresa: 'Cabify', cargo: 'Director General', periodo: '2020–2021', descripcion: 'P&L de 80 HC. Market share: 25% → 40%.' },
      { empresa: 'Badi', cargo: 'VP Operations & New Markets', periodo: '2018–2020', descripcion: 'Creó y escaló CX, ventas, operaciones y expansión. 80 HC, $50M captados.' },
      { empresa: 'ByHours', cargo: 'Co-fundador y Director Operaciones & Estrategia', periodo: '2014–2018', descripcion: 'Travel tech, $18M captados. Expansión en Europa y LATAM.' },
    ],
    metricas: [
      { valor: '400 HC', descripcion: 'Personas a cargo como RGM en Glovo (6 mercados)' },
      { valor: '1,5B€ GMV', descripcion: 'Bajo su responsabilidad como RGM en Glovo' },
      { valor: '25% → 40%', descripcion: 'Market share en España durante su etapa en Cabify' },
    ],
    scores: [
      { codigo: 'perf_marketing', score: 20 },
      { codigo: 'gestion_pl', score: 95 },
      { codigo: 'travel_tech', score: 65 },
      { codigo: 'ai_marketing', score: 10 },
      { codigo: 'liderazgo_global', score: 90 },
      { codigo: 'presencia_ejecutiva', score: 70 },
    ],
    fortalezas: [
      'Gestiona P&L, operaciones y equipos a gran escala.',
      'Experiencia emprendedora (ByHours, $18M captados) y en travel tech.',
      'Sólida experiencia en lanzamiento de mercados e internacionalización estructurada.',
    ],
    puntos: [
      'Perfil de GM/COO, con fuerte orientación a growth. Explorar su expertise en el área de marketing.',
    ],
  },
];

async function main() {
  await sequelize.authenticate();

  const admin = await Usuario.findOne({ order: [['id', 'ASC']] });
  if (!admin) {
    console.error('[seed:demo] No hay usuario admin. Ejecuta primero `npm run seed:admin`.');
    process.exit(1);
  }

  const vertical = await Vertical.findOne({ where: { codigo: 'cmo_cro' } });
  const dimensiones = await DimensionCatalogo.findAll({ order: [['orden', 'ASC']] });
  if (!vertical || dimensiones.length === 0) {
    console.error('[seed:demo] Faltan catálogos. Ejecuta primero `npm run seed:catalogos`.');
    process.exit(1);
  }
  const dimByCodigo = new Map(dimensiones.map((d) => [d.codigo, d.id]));

  const [cliente] = await Cliente.findOrCreate({
    where: { nombre: CLIENTE_DEMO },
    defaults: { nombre: CLIENTE_DEMO, sector: 'Travel Tech' },
  });

  // Borra el mandato demo anterior (cascada: participantes, dimensiones, métricas,
  // scores, observaciones e informes) para dejar un estado limpio.
  const previo = await ProcesoSeleccion.findOne({
    where: { titulo: TITULO_DEMO, clienteId: cliente.id },
  });
  if (previo) {
    await previo.destroy();
  }

  const proceso = await ProcesoSeleccion.create({
    clienteId: cliente.id,
    verticalId: vertical.id,
    titulo: TITULO_DEMO,
    confidencialidad: 'Confidencial — uso exclusivo del Board del Cliente',
    estado: 'abierto',
    anonimizarNombres: false,
    createdBy: admin.id,
  });

  await ProcesoDimension.bulkCreate(
    dimensiones.map((d, i) => ({ procesoId: proceso.id, dimensionId: d.id, orden: i + 1 })),
  );

  // Etapas propias del mandato demo (copia del set por defecto).
  const etapasDemo = await ProcesoEtapa.bulkCreate(
    ETAPAS_PIPELINE_DEFAULT.map((e, i) => ({
      procesoId: proceso.id,
      nombre: e.nombre,
      orden: i,
      color: e.color,
      esFinal: e.esFinal,
    })),
  );

  for (const [idx, def] of CANDIDATOS.entries()) {
    const [cand] = await Candidato.findOrCreate({
      where: { email: def.email },
      defaults: {
        nombre: def.nombre,
        email: def.email,
        ciudadResidencia: def.ciudad,
        idiomas: def.idiomas,
        formacion: def.formacion,
        disponibilidad: 'abierto_a_ofertas',
        consentimientoRgpd: true,
      },
    });
    // Actualiza por si ya existía de una ejecución previa.
    cand.nombre = def.nombre;
    cand.ciudadResidencia = def.ciudad;
    cand.idiomas = def.idiomas;
    cand.formacion = def.formacion;
    await cand.save();

    await CandidatoExperiencia.destroy({ where: { candidatoId: cand.id } });
    await CandidatoExperiencia.bulkCreate(
      def.experiencias.map((x, i) => ({ candidatoId: cand.id, ...x, orden: i + 1 })),
    );

    const pc = await ProcesoCandidato.create({
      procesoId: proceso.id,
      candidatoId: cand.id,
      orden: idx + 1,
      etapaId: etapasDemo[ENUM_ETAPA_A_ORDEN[def.etapa] - 1].id,
      posicionActualSnapshot: def.posicion,
      expectativaSalarial: def.expectativa,
      etapaActualizadaAt: new Date(),
    });

    await CandidatoMetrica.bulkCreate(
      def.metricas.map((m, i) => ({ procesoCandidatoId: pc.id, ...m, orden: i + 1 })),
    );

    await CandidatoDimensionScore.bulkCreate(
      def.scores
        .filter((sc) => dimByCodigo.has(sc.codigo))
        .map((sc) => ({
          procesoCandidatoId: pc.id,
          dimensionId: dimByCodigo.get(sc.codigo)!,
          score: sc.score,
          comentario: sc.comentario ?? null,
        })),
    );

    await CandidatoObservacion.bulkCreate([
      ...def.fortalezas.map((texto, i) => ({
        procesoCandidatoId: pc.id,
        tipo: 'fortaleza' as const,
        texto,
        orden: i + 1,
      })),
      ...def.puntos.map((texto, i) => ({
        procesoCandidatoId: pc.id,
        tipo: 'punto_explorar' as const,
        texto,
        orden: i + 1,
      })),
    ]);
  }

  console.log(
    `[seed:demo] Mandato demo listo (procesoId=${proceso.id}, cliente="${CLIENTE_DEMO}") ` +
      `con ${CANDIDATOS.length} candidatos evaluados. Abre el mandato y pulsa "Generar informe".`,
  );
  await sequelize.close();
}

main().catch((err) => {
  console.error('[seed:demo] Error:', err);
  process.exit(1);
});
