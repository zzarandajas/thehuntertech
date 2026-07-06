import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-inseguro';
const OPCIONES_JWT: jwt.SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES || '8h') as jwt.SignOptions['expiresIn'],
};

export interface DatosLogin {
  email: string;
  password: string;
}

export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

// Error de autenticación con código HTTP asociado (lo traduce el errorHandler).
export class ErrorAuth extends Error {
  status: number;
  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

function aPublico(usuario: Usuario): UsuarioPublico {
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

export async function login({ email, password }: DatosLogin) {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario || !usuario.activo) {
    throw new ErrorAuth(401, 'Credenciales inválidas');
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    throw new ErrorAuth(401, 'Credenciales inválidas');
  }

  usuario.ultimoLogin = new Date();
  await usuario.save();

  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, JWT_SECRET, OPCIONES_JWT);
  return { token, usuario: aPublico(usuario) };
}

export async function obtenerUsuarioAutenticado(id: number): Promise<UsuarioPublico> {
  const usuario = await Usuario.findByPk(id);
  if (!usuario || !usuario.activo) {
    throw new ErrorAuth(401, 'No autorizado');
  }
  return aPublico(usuario);
}
