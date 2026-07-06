import client from './client';

export type RolUsuario = 'admin' | 'consultor';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  ultimoLogin: string | null;
}

export interface DatosNuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export interface UsuarioSeleccionable {
  id: number;
  nombre: string;
  rol: RolUsuario;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await client.get<Usuario[]>('/usuarios');
  return data;
}

export async function listarUsuariosSeleccionables(): Promise<UsuarioSeleccionable[]> {
  const { data } = await client.get<UsuarioSeleccionable[]>('/usuarios/seleccionables');
  return data;
}

export async function crearUsuario(datos: DatosNuevoUsuario): Promise<Usuario> {
  const { data } = await client.post<Usuario>('/usuarios', datos);
  return data;
}

export async function actualizarUsuario(
  id: number,
  cambios: Record<string, unknown>,
): Promise<Usuario> {
  const { data } = await client.patch<Usuario>(`/usuarios/${id}`, cambios);
  return data;
}
