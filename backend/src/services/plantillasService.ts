import { sequelize, PipelinePlantilla, PipelinePlantillaEtapa } from '../models';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

const includeEtapas = {
  model: PipelinePlantillaEtapa,
  as: 'etapas',
} as const;

const ordenEtapas = [[{ model: PipelinePlantillaEtapa, as: 'etapas' }, 'orden', 'ASC']] as const;

export interface EtapaInput {
  nombre: string;
  color?: string;
  esFinal?: boolean;
}

export async function listarPlantillas() {
  return PipelinePlantilla.findAll({
    include: [includeEtapas],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: [['nombre', 'ASC'], ...(ordenEtapas as any)],
  });
}

export async function obtenerPlantilla(id: number) {
  const plantilla = await PipelinePlantilla.findByPk(id, {
    include: [includeEtapas],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: ordenEtapas as any,
  });
  if (!plantilla) {
    throw error(404, 'Plantilla no encontrada');
  }
  return plantilla;
}

export interface DatosPlantilla {
  nombre: string;
  descripcion?: string | null;
  etapas?: EtapaInput[];
}

export async function crearPlantilla(datos: DatosPlantilla) {
  if (!datos.nombre?.trim()) {
    throw error(400, 'El nombre es obligatorio');
  }
  return sequelize.transaction(async (t) => {
    const plantilla = await PipelinePlantilla.create(
      { nombre: datos.nombre.trim(), descripcion: datos.descripcion ?? null },
      { transaction: t },
    );
    const etapas = datos.etapas ?? [];
    if (etapas.length) {
      await PipelinePlantillaEtapa.bulkCreate(
        etapas.map((e, i) => ({
          plantillaId: plantilla.id,
          nombre: e.nombre,
          orden: i,
          color: e.color ?? '#64748b',
          esFinal: e.esFinal ?? false,
        })),
        { transaction: t },
      );
    }
    return plantilla.id;
  }).then((idNueva) => obtenerPlantilla(idNueva));
}

export async function actualizarPlantilla(
  id: number,
  cambios: { nombre?: string; descripcion?: string | null },
) {
  const plantilla = await PipelinePlantilla.findByPk(id);
  if (!plantilla) {
    throw error(404, 'Plantilla no encontrada');
  }
  if (cambios.nombre !== undefined) plantilla.nombre = cambios.nombre;
  if (cambios.descripcion !== undefined) plantilla.descripcion = cambios.descripcion;
  await plantilla.save();
  return obtenerPlantilla(id);
}

export async function eliminarPlantilla(id: number) {
  const plantilla = await PipelinePlantilla.findByPk(id);
  if (!plantilla) {
    throw error(404, 'Plantilla no encontrada');
  }
  if (plantilla.esDefault) {
    throw error(400, 'No se puede eliminar la plantilla por defecto');
  }
  await plantilla.destroy();
  return { ok: true };
}

// Reemplaza el conjunto de etapas de una plantilla (el orden lo da el array).
// Las etapas maestras no las referencia nadie, así que basta destroy + recreate.
export async function reemplazarEtapasPlantilla(id: number, etapas: EtapaInput[]) {
  const plantilla = await PipelinePlantilla.findByPk(id);
  if (!plantilla) {
    throw error(404, 'Plantilla no encontrada');
  }
  if (!Array.isArray(etapas) || etapas.length === 0) {
    throw error(400, 'La plantilla debe tener al menos una etapa');
  }
  await sequelize.transaction(async (t) => {
    await PipelinePlantillaEtapa.destroy({ where: { plantillaId: id }, transaction: t });
    await PipelinePlantillaEtapa.bulkCreate(
      etapas.map((e, i) => ({
        plantillaId: id,
        nombre: e.nombre,
        orden: i,
        color: e.color ?? '#64748b',
        esFinal: e.esFinal ?? false,
      })),
      { transaction: t },
    );
  });
  return obtenerPlantilla(id);
}
