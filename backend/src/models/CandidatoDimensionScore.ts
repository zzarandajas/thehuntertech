import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class CandidatoDimensionScore extends Model<
  InferAttributes<CandidatoDimensionScore>,
  InferCreationAttributes<CandidatoDimensionScore>
> {
  declare id: CreationOptional<number>;
  declare procesoCandidatoId: number;
  declare dimensionId: number;
  declare score: number;
  declare comentario: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoDimensionScore.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoCandidatoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'proceso_candidato_id',
    },
    dimensionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'dimension_id' },
    // Validación de rango a nivel de modelo (no confiar solo en el frontend).
    score: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 100 } },
    comentario: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'candidato_dimension_scores',
    modelName: 'CandidatoDimensionScore',
    indexes: [{ unique: true, fields: ['proceso_candidato_id', 'dimension_id'] }],
  },
);

export default CandidatoDimensionScore;
