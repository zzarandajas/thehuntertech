import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type TipoTarea = 'llamada' | 'email' | 'entrevista' | 'seguimiento' | 'otro';

// Tarea / recordatorio del consultor. Puede colgar (opcionalmente) de un mandato,
// candidato, cliente o de una participación concreta del pipeline.
export class Tarea extends Model<InferAttributes<Tarea>, InferCreationAttributes<Tarea>> {
  declare id: CreationOptional<number>;
  declare titulo: string;
  declare descripcion: CreationOptional<string | null>;
  declare tipo: CreationOptional<TipoTarea>;
  declare dueAt: CreationOptional<Date | null>;
  declare completadaAt: CreationOptional<Date | null>;
  declare asignadoA: number;
  declare creadoPor: number;
  declare procesoId: CreationOptional<number | null>;
  declare candidatoId: CreationOptional<number | null>;
  declare clienteId: CreationOptional<number | null>;
  declare procesoCandidatoId: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Tarea.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    tipo: {
      type: DataTypes.ENUM('llamada', 'email', 'entrevista', 'seguimiento', 'otro'),
      allowNull: false,
      defaultValue: 'seguimiento',
    },
    dueAt: { type: DataTypes.DATE, allowNull: true, field: 'due_at' },
    completadaAt: { type: DataTypes.DATE, allowNull: true, field: 'completada_at' },
    asignadoA: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'asignado_a' },
    creadoPor: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'creado_por' },
    procesoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'proceso_id' },
    candidatoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'candidato_id' },
    clienteId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'cliente_id' },
    procesoCandidatoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'proceso_candidato_id',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'tareas', modelName: 'Tarea' },
);

export default Tarea;
