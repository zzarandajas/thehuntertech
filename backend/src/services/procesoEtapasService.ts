import { Transaction } from 'sequelize';
import {
  sequelize,
  ProcesoSeleccion,
  ProcesoEtapa,
  ProcesoCandidato,
  PipelinePlantilla,
  PipelinePlantillaEtapa,
} from '../models';
import { ETAPAS_PIPELINE_DEFAULT } from '../constants/etapasPipeline';

interface ErrorConEstado extends Error {
  status?: number;
}

function error(status: number, mensaje: string): ErrorConEstado {
  const e: ErrorConEstado = new Error(mensaje);
  e.status = status;
  return e;
}

async function asegurarProceso(procesoId: number) {
  const proceso = await ProcesoSeleccion.findByPk(procesoId);
  if (!proceso) {
    throw error(404, 'Mandato no encontrado');
  }
  return proceso;
}

export async function obtenerEtapasProceso(procesoId: number) {
  await asegurarProceso(procesoId);
  return ProcesoEtapa.findAll({ where: { procesoId }, order: [['orden', 'ASC']] });
}

// Copia las etapas de una plantilla (o la plantilla por defecto, o el set por
// defecto embebido como último recurso) al mandato indicado. Se llama al crear
// el mandato. Devuelve las etapas creadas.
export async function copiarEtapasDePlantilla(
  procesoId: number,
  plantillaId?: number,
  transaction?: Transaction,
) {
  let plantilla: PipelinePlantilla | null = null;
  if (plantillaId) {
    plantilla = await PipelinePlantilla.findByPk(plantillaId, {
      include: [{ model: PipelinePlantillaEtapa, as: 'etapas' }],
      transaction,
    });
  }
  if (!plantilla) {
    plantilla = await PipelinePlantilla.findOne({
      where: { esDefault: true },
      include: [{ model: PipelinePlantillaEtapa, as: 'etapas' }],
      transaction,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const etapasPlantilla: any[] = (plantilla as any)?.etapas ?? [];
  const fuente = etapasPlantilla.length
    ? [...etapasPlantilla]
        .sort((a, b) => a.orden - b.orden)
        .map((e) => ({ nombre: e.nombre, color: e.color, esFinal: e.esFinal }))
    : ETAPAS_PIPELINE_DEFAULT;

  return ProcesoEtapa.bulkCreate(
    fuente.map((e, i) => ({
      procesoId,
      nombre: e.nombre,
      orden: i,
      color: e.color,
      esFinal: e.esFinal,
    })),
    { transaction },
  );
}

export interface EtapaProcesoInput {
  id?: number;
  nombre: string;
  color?: string;
  esFinal?: boolean;
}

// Reemplaza el conjunto de etapas de un mandato conservando los ids de las
// etapas que se mantienen (para no romper las referencias de los candidatos).
// Regla de borrado: los candidatos de una etapa eliminada pasan a la primera
// etapa del nuevo conjunto.
export async function reemplazarEtapasProceso(procesoId: number, etapas: EtapaProcesoInput[]) {
  await asegurarProceso(procesoId);
  if (!Array.isArray(etapas) || etapas.length === 0) {
    throw error(400, 'El mandato debe tener al menos una etapa');
  }

  await sequelize.transaction(async (t) => {
    const actuales = await ProcesoEtapa.findAll({ where: { procesoId }, transaction: t });
    const actualesById = new Map(actuales.map((e) => [e.id, e]));
    const idsConservados = new Set(
      etapas.filter((e) => e.id && actualesById.has(e.id)).map((e) => e.id as number),
    );

    // 1. Upsert en el orden recibido.
    const resultantes: ProcesoEtapa[] = [];
    for (const [i, e] of etapas.entries()) {
      if (e.id && actualesById.has(e.id)) {
        const row = actualesById.get(e.id)!;
        row.nombre = e.nombre;
        row.orden = i;
        if (e.color !== undefined) row.color = e.color;
        row.esFinal = e.esFinal ?? false;
        await row.save({ transaction: t });
        resultantes.push(row);
      } else {
        const row = await ProcesoEtapa.create(
          {
            procesoId,
            nombre: e.nombre,
            orden: i,
            color: e.color ?? '#64748b',
            esFinal: e.esFinal ?? false,
          },
          { transaction: t },
        );
        resultantes.push(row);
      }
    }

    const primera = resultantes[0];

    // 2. Etapas eliminadas → mover sus candidatos a la primera etapa y borrar.
    const eliminadas = actuales.filter((e) => !idsConservados.has(e.id));
    for (const del of eliminadas) {
      await ProcesoCandidato.update(
        { etapaId: primera.id, etapaActualizadaAt: new Date() },
        { where: { etapaId: del.id }, transaction: t },
      );
      await del.destroy({ transaction: t });
    }
  });

  return obtenerEtapasProceso(procesoId);
}
