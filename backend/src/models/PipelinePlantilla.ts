import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

// Plantilla de pipeline: conjunto reutilizable de etapas. Al asignarse a un
// mandato se COPIAN sus etapas (ver ProcesoEtapa), no se enlazan en vivo.
export class PipelinePlantilla extends Model<
  InferAttributes<PipelinePlantilla>,
  InferCreationAttributes<PipelinePlantilla>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare descripcion: CreationOptional<string | null>;
  declare esDefault: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PipelinePlantilla.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    esDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'es_default',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'pipeline_plantillas', modelName: 'PipelinePlantilla' },
);

export default PipelinePlantilla;
