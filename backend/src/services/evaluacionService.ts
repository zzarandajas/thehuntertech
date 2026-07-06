import {
  sequelize,
  ProcesoCandidato,
  ProcesoSeleccion,
  ProcesoDimension,
  Candidato,
  DimensionCatalogo,
  CandidatoMetrica,
  CandidatoDimensionScore,
  CandidatoObservacion,
} from '../models';
import type { TipoObservacion } from '../models/CandidatoObservacion';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

async function asegurarPc(pcId: number) {
  const pc = await ProcesoCandidato.findByPk(pcId);
  if (!pc) {
    throw error(404, 'Participación no encontrada');
  }
  return pc;
}

// Detalle de evaluación: incluye las dimensiones del mandato (para iterar el formulario).
export async function obtenerEvaluacion(pcId: number) {
  const pc = await ProcesoCandidato.findByPk(pcId, {
    include: [
      { model: Candidato, as: 'candidato', attributes: ['id', 'nombre', 'email'] },
      {
        model: ProcesoSeleccion,
        as: 'proceso',
        include: [
          {
            model: ProcesoDimension,
            as: 'dimensiones',
            include: [{ model: DimensionCatalogo, as: 'dimension' }],
          },
        ],
      },
      { model: CandidatoMetrica, as: 'metricas' },
      {
        model: CandidatoDimensionScore,
        as: 'scores',
        include: [{ model: DimensionCatalogo, as: 'dimension' }],
      },
      { model: CandidatoObservacion, as: 'observaciones' },
    ],
    order: [
      [{ model: CandidatoMetrica, as: 'metricas' }, 'orden', 'ASC'],
      [{ model: CandidatoObservacion, as: 'observaciones' }, 'orden', 'ASC'],
    ],
  });
  if (!pc) {
    throw error(404, 'Participación no encontrada');
  }
  return pc;
}

export interface ItemMetrica {
  valor: string;
  descripcion: string;
}

export async function reemplazarMetricas(pcId: number, items: ItemMetrica[]) {
  await asegurarPc(pcId);
  await sequelize.transaction(async (t) => {
    await CandidatoMetrica.destroy({ where: { procesoCandidatoId: pcId }, transaction: t });
    await CandidatoMetrica.bulkCreate(
      items.map((it, i) => ({
        procesoCandidatoId: pcId,
        valor: it.valor,
        descripcion: it.descripcion,
        orden: i,
      })),
      { transaction: t },
    );
  });
  return CandidatoMetrica.findAll({ where: { procesoCandidatoId: pcId }, order: [['orden', 'ASC']] });
}

export interface ItemScore {
  dimensionId: number;
  score: number;
  comentario?: string | null;
}

export async function reemplazarScores(pcId: number, items: ItemScore[]) {
  await asegurarPc(pcId);
  // Validación de rango 0-100 a nivel de servicio, además del validate del modelo.
  for (const it of items) {
    if (typeof it.score !== 'number' || it.score < 0 || it.score > 100) {
      throw error(400, `Score fuera de rango (0-100) para la dimensión ${it.dimensionId}`);
    }
  }
  await sequelize.transaction(async (t) => {
    await CandidatoDimensionScore.destroy({ where: { procesoCandidatoId: pcId }, transaction: t });
    await CandidatoDimensionScore.bulkCreate(
      items.map((it) => ({
        procesoCandidatoId: pcId,
        dimensionId: it.dimensionId,
        score: it.score,
        comentario: it.comentario ?? null,
      })),
      { transaction: t, validate: true },
    );
  });
  return CandidatoDimensionScore.findAll({
    where: { procesoCandidatoId: pcId },
    include: [{ model: DimensionCatalogo, as: 'dimension' }],
  });
}

export interface ItemObservacion {
  tipo: TipoObservacion;
  texto: string;
}

export async function reemplazarObservaciones(pcId: number, items: ItemObservacion[]) {
  await asegurarPc(pcId);
  await sequelize.transaction(async (t) => {
    await CandidatoObservacion.destroy({ where: { procesoCandidatoId: pcId }, transaction: t });
    await CandidatoObservacion.bulkCreate(
      items.map((it, i) => ({
        procesoCandidatoId: pcId,
        tipo: it.tipo,
        texto: it.texto,
        orden: i,
      })),
      { transaction: t },
    );
  });
  return CandidatoObservacion.findAll({
    where: { procesoCandidatoId: pcId },
    order: [['orden', 'ASC']],
  });
}
