import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type RolUsuario = 'admin' | 'consultor';

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: string;
  declare passwordHash: string;
  declare rol: RolUsuario;
  declare activo: CreationOptional<boolean>;
  declare ultimoLogin: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Usuario.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
    rol: {
      type: DataTypes.ENUM('admin', 'consultor'),
      allowNull: false,
      defaultValue: 'consultor',
    },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ultimoLogin: { type: DataTypes.DATE, allowNull: true, field: 'ultimo_login' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'usuarios',
    modelName: 'Usuario',
  },
);

export default Usuario;
