import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class CandidatoSkill extends Model<
  InferAttributes<CandidatoSkill>,
  InferCreationAttributes<CandidatoSkill>
> {
  declare id: CreationOptional<number>;
  declare candidatoId: number;
  declare skillId: number;
  declare nivel: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoSkill.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    candidatoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'candidato_id' },
    skillId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'skill_id' },
    nivel: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'candidato_skills',
    modelName: 'CandidatoSkill',
    indexes: [{ unique: true, fields: ['candidato_id', 'skill_id'] }],
  },
);

export default CandidatoSkill;
