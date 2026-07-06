import client from './client';

export interface SnapshotCandidato {
  nombre: string;
  etapa: string;
  posicionActualSnapshot: string | null;
  expectativaSalarial: string | null;
  scores: { dimension: string; score: number; comentario: string | null }[];
  metricas: { valor: string; descripcion: string }[];
  observaciones: { fortalezas: string[]; puntosExplorar: string[] };
}

export interface SnapshotInforme {
  proceso: { titulo: string; confidencialidad: string; cliente: string; vertical: string };
  dimensiones: { id: number; nombre: string }[];
  candidatos: SnapshotCandidato[];
  generadoEl: string;
}

export interface ShareLink {
  id: number;
  informeId: number;
  token: string;
  expiresAt: string;
  revocado: boolean;
}

export interface Informe {
  id: number;
  procesoId: number;
  version: number;
  fechaGeneracion: string;
  snapshotJson: SnapshotInforme;
  generador?: { id: number; nombre: string };
  shareLinks?: ShareLink[];
}

export interface InformeResumen {
  id: number;
  version: number;
  fechaGeneracion: string;
  generador?: { id: number; nombre: string };
}

export async function generarInforme(procesoId: number): Promise<Informe> {
  const { data } = await client.post<Informe>(`/procesos/${procesoId}/informes/generar`);
  return data;
}

export async function listarInformes(procesoId: number): Promise<InformeResumen[]> {
  const { data } = await client.get<InformeResumen[]>(`/procesos/${procesoId}/informes`);
  return data;
}

export async function obtenerInforme(id: number): Promise<Informe> {
  const { data } = await client.get<Informe>(`/informes/${id}`);
  return data;
}

export async function crearShareLink(informeId: number, expiresInDays = 30): Promise<ShareLink> {
  const { data } = await client.post<ShareLink>(`/informes/${informeId}/share-links`, {
    expiresInDays,
  });
  return data;
}

export async function revocarShareLink(id: number): Promise<ShareLink> {
  const { data } = await client.patch<ShareLink>(`/share-links/${id}/revocar`);
  return data;
}

// Descarga el PDF (con auth) y dispara la descarga en el navegador.
export async function descargarPdf(informeId: number, nombre: string): Promise<void> {
  const resp = await client.get(`/informes/${informeId}/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(resp.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

// Vista pública (sin autenticación).
export async function obtenerInformePublico(
  token: string,
): Promise<{ version: number; fechaGeneracion: string; snapshot: SnapshotInforme }> {
  const resp = await fetch(`/public/informes/${token}`);
  if (!resp.ok) {
    const cuerpo = await resp.json().catch(() => ({}));
    throw new Error(cuerpo.mensaje || 'No se pudo cargar el informe');
  }
  return resp.json();
}
