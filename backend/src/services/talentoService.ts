import { Op, WhereOptions } from 'sequelize';
import {
  sequelize,
  Candidato,
  CandidatoExperiencia,
  CandidatoSkill,
  CandidatoInteraccion,
  CandidatoDocumento,
  OrigenCandidato,
  Skill,
  Usuario,
} from '../models';
import type { Disponibilidad } from '../models/Candidato';
import type { TipoInteraccion } from '../models/CandidatoInteraccion';
import type { TipoDocumento } from '../models/CandidatoDocumento';

interface ErrorConEstado extends Error {
  status?: number;
  candidatoId?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

export interface FiltrosTalento {
  search?: string;
  skillId?: number;
  disponibilidad?: Disponibilidad;
  origenId?: number;
}

export async function listarCandidatos(filtros: FiltrosTalento) {
  const where: WhereOptions = {};
  if (filtros.search) {
    const q = `%${filtros.search}%`;
    Object.assign(where, {
      [Op.or]: [{ nombre: { [Op.like]: q } }, { email: { [Op.like]: q } }, { linkedinUrl: { [Op.like]: q } }],
    });
  }
  if (filtros.disponibilidad) Object.assign(where, { disponibilidad: filtros.disponibilidad });
  if (filtros.origenId) Object.assign(where, { origenId: filtros.origenId });

  return Candidato.findAll({
    where,
    include: [
      { model: OrigenCandidato, as: 'origen', attributes: ['id', 'nombre'] },
      ...(filtros.skillId
        ? [
            {
              model: CandidatoSkill,
              as: 'skills',
              required: true,
              where: { skillId: filtros.skillId },
              attributes: [],
            },
          ]
        : []),
    ],
    order: [['nombre', 'ASC']],
  });
}

export async function obtenerCandidato(id: number) {
  const candidato = await Candidato.findByPk(id, {
    include: [
      { model: OrigenCandidato, as: 'origen', attributes: ['id', 'nombre'] },
      { model: CandidatoExperiencia, as: 'experiencias' },
      { model: CandidatoSkill, as: 'skills', include: [{ model: Skill, as: 'skill' }] },
      {
        model: CandidatoInteraccion,
        as: 'interacciones',
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }],
      },
      {
        model: CandidatoDocumento,
        as: 'documentos',
        include: [{ model: Usuario, as: 'subidoPorUsuario', attributes: ['id', 'nombre'] }],
      },
    ],
    order: [
      [{ model: CandidatoExperiencia, as: 'experiencias' }, 'orden', 'ASC'],
      [{ model: CandidatoInteraccion, as: 'interacciones' }, 'fecha', 'DESC'],
    ],
  });
  if (!candidato) {
    throw error(404, 'Candidato no encontrado');
  }
  return candidato;
}

export interface DatosCandidato {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  linkedinUrl?: string | null;
  ciudadResidencia?: string | null;
  idiomas?: string | null;
  formacion?: string | null;
  origenId?: number | null;
  disponibilidad?: Disponibilidad;
  cvUrl?: string | null;
  salarioActualEstimado?: string | null;
  consentimientoRgpd?: boolean;
  notasInternas?: string | null;
}

// Deduplicación por email/linkedin_url antes de crear.
export async function crearCandidato(datos: DatosCandidato) {
  const condiciones: WhereOptions[] = [];
  if (datos.email) condiciones.push({ email: datos.email });
  if (datos.linkedinUrl) condiciones.push({ linkedinUrl: datos.linkedinUrl });
  if (condiciones.length) {
    const existente = await Candidato.findOne({ where: { [Op.or]: condiciones } });
    if (existente) {
      const e = error(409, 'Ya existe un candidato con ese email o LinkedIn');
      e.candidatoId = existente.id;
      throw e;
    }
  }
  const consentimiento = datos.consentimientoRgpd ?? false;
  return Candidato.create({
    ...datos,
    consentimientoRgpd: consentimiento,
    fechaConsentimiento: consentimiento ? new Date() : null,
    ultimaActividadAt: new Date(),
  });
}

export async function actualizarCandidato(id: number, cambios: Partial<DatosCandidato>) {
  const candidato = await Candidato.findByPk(id);
  if (!candidato) {
    throw error(404, 'Candidato no encontrado');
  }
  // Al marcar consentimiento por primera vez, registrar la fecha.
  if (cambios.consentimientoRgpd && !candidato.consentimientoRgpd) {
    candidato.fechaConsentimiento = new Date();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await candidato.update(cambios as any);
  return candidato;
}

async function asegurarCandidato(candidatoId: number) {
  const candidato = await Candidato.findByPk(candidatoId);
  if (!candidato) {
    throw error(404, 'Candidato no encontrado');
  }
  return candidato;
}

export interface ItemExperiencia {
  empresa: string;
  cargo?: string | null;
  periodo?: string | null;
  descripcion?: string | null;
}

export async function reemplazarExperiencia(candidatoId: number, items: ItemExperiencia[]) {
  await asegurarCandidato(candidatoId);
  await sequelize.transaction(async (t) => {
    await CandidatoExperiencia.destroy({ where: { candidatoId }, transaction: t });
    await CandidatoExperiencia.bulkCreate(
      items.map((it, i) => ({ candidatoId, orden: i, ...it })),
      { transaction: t },
    );
  });
  return CandidatoExperiencia.findAll({ where: { candidatoId }, order: [['orden', 'ASC']] });
}

export interface ItemSkill {
  skillId: number;
  nivel?: string | null;
}

export async function reemplazarSkills(candidatoId: number, items: ItemSkill[]) {
  await asegurarCandidato(candidatoId);
  await sequelize.transaction(async (t) => {
    await CandidatoSkill.destroy({ where: { candidatoId }, transaction: t });
    await CandidatoSkill.bulkCreate(
      items.map((it) => ({ candidatoId, skillId: it.skillId, nivel: it.nivel ?? null })),
      { transaction: t },
    );
  });
  return CandidatoSkill.findAll({
    where: { candidatoId },
    include: [{ model: Skill, as: 'skill' }],
  });
}

export interface DatosInteraccion {
  tipo: TipoInteraccion;
  fecha?: string | Date;
  resumen?: string | null;
}

export async function crearInteraccion(
  candidatoId: number,
  datos: DatosInteraccion,
  usuarioId: number,
) {
  const candidato = await asegurarCandidato(candidatoId);
  const interaccion = await CandidatoInteraccion.create({
    candidatoId,
    usuarioId,
    tipo: datos.tipo,
    fecha: datos.fecha ? new Date(datos.fecha) : new Date(),
    resumen: datos.resumen ?? null,
  });
  candidato.ultimaActividadAt = new Date();
  await candidato.save();
  return interaccion;
}

export interface DatosDocumento {
  tipo?: TipoDocumento;
  nombreArchivo: string;
  path: string;
}

export async function crearDocumento(
  candidatoId: number,
  datos: DatosDocumento,
  subidoPor: number,
) {
  await asegurarCandidato(candidatoId);
  return CandidatoDocumento.create({
    candidatoId,
    tipo: datos.tipo ?? 'otro',
    nombreArchivo: datos.nombreArchivo,
    path: datos.path,
    subidoPor,
  });
}
