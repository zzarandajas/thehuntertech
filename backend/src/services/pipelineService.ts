import { Op } from 'sequelize';
import { ProcesoCandidato, ProcesoSeleccion, Candidato, ProcesoEtapa } from '../models';

interface ErrorConEstado extends Error {
  status?: number;
  procesoCandidatoId?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

async function asegurarProceso(procesoId: number) {
  const proceso = await ProcesoSeleccion.findByPk(procesoId);
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  return proceso;
}

export async function obtenerPipeline(procesoId: number) {
  await asegurarProceso(procesoId);
  return ProcesoCandidato.findAll({
    where: { procesoId },
    include: [
      {
        model: Candidato,
        as: 'candidato',
        attributes: ['id', 'nombre', 'email', 'disponibilidad', 'linkedinUrl'],
      },
    ],
    order: [['orden', 'ASC']],
  });
}

export async function agregarCandidato(procesoId: number, candidatoId: number) {
  await asegurarProceso(procesoId);
  const candidato = await Candidato.findByPk(candidatoId);
  if (!candidato) {
    throw error(404, 'Candidato no encontrado');
  }
  const existente = await ProcesoCandidato.findOne({ where: { procesoId, candidatoId } });
  if (existente) {
    const e = error(409, 'El candidato ya está en el pipeline de este mandato');
    e.procesoCandidatoId = existente.id;
    throw e;
  }
  const primera = await ProcesoEtapa.findOne({
    where: { procesoId },
    order: [['orden', 'ASC']],
  });
  if (!primera) {
    throw error(400, 'El mandato no tiene etapas configuradas');
  }
  const total = await ProcesoCandidato.count({ where: { procesoId } });
  const pc = await ProcesoCandidato.create({
    procesoId,
    candidatoId,
    etapaId: primera.id,
    orden: total,
    etapaActualizadaAt: new Date(),
  });
  return ProcesoCandidato.findByPk(pc.id, {
    include: [
      {
        model: Candidato,
        as: 'candidato',
        attributes: ['id', 'nombre', 'email', 'disponibilidad', 'linkedinUrl'],
      },
    ],
  });
}

export interface CambiosProcesoCandidato {
  etapaId?: number;
  orden?: number;
  posicionActualSnapshot?: string | null;
  expectativaSalarial?: string | null;
  fechaIncorporacion?: string | Date | null;
}

export async function actualizarProcesoCandidato(id: number, cambios: CambiosProcesoCandidato) {
  const pc = await ProcesoCandidato.findByPk(id);
  if (!pc) {
    throw error(404, 'Participación no encontrada');
  }
  // Al cambiar de etapa reiniciamos el contador de tiempo-en-etapa (envejecimiento).
  if (cambios.etapaId !== undefined && cambios.etapaId !== pc.etapaId) {
    const etapa = await ProcesoEtapa.findByPk(cambios.etapaId);
    if (!etapa || etapa.procesoId !== pc.procesoId) {
      throw error(400, 'La etapa no pertenece a este mandato');
    }
    pc.etapaId = cambios.etapaId;
    pc.etapaActualizadaAt = new Date();
  }
  if (cambios.orden !== undefined) pc.orden = cambios.orden;
  if (cambios.posicionActualSnapshot !== undefined)
    pc.posicionActualSnapshot = cambios.posicionActualSnapshot;
  if (cambios.expectativaSalarial !== undefined)
    pc.expectativaSalarial = cambios.expectativaSalarial;
  if (cambios.fechaIncorporacion !== undefined)
    pc.fechaIncorporacion = cambios.fechaIncorporacion
      ? new Date(cambios.fechaIncorporacion)
      : null;
  await pc.save();
  return pc;
}

// Participaciones estancadas: sin cambio de etapa desde hace más de `dias` días.
// Las etapas terminales (esFinal) no envejecen: un candidato contratado o
// descartado no es un cuello de botella.
export async function pipelineEnvejecido(dias = 14) {
  const limite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const filas = await ProcesoCandidato.findAll({
    where: { etapaActualizadaAt: { [Op.lt]: limite } },
    include: [
      { model: ProcesoEtapa, as: 'etapa', where: { esFinal: false }, attributes: ['id', 'nombre'] },
      { model: Candidato, as: 'candidato', attributes: ['id', 'nombre'] },
      { model: ProcesoSeleccion, as: 'proceso', attributes: ['id', 'titulo'] },
    ],
    order: [['etapaActualizadaAt', 'ASC']],
  });
  return filas.map((pc) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = pc as any;
    const ref = p.etapaActualizadaAt ?? p.updatedAt;
    const diasEnEtapa = Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: p.id,
      procesoId: p.procesoId,
      candidatoId: p.candidatoId,
      etapa: p.etapa?.nombre ?? null,
      diasEnEtapa,
      candidato: p.candidato ? { id: p.candidato.id, nombre: p.candidato.nombre } : null,
      proceso: p.proceso ? { id: p.proceso.id, titulo: p.proceso.titulo } : null,
    };
  });
}

export async function eliminarProcesoCandidato(id: number) {
  const pc = await ProcesoCandidato.findByPk(id);
  if (!pc) {
    throw error(404, 'Participación no encontrada');
  }
  await pc.destroy();
  return { ok: true };
}
