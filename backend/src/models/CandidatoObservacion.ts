import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type TipoObservacion = 'fortaleza' | 'punto_explorar';

export class CandidatoObservacion extends Model<
  InferAttributes<CandidatoObservacion>,
  InferCreationAttributes<CandidatoObservacion>
> {
  declare id: CreationOptional<number>;
  declare procesoCandidatoId: number;
  declare tipo: TipoObservacion;
  declare texto: string;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoObservacion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoCandidatoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'proceso_candidato_id',
    },
    tipo: { type: DataTypes.ENUM('fortaleza', 'punto_explorar'), allowNull: false },
    texto: { type: DataTypes.TEXT, allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'candidato_observaciones', modelName: 'CandidatoObservacion' },
);

export default CandidatoObservacion;
