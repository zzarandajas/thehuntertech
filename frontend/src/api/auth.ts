import client from './client';

export type RolUsuario = 'admin' | 'consultor';

export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioPublico;
}

export async function apiLogin(email: string, password: string): Promise<RespuestaLogin> {
  const { data } = await client.post<RespuestaLogin>('/auth/login', { email, password });
  return data;
}

export async function apiMe(): Promise<UsuarioPublico> {
  const { data } = await client.get<UsuarioPublico>('/auth/me');
  return data;
}
