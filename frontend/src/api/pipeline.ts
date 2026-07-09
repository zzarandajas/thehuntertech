import client from './client';

// Etapa propia de un mandato (columna del board). Se copia de una plantilla al
// crear el mandato y es editable de forma independiente.
export interface EtapaProceso {
  id: number;
  procesoId: number;
  nombre: string;
  orden: number;
  color: string;
  esFinal: boolean;
}

export interface EtapaProcesoInput {
  id?: number;
  nombre: string;
  color?: string;
  esFinal?: boolean;
}

export interface ProcesoCandidato {
  id: number;
  procesoId: number;
  candidatoId: number;
  orden: number;
  etapaId: number;
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

// Color por defecto para una etapa nueva sin color asignado.
export const ETAPA_COLOR_DEFAULT = '#64748b';

export async function obtenerPipeline(procesoId: number): Promise<ProcesoCandidato[]> {
  const { data } = await client.get<ProcesoCandidato[]>(`/procesos/${procesoId}/pipeline`);
  return data;
}

export async function obtenerEtapasProceso(procesoId: number): Promise<EtapaProceso[]> {
  const { data } = await client.get<EtapaProceso[]>(`/procesos/${procesoId}/etapas`);
  return data;
}

export async function reemplazarEtapasProceso(
  procesoId: number,
  etapas: EtapaProcesoInput[],
): Promise<EtapaProceso[]> {
  const { data } = await client.put<EtapaProceso[]>(`/procesos/${procesoId}/etapas`, { etapas });
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
