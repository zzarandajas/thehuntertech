import {
  sequelize,
  ProcesoSeleccion,
  ProcesoDimension,
  ProcesoConsultor,
  ProcesoEtapa,
  Cliente,
  Vertical,
  Usuario,
  DimensionCatalogo,
} from '../models';
import type { RolEnProceso } from '../models/ProcesoConsultor';
import type { EstadoProceso } from '../models/ProcesoSeleccion';
import { copiarEtapasDePlantilla } from './procesoEtapasService';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

export async function listarProcesos() {
  return ProcesoSeleccion.findAll({
    include: [
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
      { model: Vertical, as: 'vertical', attributes: ['id', 'nombre'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function obtenerProceso(id: number) {
  const proceso = await ProcesoSeleccion.findByPk(id, {
    include: [
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
      { model: Vertical, as: 'vertical', attributes: ['id', 'nombre'] },
      { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'email'] },
      {
        model: ProcesoDimension,
        as: 'dimensiones',
        include: [{ model: DimensionCatalogo, as: 'dimension' }],
      },
      {
        model: ProcesoConsultor,
        as: 'consultores',
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'rol'] }],
      },
      { model: ProcesoEtapa, as: 'etapas' },
    ],
    order: [
      [{ model: ProcesoDimension, as: 'dimensiones' }, 'orden', 'ASC'],
      [{ model: ProcesoEtapa, as: 'etapas' }, 'orden', 'ASC'],
    ],
  });
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  return proceso;
}

export interface DatosProceso {
  clienteId: number;
  verticalId: number;
  titulo: string;
  confidencialidad?: string;
  anonimizarNombres?: boolean;
  plantillaId?: number;
}

export async function crearProceso(datos: DatosProceso, createdBy: number) {
  const proceso = await ProcesoSeleccion.create({
    clienteId: datos.clienteId,
    verticalId: datos.verticalId,
    titulo: datos.titulo,
    confidencialidad: datos.confidencialidad,
    anonimizarNombres: datos.anonimizarNombres ?? false,
    createdBy,
  });
  // Copia las etapas de la plantilla elegida (o la por defecto) al nuevo mandato.
  await copiarEtapasDePlantilla(proceso.id, datos.plantillaId);
  return obtenerProceso(proceso.id);
}

export interface CambiosProceso {
  titulo?: string;
  verticalId?: number;
  estado?: EstadoProceso;
  confidencialidad?: string;
  anonimizarNombres?: boolean;
}

export async function actualizarProceso(id: number, cambios: CambiosProceso) {
  const proceso = await ProcesoSeleccion.findByPk(id);
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  if (cambios.titulo !== undefined) proceso.titulo = cambios.titulo;
  if (cambios.verticalId !== undefined) proceso.verticalId = cambios.verticalId;
  if (cambios.estado !== undefined) proceso.estado = cambios.estado;
  if (cambios.confidencialidad !== undefined) proceso.confidencialidad = cambios.confidencialidad;
  if (cambios.anonimizarNombres !== undefined) proceso.anonimizarNombres = cambios.anonimizarNombres;
  await proceso.save();
  return obtenerProceso(id);
}

// Reemplaza el conjunto de dimensiones del mandato (el orden se toma del array).
export async function asignarDimensiones(procesoId: number, dimensionIds: number[]) {
  const proceso = await ProcesoSeleccion.findByPk(procesoId);
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  await sequelize.transaction(async (t) => {
    await ProcesoDimension.destroy({ where: { procesoId }, transaction: t });
    await ProcesoDimension.bulkCreate(
      dimensionIds.map((dimensionId, i) => ({ procesoId, dimensionId, orden: i })),
      { transaction: t },
    );
  });
  return obtenerProceso(procesoId);
}

export interface AsignacionConsultor {
  usuarioId: number;
  rolEnProceso: RolEnProceso;
}

// Reemplaza el conjunto de consultores (socios) del mandato.
export async function asignarConsultores(procesoId: number, consultores: AsignacionConsultor[]) {
  const proceso = await ProcesoSeleccion.findByPk(procesoId);
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  await sequelize.transaction(async (t) => {
    await ProcesoConsultor.destroy({ where: { procesoId }, transaction: t });
    await ProcesoConsultor.bulkCreate(
      consultores.map((c) => ({
        procesoId,
        usuarioId: c.usuarioId,
        rolEnProceso: c.rolEnProceso,
      })),
      { transaction: t },
    );
  });
  return obtenerProceso(procesoId);
}
