import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

// Etapa "maestra" de una plantilla de pipeline. Nombre + orden + color.
export class PipelinePlantillaEtapa extends Model<
  InferAttributes<PipelinePlantillaEtapa>,
  InferCreationAttributes<PipelinePlantillaEtapa>
> {
  declare id: CreationOptional<number>;
  declare plantillaId: number;
  declare nombre: string;
  declare orden: CreationOptional<number>;
  declare color: CreationOptional<string>;
  declare esFinal: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PipelinePlantillaEtapa.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    plantillaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'plantilla_id',
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    color: { type: DataTypes.STRING, allowNull: false, defaultValue: '#64748b' },
    esFinal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'es_final',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'pipeline_plantilla_etapas',
    modelName: 'PipelinePlantillaEtapa',
  },
);

export default PipelinePlantillaEtapa;
