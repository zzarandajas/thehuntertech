import bcrypt from 'bcryptjs';
import Usuario, { RolUsuario } from '../models/Usuario';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

function aPublico(usuario: Usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
    ultimoLogin: usuario.ultimoLogin,
  };
}

export async function listarUsuarios() {
  const usuarios = await Usuario.findAll({ order: [['nombre', 'ASC']] });
  return usuarios.map(aPublico);
}

// Lista mínima de usuarios activos para selectores (asignar socios a un mandato, etc.).
export async function listarUsuariosSeleccionables() {
  const usuarios = await Usuario.findAll({
    where: { activo: true },
    attributes: ['id', 'nombre', 'rol'],
    order: [['nombre', 'ASC']],
  });
  return usuarios;
}

export interface DatosNuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export async function crearUsuario(datos: DatosNuevoUsuario) {
  const existe = await Usuario.findOne({ where: { email: datos.email } });
  if (existe) {
    throw error(409, 'Ya existe un usuario con ese email');
  }
  const passwordHash = await bcrypt.hash(datos.password, 10);
  const usuario = await Usuario.create({
    nombre: datos.nombre,
    email: datos.email,
    passwordHash,
    rol: datos.rol,
  });
  return aPublico(usuario);
}

export interface CambiosUsuario {
  nombre?: string;
  email?: string;
  rol?: RolUsuario;
  activo?: boolean;
  password?: string;
}

export async function actualizarUsuario(id: number, cambios: CambiosUsuario) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw error(404, 'Usuario no encontrado');
  }
  if (cambios.nombre !== undefined) usuario.nombre = cambios.nombre;
  if (cambios.email !== undefined) usuario.email = cambios.email;
  if (cambios.rol !== undefined) usuario.rol = cambios.rol;
  if (cambios.activo !== undefined) usuario.activo = cambios.activo;
  if (cambios.password) usuario.passwordHash = await bcrypt.hash(cambios.password, 10);
  await usuario.save();
  return aPublico(usuario);
}
