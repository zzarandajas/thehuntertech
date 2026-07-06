import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type RolEnProceso = 'lead' | 'soporte';

export class ProcesoConsultor extends Model<
  InferAttributes<ProcesoConsultor>,
  InferCreationAttributes<ProcesoConsultor>
> {
  declare id: CreationOptional<number>;
  declare procesoId: number;
  declare usuarioId: number;
  declare rolEnProceso: RolEnProceso;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProcesoConsultor.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'proceso_id' },
    usuarioId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'usuario_id' },
    rolEnProceso: {
      type: DataTypes.ENUM('lead', 'soporte'),
      allowNull: false,
      field: 'rol_en_proceso',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'proceso_consultores',
    modelName: 'ProcesoConsultor',
    indexes: [{ unique: true, fields: ['proceso_id', 'usuario_id'] }],
  },
);

export default ProcesoConsultor;
