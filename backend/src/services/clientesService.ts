import { Cliente, ClienteContacto } from '../models';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

export async function listarClientes() {
  return Cliente.findAll({ order: [['nombre', 'ASC']] });
}

export async function obtenerCliente(id: number) {
  const cliente = await Cliente.findByPk(id, {
    include: [{ model: ClienteContacto, as: 'contactos' }],
  });
  if (!cliente) {
    throw error(404, 'Cliente no encontrado');
  }
  return cliente;
}

export interface DatosCliente {
  nombre: string;
  logoUrl?: string | null;
  sector?: string | null;
  notas?: string | null;
  activo?: boolean;
}

export async function crearCliente(datos: DatosCliente) {
  return Cliente.create({
    nombre: datos.nombre,
    logoUrl: datos.logoUrl ?? null,
    sector: datos.sector ?? null,
    notas: datos.notas ?? null,
    activo: datos.activo ?? true,
  });
}

export async function actualizarCliente(id: number, cambios: Partial<DatosCliente>) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    throw error(404, 'Cliente no encontrado');
  }
  if (cambios.nombre !== undefined) cliente.nombre = cambios.nombre;
  if (cambios.logoUrl !== undefined) cliente.logoUrl = cambios.logoUrl;
  if (cambios.sector !== undefined) cliente.sector = cambios.sector;
  if (cambios.notas !== undefined) cliente.notas = cambios.notas;
  if (cambios.activo !== undefined) cliente.activo = cambios.activo;
  await cliente.save();
  return cliente;
}

async function asegurarCliente(clienteId: number) {
  const cliente = await Cliente.findByPk(clienteId);
  if (!cliente) {
    throw error(404, 'Cliente no encontrado');
  }
  return cliente;
}

export async function listarContactos(clienteId: number) {
  await asegurarCliente(clienteId);
  return ClienteContacto.findAll({
    where: { clienteId },
    order: [['nombre', 'ASC']],
  });
}

export interface DatosContacto {
  nombre: string;
  email: string;
  cargo?: string | null;
}

export async function crearContacto(clienteId: number, datos: DatosContacto) {
  await asegurarCliente(clienteId);
  return ClienteContacto.create({
    clienteId,
    nombre: datos.nombre,
    email: datos.email,
    cargo: datos.cargo ?? null,
  });
}
