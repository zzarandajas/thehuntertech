import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export class ClienteContacto extends Model<
  InferAttributes<ClienteContacto>,
  InferCreationAttributes<ClienteContacto>
> {
  declare id: CreationOptional<number>;
  declare clienteId: number;
  declare nombre: string;
  declare email: string;
  declare cargo: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ClienteContacto.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    clienteId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'cliente_id' },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
    cargo: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'cliente_contactos', modelName: 'ClienteContacto' },
);

export default ClienteContacto;
