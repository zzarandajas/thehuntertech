import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SnapshotInforme = Record<string, any>;

export class Informe extends Model<InferAttributes<Informe>, InferCreationAttributes<Informe>> {
  declare id: CreationOptional<number>;
  declare procesoId: number;
  declare version: number;
  declare generadoPor: number;
  declare fechaGeneracion: CreationOptional<Date>;
  declare snapshotJson: SnapshotInforme;
  declare pdfPath: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Informe.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    procesoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'proceso_id' },
    version: { type: DataTypes.INTEGER, allowNull: false },
    generadoPor: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'generado_por' },
    fechaGeneracion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_generacion',
    },
    snapshotJson: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'snapshot_json',
      // En MariaDB (y otras variantes) el tipo JSON es un alias de LONGTEXT, por lo que
      // Sequelize no lo parsea al leer y devuelve un string. Normalizamos aquí para que
      // el resto de la app (vista web, PDF, enlace público) reciba siempre un objeto.
      get() {
        const raw = this.getDataValue('snapshotJson');
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
        return raw;
      },
    },
    pdfPath: { type: DataTypes.STRING, allowNull: true, field: 'pdf_path' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'informes',
    modelName: 'Informe',
    indexes: [{ unique: true, fields: ['proceso_id', 'version'] }],
  },
);

export default Informe;
