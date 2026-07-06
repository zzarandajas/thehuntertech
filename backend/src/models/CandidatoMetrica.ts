import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class CandidatoMetrica extends Model<
  InferAttributes<CandidatoMetrica>,
  InferCreationAttributes<CandidatoMetrica>
> {
  declare id: CreationOptional<number>;
  declare procesoCandidatoId: number;
  declare valor: string;
  declare descripcion: string;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoMetrica.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoCandidatoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'proceso_candidato_id',
    },
    valor: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'candidato_metricas', modelName: 'CandidatoMetrica' },
);

export default CandidatoMetrica;
