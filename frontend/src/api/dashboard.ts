import client from './client';

export interface DashboardStats {
  mandatos: { activos: number; cerrados: number; archivados: number };
  totalCandidatos: number;
  porVertical: { vertical: string; total: number }[];
  tiempoMedioCierreDias: number;
}

export async function obtenerStats(): Promise<DashboardStats> {
  const { data } = await client.get<DashboardStats>('/dashboard/stats');
  return data;
}
