import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type TipoInteraccion = 'llamada' | 'email' | 'reunion' | 'nota' | 'linkedin';

export class CandidatoInteraccion extends Model<
  InferAttributes<CandidatoInteraccion>,
  InferCreationAttributes<CandidatoInteraccion>
> {
  declare id: CreationOptional<number>;
  declare candidatoId: number;
  declare usuarioId: number;
  declare tipo: TipoInteraccion;
  declare fecha: CreationOptional<Date>;
  declare resumen: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CandidatoInteraccion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    candidatoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'candidato_id' },
    usuarioId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'usuario_id' },
    tipo: {
      type: DataTypes.ENUM('llamada', 'email', 'reunion', 'nota', 'linkedin'),
      allowNull: false,
    },
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    resumen: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'candidato_interacciones', modelName: 'CandidatoInteraccion' },
);

export default CandidatoInteraccion;
