import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class DimensionCatalogo extends Model<
  InferAttributes<DimensionCatalogo>,
  InferCreationAttributes<DimensionCatalogo>
> {
  declare id: CreationOptional<number>;
  declare codigo: string;
  declare nombre: string;
  declare descripcion: CreationOptional<string | null>;
  declare categoria: CreationOptional<string | null>;
  declare orden: CreationOptional<number>;
  declare activo: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DimensionCatalogo.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    categoria: { type: DataTypes.STRING, allowNull: true },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'dimension_catalogos', modelName: 'DimensionCatalogo' },
);

export default DimensionCatalogo;
