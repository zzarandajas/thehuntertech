import { Model, ModelStatic } from 'sequelize';
import DimensionCatalogo from '../models/DimensionCatalogo';
import Vertical from '../models/Vertical';
import Skill from '../models/Skill';
import OrigenCandidato from '../models/OrigenCandidato';

interface ErrorConEstado extends Error {
  status?: number;
}

// CRUD genérico para catálogos simples (listar / crear / actualizar).
function crudCatalogo<M extends Model>(modelo: ModelStatic<M>, ordenPor: string) {
  return {
    listar: () => modelo.findAll({ order: [[ordenPor, 'ASC']] }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    crear: (datos: Record<string, any>) => modelo.create(datos as any),

    actualizar: async (id: number, cambios: Record<string, unknown>) => {
      const item = await modelo.findByPk(id);
      if (!item) {
        const e: ErrorConEstado = new Error('Elemento de catálogo no encontrado');
        e.status = 404;
        throw e;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await item.update(cambios as any);
      return item;
    },
  };
}

export const dimensiones = crudCatalogo(DimensionCatalogo, 'orden');
export const verticales = crudCatalogo(Vertical, 'nombre');
export const skills = crudCatalogo(Skill, 'nombre');
export const origenes = crudCatalogo(OrigenCandidato, 'nombre');
