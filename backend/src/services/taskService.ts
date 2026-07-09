import { Op } from 'sequelize';
import { Tarea, Usuario, Candidato, Cliente, ProcesoSeleccion } from '../models';
import type { TipoTarea } from '../models/Tarea';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

// Relaciones cargadas en cada tarea para poder mostrar contexto en la UI.
const includeContexto = [
  { model: Usuario, as: 'asignado', attributes: ['id', 'nombre'] },
  { model: Usuario, as: 'creador', attributes: ['id', 'nombre'] },
  { model: Candidato, as: 'candidato', attributes: ['id', 'nombre'] },
  { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
  { model: ProcesoSeleccion, as: 'proceso', attributes: ['id', 'titulo'] },
];

export interface FiltrosTareas {
  asignadoA?: number;
  pendientes?: boolean;
  overdue?: boolean;
  candidatoId?: number;
  procesoId?: number;
  clienteId?: number;
}

export async function listarTareas(filtros: FiltrosTareas = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filtros.asignadoA) where.asignadoA = filtros.asignadoA;
  if (filtros.candidatoId) where.candidatoId = filtros.candidatoId;
  if (filtros.procesoId) where.procesoId = filtros.procesoId;
  if (filtros.clienteId) where.clienteId = filtros.clienteId;
  if (filtros.pendientes) where.completadaAt = { [Op.is]: null };
  if (filtros.overdue) {
    where.completadaAt = { [Op.is]: null };
    where.dueAt = { [Op.lt]: new Date() };
  }
  return Tarea.findAll({
    where,
    include: includeContexto,
    order: [
      ['completadaAt', 'ASC'],
      ['dueAt', 'ASC'],
    ],
  });
}

export interface DatosTarea {
  titulo: string;
  descripcion?: string | null;
  tipo?: TipoTarea;
  dueAt?: string | Date | null;
  asignadoA?: number;
  procesoId?: number | null;
  candidatoId?: number | null;
  clienteId?: number | null;
  procesoCandidatoId?: number | null;
}

export async function crearTarea(datos: DatosTarea, creadoPor: number) {
  if (!datos.titulo?.trim()) {
    throw error(400, 'El título es obligatorio');
  }
  const tarea = await Tarea.create({
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion ?? null,
    tipo: datos.tipo ?? 'seguimiento',
    dueAt: datos.dueAt ? new Date(datos.dueAt) : null,
    asignadoA: datos.asignadoA ?? creadoPor,
    creadoPor,
    procesoId: datos.procesoId ?? null,
    candidatoId: datos.candidatoId ?? null,
    clienteId: datos.clienteId ?? null,
    procesoCandidatoId: datos.procesoCandidatoId ?? null,
  });
  return Tarea.findByPk(tarea.id, { include: includeContexto });
}

export interface CambiosTarea extends Partial<DatosTarea> {
  completada?: boolean;
}

export async function actualizarTarea(id: number, cambios: CambiosTarea) {
  const tarea = await Tarea.findByPk(id);
  if (!tarea) {
    throw error(404, 'Tarea no encontrada');
  }
  if (cambios.titulo !== undefined) tarea.titulo = cambios.titulo.trim();
  if (cambios.descripcion !== undefined) tarea.descripcion = cambios.descripcion;
  if (cambios.tipo !== undefined) tarea.tipo = cambios.tipo;
  if (cambios.dueAt !== undefined) tarea.dueAt = cambios.dueAt ? new Date(cambios.dueAt) : null;
  if (cambios.asignadoA !== undefined) tarea.asignadoA = cambios.asignadoA;
  if (cambios.completada !== undefined) {
    tarea.completadaAt = cambios.completada ? new Date() : null;
  }
  await tarea.save();
  return Tarea.findByPk(tarea.id, { include: includeContexto });
}

export async function eliminarTarea(id: number) {
  const tarea = await Tarea.findByPk(id);
  if (!tarea) {
    throw error(404, 'Tarea no encontrada');
  }
  await tarea.destroy();
  return { ok: true };
}
