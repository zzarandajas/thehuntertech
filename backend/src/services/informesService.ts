import crypto from 'crypto';
import {
  Informe,
  InformeShareLink,
  ProcesoSeleccion,
  ProcesoCandidato,
  ProcesoDimension,
  Cliente,
  Vertical,
  Candidato,
  DimensionCatalogo,
  CandidatoMetrica,
  CandidatoDimensionScore,
  CandidatoObservacion,
  Usuario,
} from '../models';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

// Construye el snapshot inmutable del informe a partir del estado actual del mandato.
async function construirSnapshot(procesoId: number) {
  const proceso = await ProcesoSeleccion.findByPk(procesoId, {
    include: [
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
      { model: Vertical, as: 'vertical', attributes: ['id', 'nombre'] },
      {
        model: ProcesoDimension,
        as: 'dimensiones',
        include: [{ model: DimensionCatalogo, as: 'dimension' }],
      },
    ],
    order: [[{ model: ProcesoDimension, as: 'dimensiones' }, 'orden', 'ASC']],
  });
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }

  const participantes = await ProcesoCandidato.findAll({
    where: { procesoId },
    include: [
      { model: Candidato, as: 'candidato', attributes: ['id', 'nombre'] },
      {
        model: CandidatoDimensionScore,
        as: 'scores',
        include: [{ model: DimensionCatalogo, as: 'dimension', attributes: ['id', 'nombre'] }],
      },
      { model: CandidatoMetrica, as: 'metricas' },
      { model: CandidatoObservacion, as: 'observaciones' },
    ],
    order: [['orden', 'ASC']],
  });

  const anonimizar = proceso.anonimizarNombres;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidatos = participantes.map((pc: any, idx: number) => ({
    nombre: anonimizar ? `Candidato ${idx + 1}` : pc.candidato?.nombre ?? `Candidato ${idx + 1}`,
    etapa: pc.etapa,
    posicionActualSnapshot: pc.posicionActualSnapshot,
    expectativaSalarial: pc.expectativaSalarial,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scores: (pc.scores ?? []).map((s: any) => ({
      dimension: s.dimension?.nombre ?? '',
      score: s.score,
      comentario: s.comentario,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metricas: (pc.metricas ?? []).map((m: any) => ({ valor: m.valor, descripcion: m.descripcion })),
    observaciones: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fortalezas: (pc.observaciones ?? [])
        .filter((o: any) => o.tipo === 'fortaleza')
        .map((o: any) => o.texto),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      puntosExplorar: (pc.observaciones ?? [])
        .filter((o: any) => o.tipo === 'punto_explorar')
        .map((o: any) => o.texto),
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = proceso as any;
  return {
    proceso: {
      titulo: p.titulo,
      confidencialidad: p.confidencialidad,
      cliente: p.cliente?.nombre ?? '',
      vertical: p.vertical?.nombre ?? '',
    },
    dimensiones: (p.dimensiones ?? []).map((d: any) => ({
      id: d.dimensionId,
      nombre: d.dimension?.nombre ?? '',
    })),
    candidatos,
    generadoEl: new Date().toISOString(),
  };
}

export async function generarInforme(procesoId: number, generadoPor: number) {
  const snapshot = await construirSnapshot(procesoId);
  const ultima = (await Informe.max('version', { where: { procesoId } })) as number | null;
  const version = (ultima ?? 0) + 1;
  return Informe.create({
    procesoId,
    version,
    generadoPor,
    fechaGeneracion: new Date(),
    snapshotJson: snapshot,
  });
}

export async function listarInformes(procesoId: number) {
  return Informe.findAll({
    where: { procesoId },
    attributes: ['id', 'version', 'fechaGeneracion', 'generadoPor'],
    include: [{ model: Usuario, as: 'generador', attributes: ['id', 'nombre'] }],
    order: [['version', 'DESC']],
  });
}

export async function obtenerInforme(id: number) {
  const informe = await Informe.findByPk(id, {
    include: [
      { model: Usuario, as: 'generador', attributes: ['id', 'nombre'] },
      { model: InformeShareLink, as: 'shareLinks' },
    ],
  });
  if (!informe) {
    throw error(404, 'Informe no encontrado');
  }
  return informe;
}

export async function crearShareLink(informeId: number, creadoPor: number, expiresInDays = 30) {
  const informe = await Informe.findByPk(informeId);
  if (!informe) {
    throw error(404, 'Informe no encontrado');
  }
  const token = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  return InformeShareLink.create({ informeId, token, expiresAt, creadoPor });
}

export async function revocarShareLink(id: number) {
  const link = await InformeShareLink.findByPk(id);
  if (!link) {
    throw error(404, 'Enlace no encontrado');
  }
  link.revocado = true;
  await link.save();
  return link;
}

// Resuelve un token público: valida existencia, revocación y expiración.
export async function obtenerInformePorToken(token: string) {
  const link = await InformeShareLink.findOne({
    where: { token },
    include: [{ model: Informe, as: 'informe' }],
  });
  if (!link) {
    throw error(404, 'Enlace no válido');
  }
  if (link.revocado) {
    throw error(410, 'Este enlace ha sido revocado');
  }
  if (new Date(link.expiresAt).getTime() < Date.now()) {
    throw error(410, 'Este enlace ha expirado');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (link as any).informe as Informe;
}
