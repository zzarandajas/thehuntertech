import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type EtapaPipeline =
  | 'sourcing'
  | 'longlist'
  | 'shortlist'
  | 'presentado'
  | 'entrevista_cliente'
  | 'oferta'
  | 'contratado'
  | 'descartado';

export class ProcesoCandidato extends Model<
  InferAttributes<ProcesoCandidato>,
  InferCreationAttributes<ProcesoCandidato>
> {
  declare id: CreationOptional<number>;
  declare procesoId: number;
  declare candidatoId: number;
  declare orden: CreationOptional<number>;
  declare etapa: CreationOptional<EtapaPipeline>;
  declare posicionActualSnapshot: CreationOptional<string | null>;
  declare expectativaSalarial: CreationOptional<string | null>;
  declare fechaIncorporacion: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProcesoCandidato.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'proceso_id' },
    candidatoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'candidato_id' },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    etapa: {
      type: DataTypes.ENUM(
        'sourcing',
        'longlist',
        'shortlist',
        'presentado',
        'entrevista_cliente',
        'oferta',
        'contratado',
        'descartado',
      ),
      allowNull: false,
      defaultValue: 'sourcing',
    },
    posicionActualSnapshot: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'posicion_actual_snapshot',
    },
    expectativaSalarial: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'expectativa_salarial',
    },
    fechaIncorporacion: { type: DataTypes.DATE, allowNull: true, field: 'fecha_incorporacion' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'proceso_candidatos',
    modelName: 'ProcesoCandidato',
    indexes: [{ unique: true, fields: ['proceso_id', 'candidato_id'] }],
  },
);

export default ProcesoCandidato;
