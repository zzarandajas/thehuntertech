import client from './client';

export type EtapaPipeline =
  | 'sourcing'
  | 'longlist'
  | 'shortlist'
  | 'presentado'
  | 'entrevista_cliente'
  | 'oferta'
  | 'contratado'
  | 'descartado';

export interface ProcesoCandidato {
  id: number;
  procesoId: number;
  candidatoId: number;
  orden: number;
  etapa: EtapaPipeline;
  posicionActualSnapshot: string | null;
  expectativaSalarial: string | null;
  fechaIncorporacion: string | null;
  candidato?: {
    id: number;
    nombre: string;
    email: string | null;
    disponibilidad: string;
    linkedinUrl: string | null;
  };
}

export const ETAPAS: EtapaPipeline[] = [
  'sourcing',
  'longlist',
  'shortlist',
  'presentado',
  'entrevista_cliente',
  'oferta',
  'contratado',
  'descartado',
];

export const ETAPA_LABEL: Record<EtapaPipeline, string> = {
  sourcing: 'Sourcing',
  longlist: 'Longlist',
  shortlist: 'Shortlist',
  presentado: 'Presentado',
  entrevista_cliente: 'Entrevista cliente',
  oferta: 'Oferta',
  contratado: 'Contratado',
  descartado: 'Descartado',
};

export async function obtenerPipeline(procesoId: number): Promise<ProcesoCandidato[]> {
  const { data } = await client.get<ProcesoCandidato[]>(`/procesos/${procesoId}/pipeline`);
  return data;
}

export async function agregarCandidatoAPipeline(
  procesoId: number,
  candidatoId: number,
): Promise<ProcesoCandidato> {
  const { data } = await client.post<ProcesoCandidato>(`/procesos/${procesoId}/candidatos`, {
    candidatoId,
  });
  return data;
}

export async function actualizarProcesoCandidato(
  id: number,
  cambios: Record<string, unknown>,
): Promise<ProcesoCandidato> {
  const { data } = await client.patch<ProcesoCandidato>(`/proceso-candidatos/${id}`, cambios);
  return data;
}

export async function eliminarProcesoCandidato(id: number): Promise<void> {
  await client.delete(`/proceso-candidatos/${id}`);
}
