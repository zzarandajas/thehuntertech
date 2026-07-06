import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class CandidatoExperiencia extends Model<
  InferAttributes<CandidatoExperiencia>,
  InferCreationAttributes<CandidatoExperiencia>
> {
  declare id: CreationOptional<number>;
  declare candidatoId: number;
  declare empresa: string;
  declare cargo: CreationOptional<string | null>;
  declare periodo: CreationOptional<string | null>;
  declare descripcion: CreationOptional<string | null>;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoExperiencia.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    candidatoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'candidato_id' },
    empresa: { type: DataTypes.STRING, allowNull: false },
    cargo: { type: DataTypes.STRING, allowNull: true },
    periodo: { type: DataTypes.STRING, allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'candidato_experiencias', modelName: 'CandidatoExperiencia' },
);

export default CandidatoExperiencia;
