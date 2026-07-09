import client from './client';

export interface PlantillaEtapa {
  id: number;
  plantillaId: number;
  nombre: string;
  orden: number;
  color: string;
  esFinal: boolean;
}

export interface Plantilla {
  id: number;
  nombre: string;
  descripcion: string | null;
  esDefault: boolean;
  etapas?: PlantillaEtapa[];
}

export interface EtapaInput {
  nombre: string;
  color?: string;
  esFinal?: boolean;
}

export async function listarPlantillas(): Promise<Plantilla[]> {
  const { data } = await client.get<Plantilla[]>('/pipeline-plantillas');
  return data;
}

export async function obtenerPlantilla(id: number): Promise<Plantilla> {
  const { data } = await client.get<Plantilla>(`/pipeline-plantillas/${id}`);
  return data;
}

export async function crearPlantilla(datos: {
  nombre: string;
  descripcion?: string | null;
  etapas?: EtapaInput[];
}): Promise<Plantilla> {
  const { data } = await client.post<Plantilla>('/pipeline-plantillas', datos);
  return data;
}

export async function actualizarPlantilla(
  id: number,
  cambios: { nombre?: string; descripcion?: string | null },
): Promise<Plantilla> {
  const { data } = await client.patch<Plantilla>(`/pipeline-plantillas/${id}`, cambios);
  return data;
}

export async function eliminarPlantilla(id: number): Promise<void> {
  await client.delete(`/pipeline-plantillas/${id}`);
}

export async function reemplazarEtapasPlantilla(
  id: number,
  etapas: EtapaInput[],
): Promise<Plantilla> {
  const { data } = await client.put<Plantilla>(`/pipeline-plantillas/${id}/etapas`, { etapas });
  return data;
}
