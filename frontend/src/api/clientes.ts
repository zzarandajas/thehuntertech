import client from './client';

export interface Cliente {
  id: number;
  nombre: string;
  logoUrl: string | null;
  sector: string | null;
  notas: string | null;
  activo: boolean;
}

export interface ClienteContacto {
  id: number;
  clienteId: number;
  nombre: string;
  email: string;
  cargo: string | null;
}

export interface ClienteDetalle extends Cliente {
  contactos: ClienteContacto[];
}

export type DatosCliente = Partial<Omit<Cliente, 'id'>> & { nombre: string };
export type DatosContacto = { nombre: string; email: string; cargo?: string | null };

export async function listarClientes(): Promise<Cliente[]> {
  const { data } = await client.get<Cliente[]>('/clientes');
  return data;
}

export async function obtenerCliente(id: number): Promise<ClienteDetalle> {
  const { data } = await client.get<ClienteDetalle>(`/clientes/${id}`);
  return data;
}

export async function crearCliente(datos: DatosCliente): Promise<Cliente> {
  const { data } = await client.post<Cliente>('/clientes', datos);
  return data;
}

export async function actualizarCliente(
  id: number,
  cambios: Partial<DatosCliente>,
): Promise<Cliente> {
  const { data } = await client.patch<Cliente>(`/clientes/${id}`, cambios);
  return data;
}

export async function crearContacto(
  clienteId: number,
  datos: DatosContacto,
): Promise<ClienteContacto> {
  const { data } = await client.post<ClienteContacto>(`/clientes/${clienteId}/contactos`, datos);
  return data;
}
