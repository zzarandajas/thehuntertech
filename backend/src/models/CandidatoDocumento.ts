import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type TipoDocumento = 'cv' | 'otro';

export class CandidatoDocumento extends Model<
  InferAttributes<CandidatoDocumento>,
  InferCreationAttributes<CandidatoDocumento>
> {
  declare id: CreationOptional<number>;
  declare candidatoId: number;
  declare tipo: CreationOptional<TipoDocumento>;
  declare nombreArchivo: string;
  declare path: string;
  declare subidoPor: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoDocumento.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    candidatoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'candidato_id' },
    tipo: { type: DataTypes.ENUM('cv', 'otro'), allowNull: false, defaultValue: 'otro' },
    nombreArchivo: { type: DataTypes.STRING, allowNull: false, field: 'nombre_archivo' },
    path: { type: DataTypes.STRING, allowNull: false },
    subidoPor: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'subido_por' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'candidato_documentos', modelName: 'CandidatoDocumento' },
);

export default CandidatoDocumento;
