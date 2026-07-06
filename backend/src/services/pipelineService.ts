import { ProcesoCandidato, ProcesoSeleccion, Candidato } from '../models';
import type { EtapaPipeline } from '../models/ProcesoCandidato';

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
  const total = await ProcesoCandidato.count({ where: { procesoId } });
  const pc = await ProcesoCandidato.create({
    procesoId,
    candidatoId,
    etapa: 'sourcing',
    orden: total,
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
  etapa?: EtapaPipeline;
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
  if (cambios.etapa !== undefined) pc.etapa = cambios.etapa;
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

export async function eliminarProcesoCandidato(id: number) {
  const pc = await ProcesoCandidato.findByPk(id);
  if (!pc) {
    throw error(404, 'Participación no encontrada');
  }
  await pc.destroy();
  return { ok: true };
}
