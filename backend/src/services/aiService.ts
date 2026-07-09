import Anthropic from '@anthropic-ai/sdk';
import { Candidato, CandidatoExperiencia, CandidatoSkill, Skill, ProcesoSeleccion, ProcesoDimension, DimensionCatalogo, Cliente, Vertical } from '../models';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

// Modelo por defecto: Claude Opus 4.8. Configurable con ANTHROPIC_MODEL
// (p.ej. `claude-sonnet-5` para reducir coste en alto volumen).
const MODELO = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

// Cliente perezoso: si no hay API key, degradamos con un 503 claro en vez de
// romper el arranque de la app.
let cliente: Anthropic | null = null;
function obtenerCliente(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw error(503, 'Funciones de IA no disponibles: falta ANTHROPIC_API_KEY en el backend');
  }
  if (!cliente) {
    cliente = new Anthropic();
  }
  return cliente;
}

// Ejecuta una llamada a Claude y traduce los errores de la API a un mensaje claro
// (p.ej. saldo insuficiente, clave inválida) con status 502, en vez de propagar el
// JSON crudo con status 400 que la UI confundiría con "el archivo no es PDF".
async function invocar<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detalle = (e as any).error?.error?.message ?? e.message;
      throw error(502, `Error de la IA: ${detalle}`);
    }
    throw e;
  }
}

// Extrae el primer bloque de texto de una respuesta de Claude.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textoDe(respuesta: any): string {
  const bloque = (respuesta.content ?? []).find((b: { type: string }) => b.type === 'text');
  return bloque?.text ?? '';
}

// ---------------------------------------------------------------------------
// 1) Parsing de CV → datos estructurados para prellenar el alta de candidato.
// ---------------------------------------------------------------------------

export interface CvParseado {
  nombre: string;
  email: string;
  telefono: string;
  linkedinUrl: string;
  ciudadResidencia: string;
  idiomas: string;
  formacion: string;
  experiencias: { empresa: string; cargo: string; periodo: string; descripcion: string }[];
  skills: string[];
}

const ESQUEMA_CV = {
  type: 'object',
  additionalProperties: false,
  properties: {
    nombre: { type: 'string' },
    email: { type: 'string' },
    telefono: { type: 'string' },
    linkedinUrl: { type: 'string' },
    ciudadResidencia: { type: 'string' },
    idiomas: { type: 'string' },
    formacion: { type: 'string' },
    experiencias: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          empresa: { type: 'string' },
          cargo: { type: 'string' },
          periodo: { type: 'string' },
          descripcion: { type: 'string' },
        },
        required: ['empresa', 'cargo', 'periodo', 'descripcion'],
      },
    },
    skills: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'nombre',
    'email',
    'telefono',
    'linkedinUrl',
    'ciudadResidencia',
    'idiomas',
    'formacion',
    'experiencias',
    'skills',
  ],
} as const;

export async function parsearCv(buffer: Buffer, mimetype: string): Promise<CvParseado> {
  if (mimetype !== 'application/pdf') {
    throw error(400, 'Sólo se admiten CVs en PDF');
  }
  const client = obtenerCliente();
  const base64 = buffer.toString('base64');

  const respuesta = await invocar(() =>
    client.messages.create({
      model: MODELO,
      max_tokens: 16000,
      output_config: {
        format: {
          type: 'json_schema',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          schema: ESQUEMA_CV as any,
        },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text:
                'Extrae los datos de este CV para dar de alta a un candidato de executive search. ' +
                'Devuelve cadenas vacías para lo que no aparezca; no inventes datos. ' +
                'En experiencias, ordena de más reciente a más antigua. En skills, lista tecnologías ' +
                'y competencias concretas (no frases).',
            },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  );

  try {
    return JSON.parse(textoDe(respuesta)) as CvParseado;
  } catch {
    throw error(502, 'La IA no devolvió un resultado válido al parsear el CV');
  }
}

// ---------------------------------------------------------------------------
// 2) Matching mandato ↔ pool de talento: ranking con justificación.
// ---------------------------------------------------------------------------

export interface MatchCandidato {
  candidatoId: number;
  nombre: string;
  score: number;
  justificacion: string;
}

const ESQUEMA_MATCH = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ranking: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          candidatoId: { type: 'integer' },
          score: { type: 'integer' },
          justificacion: { type: 'string' },
        },
        required: ['candidatoId', 'score', 'justificacion'],
      },
    },
  },
  required: ['ranking'],
} as const;

