import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class InformeShareLink extends Model<
  InferAttributes<InformeShareLink>,
  InferCreationAttributes<InformeShareLink>
> {
  declare id: CreationOptional<number>;
  declare informeId: number;
  declare token: string;
  declare expiresAt: Date;
  declare creadoPor: number;
  declare revocado: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

InformeShareLink.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    informeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'informe_id' },
    token: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    creadoPor: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'creado_por' },
    revocado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'informe_share_links', modelName: 'InformeShareLink' },
);

export default InformeShareLink;
