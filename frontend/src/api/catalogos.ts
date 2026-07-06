import client from './client';

export interface Dimension {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  orden: number;
  activo: boolean;
}

export interface Vertical {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Skill {
  id: number;
  nombre: string;
  categoria: string | null;
  activo: boolean;
}

export interface Origen {
  id: number;
  nombre: string;
  activo: boolean;
}

export async function listarCatalogo<T>(ruta: string): Promise<T[]> {
  const { data } = await client.get<T[]>(`/${ruta}`);
  return data;
}

export async function crearCatalogo<T>(ruta: string, datos: Record<string, unknown>): Promise<T> {
  const { data } = await client.post<T>(`/${ruta}`, datos);
  return data;
}

export async function actualizarCatalogo<T>(
  ruta: string,
  id: number,
  cambios: Record<string, unknown>,
): Promise<T> {
  const { data } = await client.patch<T>(`/${ruta}/${id}`, cambios);
  return data;
}