// Nº máximo de candidatos del pool que se envían al modelo (control de coste/tokens).
const MAX_POOL = 40;

export async function candidatosSugeridos(procesoId: number): Promise<MatchCandidato[]> {
  const proceso = await ProcesoSeleccion.findByPk(procesoId, {
    include: [
      { model: Cliente, as: 'cliente', attributes: ['nombre'] },
      { model: Vertical, as: 'vertical', attributes: ['nombre'] },
      {
        model: ProcesoDimension,
        as: 'dimensiones',
        include: [{ model: DimensionCatalogo, as: 'dimension', attributes: ['nombre'] }],
      },
    ],
  });
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  const client = obtenerCliente();

  const candidatos = await Candidato.findAll({
    include: [
      { model: CandidatoExperiencia, as: 'experiencias', attributes: ['empresa', 'cargo', 'periodo'] },
      {
        model: CandidatoSkill,
        as: 'skills',
        include: [{ model: Skill, as: 'skill', attributes: ['nombre'] }],
      },
    ],
    limit: MAX_POOL,
    order: [['ultimaActividadAt', 'DESC']],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = proceso as any;
  const mandato = {
    titulo: p.titulo,
    cliente: p.cliente?.nombre ?? '',
    vertical: p.vertical?.nombre ?? '',
    dimensiones: (p.dimensiones ?? []).map((d: { dimension?: { nombre?: string } }) => d.dimension?.nombre ?? ''),
  };

  const pool = candidatos.map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const x = c as any;
    return {
      candidatoId: x.id,
      nombre: x.nombre,
      ciudad: x.ciudadResidencia,
      formacion: x.formacion,
      skills: (x.skills ?? []).map((s: { skill?: { nombre?: string } }) => s.skill?.nombre).filter(Boolean),
      experiencias: (x.experiencias ?? []).map((e: { empresa: string; cargo: string; periodo: string }) => ({
        empresa: e.empresa,
        cargo: e.cargo,
        periodo: e.periodo,
      })),
    };
  });

  const respuesta = await invocar(() =>
    client.messages.create({
      model: MODELO,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: {
          type: 'json_schema',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          schema: ESQUEMA_MATCH as any,
        },
      },
      messages: [
        {
          role: 'user',
          content:
            'Eres consultor de executive search. Puntúa (0-100) la idoneidad de cada candidato del ' +
            'POOL para el MANDATO, considerando las dimensiones de evaluación, skills y trayectoria. ' +
            'Devuelve el ranking ordenado de mayor a menor score, con una justificación breve (1-2 frases) ' +
            'por candidato. Usa exactamente los candidatoId proporcionados.\n\n' +
            'MANDATO:\n' +
            JSON.stringify(mandato) +
            '\n\nPOOL:\n' +
            JSON.stringify(pool),
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  );

  let ranking: { candidatoId: number; score: number; justificacion: string }[];
  try {
    ranking = JSON.parse(textoDe(respuesta)).ranking;
  } catch {
    throw error(502, 'La IA no devolvió un resultado válido al calcular el matching');
  }

  const nombrePorId = new Map(pool.map((c) => [c.candidatoId, c.nombre]));
  return ranking
    .filter((r) => nombrePorId.has(r.candidatoId))
    .map((r) => ({
      candidatoId: r.candidatoId,
      nombre: nombrePorId.get(r.candidatoId) ?? '',
      score: r.score,
      justificacion: r.justificacion,
    }))
    .sort((a, b) => b.score - a.score);
}
