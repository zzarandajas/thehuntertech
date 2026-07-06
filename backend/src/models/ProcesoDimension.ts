import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class ProcesoDimension extends Model<
  InferAttributes<ProcesoDimension>,
  InferCreationAttributes<ProcesoDimension>
> {
  declare id: CreationOptional<number>;
  declare procesoId: number;
  declare dimensionId: number;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProcesoDimension.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'proceso_id' },
    dimensionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'dimension_id' },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'proceso_dimensiones',
    modelName: 'ProcesoDimension',
    indexes: [{ unique: true, fields: ['proceso_id', 'dimension_id'] }],
  },
);

export default ProcesoDimension;
