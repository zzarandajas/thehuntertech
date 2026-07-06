import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type EstadoProceso = 'abierto' | 'cerrado' | 'archivado';

// Modelo técnico "ProcesoSeleccion"; en la UI se muestra como "Mandato".
export class ProcesoSeleccion extends Model<
  InferAttributes<ProcesoSeleccion>,
  InferCreationAttributes<ProcesoSeleccion>
> {
  declare id: CreationOptional<number>;
  declare clienteId: number;
  declare verticalId: number;
  declare titulo: string;
  declare confidencialidad: CreationOptional<string>;
  declare estado: CreationOptional<EstadoProceso>;
  declare anonimizarNombres: CreationOptional<boolean>;
  declare createdBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProcesoSeleccion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    clienteId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'cliente_id' },
    verticalId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'vertical_id' },
    titulo: { type: DataTypes.STRING, allowNull: false },
    confidencialidad: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Uso exclusivo del Board del Cliente',
    },
    estado: {
      type: DataTypes.ENUM('abierto', 'cerrado', 'archivado'),
      allowNull: false,
      defaultValue: 'abierto',
    },
    anonimizarNombres: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'anonimizar_nombres',
    },
    createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'created_by' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'procesos', modelName: 'ProcesoSeleccion' },
);

export default ProcesoSeleccion;
