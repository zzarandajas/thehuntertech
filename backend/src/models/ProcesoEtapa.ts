import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

// Etapa propia de un mandato. Se crea copiando la plantilla elegida al crear el
// mandato, y luego es editable de forma independiente (personalización por
// mandato). Los ProcesoCandidato apuntan a estas etapas vía etapaId.
export class ProcesoEtapa extends Model<
  InferAttributes<ProcesoEtapa>,
  InferCreationAttributes<ProcesoEtapa>
> {
  declare id: CreationOptional<number>;
  declare procesoId: number;
  declare nombre: string;
  declare orden: CreationOptional<number>;
  declare color: CreationOptional<string>;
  declare esFinal: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProcesoEtapa.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'proceso_id',
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
  { sequelize, tableName: 'proceso_etapas', modelName: 'ProcesoEtapa' },
);

export default ProcesoEtapa;
