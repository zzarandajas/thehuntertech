import client from './client';

export type Disponibilidad =
  | 'activo_busqueda'
  | 'abierto_a_ofertas'
  | 'no_disponible'
  | 'colocado'
  | 'desconocido';

export type TipoInteraccion = 'llamada' | 'email' | 'reunion' | 'nota' | 'linkedin';
export type TipoDocumento = 'cv' | 'otro';

export interface Candidato {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  linkedinUrl: string | null;
  ciudadResidencia: string | null;
  idiomas: string | null;
  formacion: string | null;
  origenId: number | null;
  disponibilidad: Disponibilidad;
  cvUrl: string | null;
  salarioActualEstimado: string | null;
  consentimientoRgpd: boolean;
  fechaConsentimiento: string | null;
  notasInternas: string | null;
  origen?: { id: number; nombre: string };
}

export interface Experiencia {
  id?: number;
  empresa: string;
  cargo: string | null;
  periodo: string | null;
  descripcion: string | null;
}

export interface CandidatoSkill {
  id: number;
  skillId: number;
  nivel: string | null;
  skill?: { id: number; nombre: string };
}

export interface Interaccion {
  id: number;
  tipo: TipoInteraccion;
  fecha: string;
  resumen: string | null;
  usuario?: { id: number; nombre: string };
}

export interface Documento {
  id: number;
  tipo: TipoDocumento;
  nombreArchivo: string;
  path: string;
  subidoPorUsuario?: { id: number; nombre: string };
}

export interface CandidatoDetalle extends Candidato {
  experiencias: Experiencia[];
  skills: CandidatoSkill[];
  interacciones: Interaccion[];
  documentos: Documento[];
}

export interface FiltrosTalento {
  search?: string;
  skillId?: number;
  disponibilidad?: Disponibilidad;
  origenId?: number;
}

export async function listarCandidatos(filtros: FiltrosTalento = {}): Promise<Candidato[]> {
  const params: Record<string, unknown> = {};
  if (filtros.search) params.search = filtros.search;
  if (filtros.skillId) params.skill_id = filtros.skillId;
  if (filtros.disponibilidad) params.disponibilidad = filtros.disponibilidad;
  if (filtros.origenId) params.origen_id = filtros.origenId;
  const { data } = await client.get<Candidato[]>('/candidatos', { params });
  return data;
}

export async function obtenerCandidato(id: number): Promise<CandidatoDetalle> {
  const { data } = await client.get<CandidatoDetalle>(`/candidatos/${id}`);
  return data;
}

export async function crearCandidato(datos: Record<string, unknown>): Promise<Candidato> {
  const { data } = await client.post<Candidato>('/candidatos', datos);
  return data;
}

export async function actualizarCandidato(
  id: number,
  cambios: Record<string, unknown>,
): Promise<Candidato> {
  const { data } = await client.patch<Candidato>(`/candidatos/${id}`, cambios);
  return data;
}

export async function guardarExperiencia(id: number, items: Experiencia[]): Promise<Experiencia[]> {
  const { data } = await client.put<Experiencia[]>(`/candidatos/${id}/experiencia`, { items });
  return data;
}

export async function guardarSkills(
  id: number,
  items: { skillId: number; nivel?: string | null }[],
): Promise<CandidatoSkill[]> {
  const { data } = await client.put<CandidatoSkill[]>(`/candidatos/${id}/skills`, { items });
  return data;
}

export async function crearInteraccion(
  id: number,
  datos: { tipo: TipoInteraccion; fecha?: string; resumen?: string | null },
): Promise<Interaccion> {
  const { data } = await client.post<Interaccion>(`/candidatos/${id}/interacciones`, datos);
  return data;
}

export async function crearDocumento(
  id: number,
  datos: { tipo?: TipoDocumento; nombreArchivo: string; path: string },
): Promise<Documento> {
  const { data } = await client.post<Documento>(`/candidatos/${id}/documentos`, datos);
  return data;
}

export const DISPONIBILIDAD_LABEL: Record<Disponibilidad, string> = {
  activo_busqueda: 'En búsqueda activa',
  abierto_a_ofertas: 'Abierto a ofertas',
  no_disponible: 'No disponible',
  colocado: 'Colocado',
  desconocido: 'Desconocido',
};

export const DISPONIBILIDAD_COLOR: Record<Disponibilidad, string> = {
  activo_busqueda: 'green',
  abierto_a_ofertas: 'cyan',
  no_disponible: 'red',
  colocado: 'blue',
  desconocido: 'default',
};
