import client from './client';

export type TipoObservacion = 'fortaleza' | 'punto_explorar';

export interface DimensionRef {
  id: number;
  nombre: string;
  codigo: string;
}

export interface ProcesoDimension {
  id: number;
  dimensionId: number;
  orden: number;
  dimension?: DimensionRef;
}

export interface Metrica {
  id?: number;
  valor: string;
  descripcion: string;
}

export interface DimensionScore {
  id?: number;
  dimensionId: number;
  score: number;
  comentario: string | null;
  dimension?: DimensionRef;
}

export interface Observacion {
  id?: number;
  tipo: TipoObservacion;
  texto: string;
}

export interface EvaluacionDetalle {
  id: number;
  procesoId: number;
  candidatoId: number;
  etapa: string;
  candidato?: { id: number; nombre: string; email: string | null };
  proceso?: { id: number; titulo: string; dimensiones: ProcesoDimension[] };
  metricas: Metrica[];
  scores: DimensionScore[];
  observaciones: Observacion[];
}

export async function obtenerEvaluacion(pcId: number): Promise<EvaluacionDetalle> {
  const { data } = await client.get<EvaluacionDetalle>(`/proceso-candidatos/${pcId}`);
  return data;
}

export async function guardarMetricas(pcId: number, items: Metrica[]): Promise<Metrica[]> {
  const { data } = await client.put<Metrica[]>(`/proceso-candidatos/${pcId}/metricas`, { items });
  return data;
}

export async function guardarScores(
  pcId: number,
  items: { dimensionId: number; score: number; comentario?: string | null }[],
): Promise<DimensionScore[]> {
  const { data } = await client.put<DimensionScore[]>(`/proceso-candidatos/${pcId}/scores`, {
    items,
  });
  return data;
}

export async function guardarObservaciones(
  pcId: number,
  items: Observacion[],
): Promise<Observacion[]> {
  const { data } = await client.put<Observacion[]>(`/proceso-candidatos/${pcId}/observaciones`, {
    items,
  });
  return data;
}
