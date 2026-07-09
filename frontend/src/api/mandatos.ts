import client from './client';

export type EstadoProceso = 'abierto' | 'cerrado' | 'archivado';
export type RolEnProceso = 'lead' | 'soporte';

interface Ref {
  id: number;
  nombre: string;
}

export interface Mandato {
  id: number;
  clienteId: number;
  verticalId: number;
  titulo: string;
  confidencialidad: string;
  estado: EstadoProceso;
  anonimizarNombres: boolean;
  cliente?: Ref;
  vertical?: Ref;
}

export interface MandatoDimension {
  id: number;
  dimensionId: number;
  orden: number;
  dimension?: { id: number; nombre: string; codigo: string };
}

export interface MandatoConsultor {
  id: number;
  usuarioId: number;
  rolEnProceso: RolEnProceso;
  usuario?: { id: number; nombre: string; email: string; rol: string };
}

export interface MandatoEtapa {
  id: number;
  procesoId: number;
  nombre: string;
  orden: number;
  color: string;
  esFinal: boolean;
}

export interface MandatoDetalle extends Mandato {
  creador?: { id: number; nombre: string; email: string };
  dimensiones: MandatoDimension[];
  consultores: MandatoConsultor[];
  etapas: MandatoEtapa[];
}

export interface DatosMandato {
  clienteId: number;
  verticalId: number;
  titulo: string;
  anonimizarNombres?: boolean;
  plantillaId?: number;
}

export async function listarMandatos(): Promise<Mandato[]> {
  const { data } = await client.get<Mandato[]>('/procesos');
  return data;
}

export async function obtenerMandato(id: number): Promise<MandatoDetalle> {
  const { data } = await client.get<MandatoDetalle>(`/procesos/${id}`);
  return data;
}

export async function crearMandato(datos: DatosMandato): Promise<MandatoDetalle> {
  const { data } = await client.post<MandatoDetalle>('/procesos', datos);
  return data;
}

export async function actualizarMandato(
  id: number,
  cambios: Record<string, unknown>,
): Promise<MandatoDetalle> {
  const { data } = await client.patch<MandatoDetalle>(`/procesos/${id}`, cambios);
  return data;
}

export async function asignarDimensiones(
  id: number,
  dimensionIds: number[],
): Promise<MandatoDetalle> {
  const { data } = await client.post<MandatoDetalle>(`/procesos/${id}/dimensiones`, {
    dimensionIds,
  });
  return data;
}

export async function asignarConsultores(
  id: number,
  consultores: { usuarioId: number; rolEnProceso: RolEnProceso }[],
): Promise<MandatoDetalle> {
  const { data } = await client.post<MandatoDetalle>(`/procesos/${id}/consultores`, {
    consultores,
  });
  return data;
}
